package main

import (
	"io/ioutil"
	"runtime"
	"time"

	"tweek-gateway/appConfig"
	"tweek-gateway/security"

	minio "github.com/minio/minio-go"
	nats "github.com/nats-io/go-nats"
	"github.com/sirupsen/logrus"
)

type authorizerInitializer func(*appConfig.Security) (security.Authorizer, error)

func initAuthorizer(cfg *appConfig.Security) (security.Authorizer, error) {
	initial, err := setupAuthorizer(cfg)
	if err != nil {
		return nil, err
	}

	synchronized := security.NewSynchronizedAuthorizer(initial)
	nc, err := nats.Connect(cfg.PolicyStorage.NatsEndpoint)
	if err != nil {
		return nil, err
	}
	subscription, err := nc.Subscribe("version", refreshAuthorizer(cfg, synchronized))
	if err != nil {
		return nil, err
	}
	runtime.SetFinalizer(synchronized, func(s interface{}) {
		if subscription != nil && subscription.IsValid() {
			subscription.Unsubscribe()
		}
	})

	return synchronized, nil
}

func setupAuthorizer(cfg *appConfig.Security) (security.Authorizer, error) {
	policyStorage := cfg.PolicyStorage
	client, err := minio.New(policyStorage.MinioEndpoint, policyStorage.MinioAccessKey, policyStorage.MinioSecretKey, policyStorage.MinioUseSSL)
	if err != nil {
		return nil, err
	}

	rules, err := ioutil.ReadFile("./authorization.rego")
	if err != nil {
		return nil, err
	}

	reader, err := client.GetObject(policyStorage.MinioBucketName, "security/global-policy.json", minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	defer reader.Close()

	data, err := ioutil.ReadAll(reader)
	if err != nil {
		return nil, err
	}
	return security.NewDefaultAuthorizer(string(rules), string(data), "authorization", "authorize"), nil
}

func refreshAuthorizer(cfg *appConfig.Security, authorizer *security.SynchronizedAuthorizer) nats.MsgHandler {
	return nats.MsgHandler(func(msg *nats.Msg) {
		defer func() {
			if r := recover(); r != nil {
				logrus.WithField(logrus.ErrorKey, r).Warning("Failed to refresh authorizer")
			}
		}()

		newAuthorizer, err := setupAuthorizer(cfg)
		if err == nil {
			authorizer.Update(newAuthorizer)
		} else {
			logrus.WithError(err).Error("Error updating authorizer")
		}
	})
}

func withRetry(times int, sleepDuration time.Duration, action authorizerInitializer, arg *appConfig.Security) (security.Authorizer, error) {
	var res security.Authorizer
	var err error
	for i := 0; i < times; i++ {
		res, err = action(arg)
		if err == nil {
			return res, nil
		}
		logrus.WithError(err).Error("Error creating authorizer, retrying...")
		time.Sleep(sleepDuration)
	}
	return nil, err
}

func setupSubjectExtractorWithRefresh(config appConfig.Security) (security.SubjectExtractor, error) {
	initial, err := setupSubjectExtractor(config)
	if err != nil {
		return nil, err
	}

	synchronized := security.NewSynchronizedSubjectExtractor(initial)

	nc, err := nats.Connect(config.PolicyStorage.NatsEndpoint)
	if err != nil {
		return nil, err
	}
	subscription, err := nc.Subscribe("version", refreshExtractor(config, synchronized))
	if err != nil {
		return nil, err
	}
	runtime.SetFinalizer(synchronized, func(s interface{}) {
		if subscription != nil && subscription.IsValid() {
			subscription.Unsubscribe()
		}
	})

	return synchronized, nil
}

func refreshExtractor(cfg appConfig.Security, extractor *security.SynchronizedSubjectExtractor) nats.MsgHandler {
	return nats.MsgHandler(func(msg *nats.Msg) {
		defer func() {
			if r := recover(); r != nil {
				logrus.WithField(logrus.ErrorKey, r).Error("Failed to refresh user info extractor")
			}
		}()

		newExtractor, err := setupSubjectExtractor(cfg)
		if err == nil {
			extractor.UpdateExtractor(newExtractor)
		} else {
			logrus.WithError(err).Error("Error updating user info extractor")
		}
	})
}

func setupSubjectExtractor(cfg appConfig.Security) (security.SubjectExtractor, error) {
	policyStorage := cfg.PolicyStorage
	client, err := minio.New(policyStorage.MinioEndpoint, policyStorage.MinioAccessKey, policyStorage.MinioSecretKey, policyStorage.MinioUseSSL)
	if err != nil {
		return nil, err
	}

	reader, err := client.GetObject(policyStorage.MinioBucketName, "security/subject_extraction_rules.rego", minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	defer reader.Close()

	data, err := ioutil.ReadAll(reader)
	if err != nil {
		return nil, err
	}
	return security.NewDefaultSubjectExtractor(string(data), "rules", "subject"), nil
}

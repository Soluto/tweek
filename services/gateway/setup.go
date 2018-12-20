package main

import (
	"io/ioutil"
	"log"
	"runtime"
	"time"

	"github.com/Soluto/tweek/services/gateway/appConfig"
	"github.com/Soluto/tweek/services/gateway/security"
	minio "github.com/minio/minio-go"
	nats "github.com/nats-io/go-nats"
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

	dataObj, err := client.GetObject(policyStorage.MinioBucketName, "security/policy.json", minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	data, err := ioutil.ReadAll(dataObj)
	if err != nil {
		return nil, err
	}
	return security.NewDefaultAuthorizer(string(rules), string(data), "authorization", "authorize"), nil
}

func refreshAuthorizer(cfg *appConfig.Security, authorizer *security.SynchronizedAuthorizer) nats.MsgHandler {
	return nats.MsgHandler(func(msg *nats.Msg) {
		defer func() {
			if r := recover(); r != nil {
				log.Println("Failed to refresh authorizer", r)
			}
		}()

		newAuthorizer, err := setupAuthorizer(cfg)
		if err == nil {
			authorizer.Update(newAuthorizer)
		} else {
			log.Println("Error updating authorizer", err)
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
		log.Printf("Error creating authorizer, retrying...\n %v", err)
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
				log.Println("Failed to refresh user info extractor", r)
			}
		}()

		newExtractor, err := setupSubjectExtractor(cfg)
		if err == nil {
			extractor.UpdateExtractor(newExtractor)
		} else {
			log.Println("Error updating user info extractor", err)
		}
	})
}

func setupSubjectExtractor(cfg appConfig.Security) (security.SubjectExtractor, error) {
	policyStorage := cfg.PolicyStorage
	client, err := minio.New(policyStorage.MinioEndpoint, policyStorage.MinioAccessKey, policyStorage.MinioSecretKey, policyStorage.MinioUseSSL)
	if err != nil {
		return nil, err
	}

	obj, err := client.GetObject(policyStorage.MinioBucketName, "security/subject_extraction_rules.rego", minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	data, err := ioutil.ReadAll(obj)
	if err != nil {
		return nil, err
	}
	return security.NewDefaultSubjectExtractor(string(data), "rules", "subject"), nil
}

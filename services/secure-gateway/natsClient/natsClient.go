package natsClient

import (
	"log"
	"time"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/nats-io/go-nats"
)

// New creates new Nats client
func New(config *appConfig.PolicyStorage, onInit func() interface{}, onUpdate func()) interface{} {
	nc, err := nats.Connect(config.NatsEndpoint)
	if err != nil {
		log.Panicln("Error connecting to Nats", err)
	}

	nc.Subscribe(config.NatsUpdateSubject, func(msg *nats.Msg) { onUpdate() })

	initSub, err := nc.SubscribeSync(config.NatsInitSubject)
	if err != nil {
		log.Panicln("Error subscribing to policy init Nats subject", err)
	}

	_, err = initSub.NextMsg(time.Minute)
	if err != nil {
		log.Println("Maybe timeout maybe error in policy init subscribstion", err)
		return onInit()
	}
	err = initSub.Unsubscribe()
	if err != nil {
		log.Panicln("Error while unsubscribing from policy init Nats subscribtion", err)
	}
	return onInit()
}

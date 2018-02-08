package main

import (
	"log"
	"os"
	"strconv"

	"github.com/minio/minio-go"
	"github.com/nats-io/go-nats"
)

func main() {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")
	useSSL, err := strconv.ParseBool(os.Getenv("MINIO_SECURE"))
	if err != nil {
		log.Panicln("Error getting MINIO_SECURE environment variable:", err)
	}

	bucketName := os.Getenv("MINIO_BUCKET")

	client, err := minio.New(endpoint, accessKey, secretKey, useSSL)
	if err != nil {
		log.Panicln("Minio client creation failed:", err)
	}

	exists, err := client.BucketExists(bucketName)
	if err != nil {
		log.Panicln("MINIO_BUCKET existence check failed:", err)
	}
	if !exists {
		err = client.MakeBucket(bucketName, "us-east-1")
		if err != nil {
			log.Panicln("MINIO_BUCKET creation failed:", err)
		}
	}

	_, err = client.FPutObject(bucketName, "policy.csv", "/policy.csv", minio.PutObjectOptions{
		ContentType: "application/csv",
	})
	if err != nil {
		log.Panicln("Failed to save file to minio:", err)
	}
	log.Println("Casbin policy has been loaded to minio")

	natsEndpoint := os.Getenv("NATS_ENDPOINT")
	nc, err := nats.Connect(natsEndpoint)
	if err != nil {
		log.Panicln("Failed to connect to Nats:", err)
	}

	natsSubject := os.Getenv("NATS_SUBJECT")
	err = nc.Publish(natsSubject, []byte("policy.csv"))
	if err != nil {
		log.Panicln("Failed to publish to Nats:", err)
	}
	log.Println("New data was published to Casbin policy Nats subject.")

}

package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/minio/minio-go"
	"github.com/nats-io/go-nats"
)

func main() {
	err := loadPolicyToMinio()
	if err == nil {
		return
	}

	fmt.Print(err)
	fmt.Println("Retrying...")
	time.Sleep(time.Second * 5)
	err = loadPolicyToMinio()
	if err == nil {
		return
	}

	fmt.Print(err)
	fmt.Println("Retrying...")
	time.Sleep(time.Second * 5)
	err = loadPolicyToMinio()
	if err == nil {
		return
	}
	fmt.Print(err)
	fmt.Println("Failing...")
	os.Exit(1)
}

func loadPolicyToMinio() error {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")
	useSSL, err := strconv.ParseBool(os.Getenv("MINIO_SECURE"))
	if err != nil {
		return fmt.Errorf("Error getting 'MINIO_SECURE' environment variable %v", err)
	}

	bucketName := os.Getenv("MINIO_BUCKET")

	client, err := minio.New(endpoint, accessKey, secretKey, useSSL)
	if err != nil {
		return fmt.Errorf("Minio client creation failed %v", err)
	}

	exists, err := client.BucketExists(bucketName)
	if err != nil {
		return fmt.Errorf("MINIO_BUCKET existence check failed %v", err)
	}
	if !exists {
		err = client.MakeBucket(bucketName, "us-east-1")
		if err != nil {
			return fmt.Errorf("MINIO_BUCKET creation failed %v", err)
		}
	}

	_, err = client.FPutObject(bucketName, "policy.csv", "/policy.csv", minio.PutObjectOptions{
		ContentType: "application/csv",
	})
	if err != nil {
		return fmt.Errorf("Failed to save file to minio %v", err)
	}
	log.Println("Casbin policy has been loaded to minio")

	natsEndpoint := os.Getenv("NATS_ENDPOINT")
	nc, err := nats.Connect(natsEndpoint)
	if err != nil {
		return fmt.Errorf("Failed to connect to Nats %v", err)
	}

	natsSubject := os.Getenv("NATS_SUBJECT")
	err = nc.Publish(natsSubject, []byte("policy.csv"))
	if err != nil {
		return fmt.Errorf("Failed to publish to Nats %v", err)
	}
	log.Println("New data was published to Casbin policy Nats subject.")

	return nil
}

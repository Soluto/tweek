restore:
	dep ensure

build:
	CGO_ENABLED=0 go build

start: 
	CONFIGOR_ENV=local CONFIG_FILE_PATH=../../deployments/dev/gateway/config/gateway.json ./gateway

test:
	go test ./...

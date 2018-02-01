build:
	CGO_ENABLED=0 go build

start: 
	CONFIGOR_ENV=local CONFIG_FILE_PATH=./config/gateway.json ./secure-gateway

test:
	go test ./...
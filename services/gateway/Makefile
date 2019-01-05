build:
	CGO_ENABLED=0 go build ./...

start: 
	CONFIGOR_ENV=local TWEEKGATEWAY_CONFIGFILEPATH=../../deployments/dev/gateway/config/gateway.json ./tweek-gateway

test:
	go test ./...

start-full-env:
	docker-compose -f ../../deployments/dev/docker-compose.yml -f ../../deployments/dev/docker-compose.override.yml up -d api authoring && make start

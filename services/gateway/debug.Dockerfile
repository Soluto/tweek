# -------- DEPENDENCIES -------- #
FROM golang:1.11.4-stretch as build

ADD go.mod /src/go.mod
ADD go.sum /src/go.sum
WORKDIR /src

RUN go mod download

ADD . /src
WORKDIR /src

RUN go build -o entry \
    && go test -cover -v ./...

RUN go build -o hcheck "tweek-gateway/healthcheck"

VOLUME [ "/config" ]

RUN go get github.com/pilu/fresh

ENTRYPOINT fresh

# syntax = docker/dockerfile:1.2
FROM golang:1.16.3-stretch as build
WORKDIR /app

ADD go.mod /app/go.mod
ADD go.sum /app/go.sum

RUN --mount=id=tweek-gateway-pkgcache,type=cache,target=/go/pkg/mod go mod download -x
ADD . /app

RUN --mount=id=tweek-gateway-build-cache,type=cache,target=/root/.cache/go-build --mount=id=tweek-gateway-pkgcache,type=cache,target=/go/pkg/mod go build -o entry \
    && go test -cover -v ./...

RUN --mount=id=tweek-gateway-build-cache,type=cache,target=/root/.cache/go-build go build -o hcheck "tweek-gateway/healthcheck"
HEALTHCHECK --interval=5s --timeout=2s --retries=10 CMD ["/app/healthcheck"]
ENTRYPOINT [ "/app/entry" ]
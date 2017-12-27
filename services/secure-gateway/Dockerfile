# -------- BUILDER -------- #
FROM golang:1.9 as build

ARG DEP_VERSION=0.3.2

ADD . /go/src/github.com/Soluto/tweek/services/secure-gateway
WORKDIR /go/src/github.com/Soluto/tweek/services/secure-gateway

RUN update-ca-certificates \
    && curl -fsSL -o /usr/local/bin/dep https://github.com/golang/dep/releases/download/v${DEP_VERSION}/dep-linux-amd64 \
    && chmod +x /usr/local/bin/dep \
    && dep ensure -v \
    && CGO_ENABLED=0 go build -a -installsuffix cgo -o entry \
    && go test -v ./...

# -------- IMAGE -------- #
FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /go/src/github.com/Soluto/tweek/services/secure-gateway/gateway.json /gateway.json
COPY --from=build /go/src/github.com/Soluto/tweek/services/secure-gateway/model.csv /model.csv
COPY --from=build /go/src/github.com/Soluto/tweek/services/secure-gateway/policy.conf /policy.conf
COPY --from=build /go/src/github.com/Soluto/tweek/services/secure-gateway/entry /entry

ENTRYPOINT [ "/entry" ]

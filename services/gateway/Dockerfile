# -------- DEPENDENCIES -------- #
FROM golang:1.10.0-stretch as dependencies

ARG DEP_VERSION=0.3.2

ADD Gopkg.toml /go/src/github.com/Soluto/tweek/services/gateway/Gopkg.toml
ADD Gopkg.lock /go/src/github.com/Soluto/tweek/services/gateway/Gopkg.lock
WORKDIR /go/src/github.com/Soluto/tweek/services/gateway

RUN update-ca-certificates \
    && curl -fsSL -o /usr/local/bin/dep https://github.com/golang/dep/releases/download/v${DEP_VERSION}/dep-linux-amd64 \
    && chmod +x /usr/local/bin/dep \
    && dep ensure -v -vendor-only

# The scratch image, which we use in the end, neither has cmdline tools nor tmp directory
# so we prepare it here, and copy later on
RUN mkdir /empty_tmp && chmod 1777 /empty_tmp

# -------- BUILDER -------- #
FROM dependencies as build

ADD . /go/src/github.com/Soluto/tweek/services/gateway
WORKDIR /go/src/github.com/Soluto/tweek/services/gateway

RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o entry \
    && go test -cover -v ./...

RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o hcheck "github.com/Soluto/tweek/services/gateway/healthcheck"

# ------ REGO TESTS ------ #
FROM golang:1.10.0-stretch as regotests

RUN curl -L -o opa https://github.com/open-policy-agent/opa/releases/download/v0.8.2/opa_linux_amd64
RUN chmod u+x opa

RUN mkdir /tmp/opatests
COPY authorization.rego /tmp/opatests
COPY ./testdata/policy.json /tmp/opatests
COPY ./testdata/test_authorization.rego /tmp/opatests

RUN ./opa test -v /tmp/opatests

# -------- IMAGE -------- #
FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /go/src/github.com/Soluto/tweek/services/gateway/settings /settings
COPY --from=build /go/src/github.com/Soluto/tweek/services/gateway/authorization.rego /authorization.rego
COPY --from=build /go/src/github.com/Soluto/tweek/services/gateway/entry /entry
COPY --from=build /go/src/github.com/Soluto/tweek/services/gateway/hcheck /healthcheck
COPY --from=dependencies /empty_tmp /tmp

ENV CONFIGOR_ENV=production

VOLUME [ "/config" ]

HEALTHCHECK --interval=5s --timeout=2s --retries=10 CMD ["/healthcheck"]

ENTRYPOINT [ "/entry" ]

# -------- DEPENDENCIES -------- #
FROM golang:1.11.13-stretch as build

ADD go.mod /src/go.mod
ADD go.sum /src/go.sum
WORKDIR /src

RUN go mod download

ADD . /src
WORKDIR /src

RUN go build -o entry \
    && go test -cover -v ./...

RUN go build -o hcheck "tweek-gateway/healthcheck"

# ------ REGO TESTS ------ #
FROM golang:1.11.13-stretch as regotests

RUN curl -L -o opa https://github.com/open-policy-agent/opa/releases/download/v0.8.2/opa_linux_amd64
RUN chmod u+x opa

RUN mkdir /tmp/opatests
COPY authorization.rego /tmp/opatests
COPY ./testdata/policy.json /tmp/opatests
COPY ./testdata/test_authorization.rego /tmp/opatests

RUN ./opa test -v /tmp/opatests

# -------- IMAGE -------- #
FROM gcr.io/distroless/base

COPY --from=build /src/settings /settings
COPY --from=build /src/authorization.rego /authorization.rego
COPY --from=build /src/entry /entry
COPY --from=build /src/hcheck /healthcheck

ENV CONFIGOR_ENV=production

VOLUME [ "/config" ]

HEALTHCHECK --interval=5s --timeout=2s --retries=10 CMD ["/healthcheck"]

ENTRYPOINT [ "/entry" ]

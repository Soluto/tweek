# -------- DEPENDENCIES -------- #
FROM golang:1.11.4-stretch as dependencies

ADD go.mod /src/go.mod
ADD go.sum /src/go.sum
WORKDIR /src

# The scratch image, which we use in the end, neither has cmdline tools nor tmp directory
# so we prepare it here, and copy later on
RUN mkdir /empty_tmp && chmod 1777 /empty_tmp

# -------- BUILDER -------- #
FROM dependencies as build

ADD . /src
WORKDIR /src

RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o entry \
    && go test -cover -v ./...

RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o hcheck "tweek-gateway/healthcheck"

# ------ REGO TESTS ------ #
FROM golang:1.11.4-stretch as regotests

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
COPY --from=build /src/settings /settings
COPY --from=build /src/authorization.rego /authorization.rego
COPY --from=build /src/entry /entry
COPY --from=build /src/hcheck /healthcheck
COPY --from=build /src/swagger/swagger.yml /swagger/swagger.yml
COPY --from=dependencies /empty_tmp /tmp

ENV CONFIGOR_ENV=production

VOLUME [ "/config" ]

HEALTHCHECK --interval=5s --timeout=2s --retries=10 CMD ["/healthcheck"]

ENTRYPOINT [ "/entry" ]

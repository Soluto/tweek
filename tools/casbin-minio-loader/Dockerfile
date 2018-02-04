# -------- DEPENDENCIES -------- #
FROM golang:1.9.2 as dependencies

ARG DEP_VERSION=0.3.2

WORKDIR /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader
COPY Gopkg.toml ./Gopkg.toml
COPY Gopkg.lock ./Gopkg.lock

RUN update-ca-certificates \
    && curl -fsSL -o /usr/local/bin/dep https://github.com/golang/dep/releases/download/v${DEP_VERSION}/dep-linux-amd64 \
    && chmod +x /usr/local/bin/dep \
    && dep ensure -v -vendor-only

# -------- BUILDER -------- #
FROM dependencies as build

WORKDIR /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader
COPY . ./

RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o entry

# -------- IMAGE -------- #
FROM scratch

COPY --from=build /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader/policy.csv /policy.csv
COPY --from=build /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader/entry /entry

ENTRYPOINT [ "/entry" ]

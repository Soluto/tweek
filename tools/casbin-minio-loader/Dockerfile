# -------- DEPENDENCIES -------- #
FROM golang:1.9.2 as dependencies

ARG DEP_VERSION=0.3.2

ADD Gopkg.toml /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader/Gopkg.toml
ADD Gopkg.lock /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader/Gopkg.lock
WORKDIR /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader

RUN update-ca-certificates \
    && curl -fsSL -o /usr/local/bin/dep https://github.com/golang/dep/releases/download/v${DEP_VERSION}/dep-linux-amd64 \
    && chmod +x /usr/local/bin/dep \
    && dep ensure -v -vendor-only

# -------- BUILDER -------- #
FROM dependencies as build

ADD . /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader
WORKDIR /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader

RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o entry

# -------- IMAGE -------- #
FROM scratch

COPY --from=build /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader/model.csv /model.csv
COPY --from=build /go/src/github.com/Soluto/tweek/tools/casbin-minio-loader/entry /entry

ENTRYPOINT [ "/entry" ]

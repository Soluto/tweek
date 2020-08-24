variable "GITHUB_SHA" {
	default = "unknown"
}

variable "GITHUB_REPOSITORY" {
	default = "unknown/tweek"
}

group "default" {
	targets = ["api", "editor", "publishing", "gateway", "authoring"]
}

target "api" {
    context = "../../"
    dockerfile = "TweekApi.Dockerfile"
    cache-from = ["type=registry,ref=soluto/tweek-api:build-cache"]
    cache-to =  GITHUB_REPOSITORY == "Soluto/tweek" ? ["type=registry,ref=soluto/tweek-api:build-cache,mode=max"] : []
    tags= ["docker.pkg.github.com/yshayy/tweek/api:ref-${GITHUB_SHA}"]
    output=["type=docker,dest=./api-${GITHUB_SHA}.tar"]
}

target "editor" {
    context = "../../services/editor"
    cache-from = ["type=registry,ref=soluto/tweek-editor:build-cache"]
    cache-to = GITHUB_REPOSITORY == "Soluto/tweek" ? ["type=registry,ref=soluto/tweek-editor:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/editor:ref-${GITHUB_SHA}"]
    output=["type=docker,dest=./editor-${GITHUB_SHA}.tar"]
}

target "publishing" {
    context = "../../services/publishing"
    cache-from = ["type=registry,ref=soluto/tweek-publishing:build-cache"]
    cache-to = GITHUB_REPOSITORY == "Soluto/tweek" ? ["type=registry,ref=soluto/tweek-publishing:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/publishing:ref-${GITHUB_SHA}"]
    output=["type=docker,dest=./publishing-${GITHUB_SHA}.tar"]
}

target "authoring" {
    context = "../../services/authoring"
    cache-from= ["type=registry,ref=soluto/tweek-authoring:build-cache"]
    cache-to= GITHUB_REPOSITORY == "Soluto/tweek" ? ["type=registry,ref=soluto/tweek-authoring:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/authoring:ref-${GITHUB_SHA}"]
    output=["type=docker,dest=./authoring-${GITHUB_SHA}.tar"]
}

target "gateway" {
    context = "../../services/gateway"
    cache-from = ["type=registry,ref=soluto/tweek-gateway:build-cache"]
    cache-to = REPO == "Soluto/tweek" ? ["type=registry,ref=soluto/tweek-gateway:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/gateway:ref-${GITHUB_SHA}"]
    output=["type=docker,dest=./gateway-${GITHUB_SHA}.tar"]
}

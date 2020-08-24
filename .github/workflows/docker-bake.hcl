variable "REF" {
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
    cache-to = ["type=registry,ref=soluto/tweek-api:build-cache,mode=max"]
    tags= ["docker.pkg.github.com/yshayy/tweek/api:ref-${REF}"]
    output=["type=docker,dest=./api-${REF}.tar"]
}

target "editor" {
    context = "../../services/editor"
    cache-from = ["type=registry,ref=soluto/tweek-editor:build-cache"]
    cache-to = "${GITHUB_REPOSITORY}" == "soluto/tweek" ? ["type=registry,ref=soluto/tweek-editor:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/editor:ref-${REF}"]
    output=["type=docker,dest=./editor-${REF}.tar"]
}

target "publishing" {
    context = "../../services/publishing"
    cache-from = ["type=registry,ref=soluto/tweek-publishing:build-cache"]
    cache-to = "${GITHUB_REPOSITORY}" == "soluto/tweek" ? ["type=registry,ref=soluto/tweek-publishing:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/publishing:ref-${REF}"]
    output=["type=docker,dest=./publishing-${REF}.tar"]
}

target "authoring" {
    context = "../../services/authoring"
    cache-from= ["type=registry,ref=soluto/tweek-authoring:build-cache"]
    cache-to= "${GITHUB_REPOSITORY}" == "soluto/tweek" ? ["type=registry,ref=soluto/tweek-authoring:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/authoring:ref-${REF}"]
    output=["type=docker,dest=./authoring-${REF}.tar"]
}

target "gateway" {
    context = "../../services/gateway"
    cache-from = ["type=registry,ref=soluto/tweek-gateway:build-cache"]
    cache-to = "${GITHUB_REPOSITORY}" == "soluto/tweek" ? ["type=registry,ref=soluto/tweek-gateway:build-cache,mode=max"] : []
    tags = ["docker.pkg.github.com/yshayy/tweek/gateway:ref-${REF}"]
    output=["type=docker,dest=./gateway-${REF}.tar"]
}

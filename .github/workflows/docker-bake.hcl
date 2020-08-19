variable "REF" {
	default = "unknown"
}

group "default" {
	targets = ["api", "editor", "publishing", "gateway", "authoring"]
}

target "api" {
    context = "../../"
    dockerfile = "TweekApi.Dockerfile"
    cache-from = ["type=registry,ref=soluto/tweek-api:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-api:build-cache,mode=max"]
    tags= [docker.pkg.github.com/soluto/tweek/api:ref-${REF}]
}

target "editor" {
    context = "../../services/editor"
    cache-from = ["type=registry,ref=soluto/tweek-editor:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-editor:build-cache,mode=max"]
    tags = ["docker.pkg.github.com/soluto/tweek/editor:ref-${REF}"]
}

target "publishing" {
    context = "../../services/publishing"
    cache-from = ["type=registry,ref=soluto/tweek-publishing:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-publishing:build-cache,mode=max"]
    tags = ["docker.pkg.github.com/soluto/tweek/publishing:ref-${REF}"]
}

target "authoring" {
    context = "../../services/authoring"
    cache-from= ["type=registry,ref=soluto/tweek-authoring:build-cache"]
    cache-to= ["type=registry,ref=soluto/tweek-authoring:build-cache,mode=max"]
    tags = ["docker.pkg.github.com/soluto/tweek/authoring:ref-${REF}"]
}

target "gateway" {
    context = "../../services/gateway"
    cache-from = ["type=registry,ref=soluto/tweek-gateway:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-gateway:build-cache,mode=max"]
    tags = ["docker.pkg.github.com/soluto/tweek/gateway:ref-${REF}"]
    
}

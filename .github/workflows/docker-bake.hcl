group "default" {
	targets = ["api", "editor", "publishing", "gateway", "authoring"]
}

target "api" {
    context = "../../"
	Dockerfile = "TweekApi.Dockerfile"
    cache-from = ["type=registry,ref=soluto/tweek-api:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-api:build-cache,mode=max"]
	tags = ["soluto/tweek-api"]
}

target "editor" {
	context = "../../services/editor"
    cache-from = ["type=registry,ref=soluto/tweek-editor:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-editor:build-cache,mode=max"]
	tags = ["soluto/tweek-editor"]
}

target "publishing" {
	context = "../../services/publishing"
    cache-from = ["type=registry,ref=soluto/tweek-publishing:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-publishing:build-cache,mode=max"]
	tags = ["soluto/tweek-publishing"]
}

target "authoring" {
	context = "../../services/authoring"
    cache-from= ["type=registry,ref=soluto/tweek-authoring:build-cache"]
    cache-to= ["type=registry,ref=soluto/tweek-authoring:build-cache,mode=max"]
	tags = ["soluto/tweek-authoring"]
}

target "gateway" {
    context = "../../services/gateway"
    cache-from = ["type=registry,ref=soluto/tweek-gateway:build-cache"]
    cache-to = ["type=registry,ref=soluto/tweek-gateway:build-cache,mode=max"]
	tags = ["soluto/tweek-gateway"]
}
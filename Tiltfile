docker_compose("./deployments/dev/tilt.yml" )
docker_build("soluto/tweek-gateway", "services/gateway",dockerfile="services/gateway/debug.Dockerfile")

docker_build("soluto/tweek-authoring", "services/authoring")
docker_build("soluto/tweek-api",  ".", dockerfile="TweekApi.Dockerfile")
docker_build("soluto/tweek-publishing", "services/publishing")
docker_build("soluto/tweek-editor", "services/editor",dockerfile="services/editor/debug.Dockerfile",
    live_update=[
        fall_back_on(['services/editor/package.json']),
        sync('services/editor/src', '/app/src'),
    ]
)
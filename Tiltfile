docker_compose("./deployments/dev/tilt.yml" )
docker_build("soluto/tweek-editor", "services/editor",dockerfile="services/editor/debug.Dockerfile",
    live_update=[
        fall_back_on(['services/editor/package.json']),
        sync('services/editor/src', '/app/src'),
    ]
)
docker_compose("./deployments/dev/tilt.yml" )
docker_build("soluto/tweek-gateway", "services/gateway",dockerfile="services/gateway/Dockerfile")

docker_build("soluto/tweek-authoring", "services/authoring")
docker_build("soluto/tweek-api",  ".", dockerfile="TweekApi.Dockerfile")
docker_build("soluto/tweek-publishing", "services/publishing")
docker_build("soluto/tweek-editor", "services/editor",dockerfile="services/editor/debug.Dockerfile",
    live_update=[
        fall_back_on(['services/editor/package.json']),
        sync('services/editor/src', '/app/src'),
    ]
)
docker_build("soluto/tweek-bare-repo", "services/git-service/BareRepository")

dc_resource('minio')
dc_resource('redis')
dc_resource('git')
dc_resource('nats')
dc_resource('oidc-server-mock')

dc_resource('api', resource_deps=['minio', 'nats'])
dc_resource('publishing', resource_deps=['git', 'minio', 'nats'])
dc_resource('authoring', resource_deps=['publishing'])
dc_resource('gateway', resource_deps=['minio', 'nats', 'oidc-server-mock', 'api', 'authoring'])
dc_resource('editor', resource_deps=['gateway'])
if os.getenv('RUN_TESTS', 'false') == 'true':
    local_resource('integration-tests', cmd='yarn test', dir='e2e/integration', resource_deps=['gateway'])
    local_resource('ui-tests', cmd='yarn test', dir='e2e/ui', resource_deps=['integration-tests'])
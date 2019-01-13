## Overview
These files are intended to run Tweek in Kubernetes. The files include a very first configuration which is good for local development. For production deployment some enhancements are needed.

## Deploying to Kubernetes
```
kubectl apply -f infra/
kubectl apply -f .

# If running on Minikube use cli to get endpoints
minikube service list
```

## Local developing with Skaffold
Install [Skaffold](https://github.com/GoogleContainerTools/skaffold/releases).

First of all, run the skaffold.
```
skaffold dev -f ./deployments/skaffold.yaml
```
Then, create port forwarding
```bash
kubectl port-forward deployment/gateway 8080:80
kubectl port-forward deployment/oidc-server-mock 8081:80
```
Finally, open in browser [http://localhost:8080](http://localhost:8080).
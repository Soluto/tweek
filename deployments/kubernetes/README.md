## Overview
These files are intended to run Tweek in Kubernetes. The files include a very first configuration which is good for local development. For production deployment some enhancements are needed.

## Deploying to Kubernetes
```
kubectl apply -f infra.yaml
kubectl apply -f redis.yaml -f git.yaml
kubectl apply -f .

# If running on Minikube use cli to get endpoints
minikube service list
```

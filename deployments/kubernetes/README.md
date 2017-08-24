## Overview
These files are intended to run Tweek in Kubernetes. The files include a very first configuration which is good for local development. For production deployment some enhancements are needed.

## Deploying to Kubernetes
  1. `kubectl apply -f infra.yaml`
  2. `kubectl apply -f .`
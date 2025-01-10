# cryoet-neuroglancer

React-based web application.

## Run Frontend Locally without docker

Code is inside the *frontend* directory. To run in development mode:

```bash
cd frontend
yarn install
yarn dev 
```

## Run with Docker

```bash
docker build . -t cryoet-neuroglancer
docker run -it -p 8080:8080 cryoet-neuroglancer
```

Prerequisite: the cloudharness-frontend-build image must be built first:

```bash
cd [CLOUDHARNESS_ROOT]
docker build . -f infrastructure/base-images/cloudharness-frontend-build/Dockerfile -t cloudharness-frontend-build 
```

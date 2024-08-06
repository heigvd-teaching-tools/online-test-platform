
## Custom Docker Images in GitHub Container Registry for Code Check

This document explains how to create a custom Docker image for the code check and push it to the GitHub Container Registry.

This allows to install dependencies in the image, and other time consuming tasks, to speed up the code check process.

The following procedure is an example for a C++ image with CUnit installed. It can be adapted to other languages and dependencies.

#### Login
https://docs.github.com/fr/packages/working-with-a-github-packages-registry/working-with-the-container-registry

1) Login the GitHub user in docker cli using PAT (Personal Access Token)
```bash
docker login ghcr.io -u <username> --password <PAT>
```

#### Create Dockerfile

Example of a Dockerfile for a C++ image with CUnit installed

```bash
# Use an official GCC image from the Docker Hub
FROM gcc:latest

# Define the LABEL that provides metadata about the image
LABEL org.opencontainers.image.source="https://github.com/heigvd-teaching-tools/code-check-image"

# Install CUnit for unit testing
RUN apt-get update && apt-get install -y \
    libcunit1-dev \
    libcunit1
```

You do not need to copy files and compile the code in the Dockerfile. It will be done by the code check runner.

The important part is to do all the time consuming tasks such as installing dependencies in the Dockerfile.

#### Build and push the image

The Dockerfile must have the LABEL `org.opencontainers.image.source` set to the repository URL. This is required by GitHub to be able to build the image.


Build the image:
```bash
docker build -t ghcr.io/heigvd-teaching-tools/code-check-image/cpp-cunit:latest .

```

Push the image:
```bash
docker push ghcr.io/heigvd-teaching-tools/code-check-image/cpp-cunit:latest
```

#### Set the visibility of the package to public

The package must be public to be used in the code check runner.

Go to the package settings and set the package visibility to public.

https://github.com/orgs/heigvd-teaching-tools/packages?repo_name=online-test-platform

Select your package and go to the "package settings".

Goto Danger Zone / Change package visibility


#### Use the image in the code check 

Use `ghcr.io/heigvd-teaching-tools/code-check-image/cpp-cunit:latest` in the image field of the Code question.


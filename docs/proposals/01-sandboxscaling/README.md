Status: DRAFT 

Goals:
- Scale horizontally
- Automation of the scaling within the boundaries of available or budget ressources
- Gain confidence for growth of users
- Support spike of usage (e.g. university days/weeks of evaluations)

Non-goals:
- Scale vertically
- Avoid implementing owns autoscaling automation based on application usage or ressources usage.
- Avoid implementing scheduling or orchestration of ressources management.

# Context
Application has two parts:
* Three-tier app with frontend, backend, database
* Lifecycle management of short-lived sandbox environment that safely executes users submitted input (code, query)

Characteristics for short-lived sandbox environment:
* Low latency for a full lifecycle triggered by an user interaction
* Security, enclosed environment to execute safely untrusted users input (queries, code)
* Flexibility of tools (sql, database) and programming languages.
* Stateless, no state preserved or required for the sandbox execution.
* No external dependencies

## Current implementation
* Node.js application using testcontainers and the host's Docker daemon. https://node.testcontainers.org/
* The host ressources are used for the node.js application and the sandbox environments

The sandbox containers are delegated to the host.

Application: OCI Container with docker socket mounted
Sandbox container: OCI Containers managed by the application with testcontainers through the mounted socket

The sandbox container ressource usages are not tracked by the application container, but by the host overall ressources usage.

There are memory and cpu quota limitations per sandbox.
There are limits in execution time and in container output (256Kb).

For exceptional cases needing extensive files (e.g., large Maven projects), using pre-built custom images could be a more efficient solution than handling complex code exercises with numerous files.

## Monitoring of current ressource usage
Some monitoring was done during evaluations spike usage by Stefan.
`monitor.sh` 

## Future features

### Hardware specific capabilities
There is an idea or plan to provide sandbox with hardware specific capabilities such as FPGA, GPU or ARM CPU. Those hardware
capabilities would be sparse and thus not present on every node.
In order to accommodate this constraint the autoscaling should be able to take into account a concept of node's capability when starting sandbox environments.  

# Alternatives
## Scale by container unit
Everything fits in a container and the scaling is based on container units.

Requirements:
1. Application is stateless
    Every application instance can serve any request.
    Sticky session allow to bound a session to one application instance.
2. All usage of applications and sandboxes are reported correctly within the container, including the sandbox done with OCI Containers (i.e. container in container)
3. Runtime is able to execute OCI containers (e.g. k8s Docker in docker)

## Scale by Virtual Machine unit
The application stay as-is and the whole is scaled as VM units.

https://developer.hashicorp.com/nomad/tutorials/autoscaler/horizontal-cluster-scaling
https://cloud.google.com/compute/docs/autoscaler


## Scale by sandbox unit (i.e. sandbox service)
Goal is to split further the application in two separate parts:
- Application
- Sandbox environments

Then the sandbox environments can be scaled separately.

A standalone sandbox environments service is created.
The sandbox service:
* is stateless and can serve any request.
* runs untrusted code in sandbox containers and gives the return to the requesting application
* provide enough low latency between request and response
* can scale horizontally based on load (CPU,RAM)
* could serve more than one instance of the eval application


Technical alternatives: 
* docker daemon exposed remotely
    * load-balance of docker daemon requests (one sandbox lifecycle will likely trigger several requests, docker cp|start|logs)
* Own sandbox service
    * own implementation wrapping a lifecycle of one sandbox in one request

Own sandbox service:
- Service-to-service authentication with applications (or closed network, i.e network trust)
- API endpoint to receive applications requests
- Pre-load container images
- Execute request in container and delete container

Latency risks:
- Add a network layer between application and sandbox service
    * The application has to exchange the users input to the sandbox service
- Add a few more steps are required between user submission and response 


## Scale by sandbox as k8s workload
Characteristics:
* every sandbox becomes a k8s workload
* scaling is provided by load-balancing of k8s workload
* eval becomes k8s aware

Constraints:
* delay due to cold start of k8s workload is low enough that the UX is acceptable
    * the main time should still be consumed by compiling/running user input still
    * tuning of cold start: pre fetch images
        https://www.openfaas.com/blog/fine-tuning-the-cold-start/
        https://cloud.google.com/blog/products/containers-kubernetes/tips-and-tricks-to-reduce-cold-start-latency-on-gke
* refactor the eval codebase to call the k8s api directly

Notes:
* easy to accommodate for the hardware specific capabilities 
    https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/ 

# Technical open points

## Container in container (Docker in docker)
This characteristic is required in order to use a container based autoscaling (e.g. Kubernetes).
https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/

Benefits:
* Tracking of ressources within one parent container
* Remove the delegation of sandbox containers to an external component
* Preserve low latency between backend request handling and sandbox environment

Ability to run OCI container within an OCI container that can triggers the benefits of using an autoscaling based on ressources metrics comprising the application itself and the sandbox environments.

If the evaluation application runs within a container can it runs a container for the sandbox environment.

https://www.redhat.com/sysadmin/podman-inside-container
https://www.redhat.com/sysadmin/podman-inside-kubernetes


# Technical solution

https://developer.hashicorp.com/nomad/tools/autoscaling






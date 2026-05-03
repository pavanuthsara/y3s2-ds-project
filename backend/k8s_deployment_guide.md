# Kubernetes Deployment Guide

This guide walks you through the steps to run the microservices architecture using Kubernetes. These instructions assume you are deploying to a local cluster (like **Docker Desktop Kubernetes** or **Minikube**).

## Prerequisites
1. **Kubernetes Cluster**: Ensure you have a running cluster (e.g., Docker Desktop with Kubernetes enabled, or Minikube).
2. **kubectl**: The Kubernetes command-line tool must be installed and configured to communicate with your cluster.
3. (For Minikube users) **minikube tunnel**: Required to expose `LoadBalancer` services like the API Gateway to your local machine.

---

## 1. Deploying the Application

The Kubernetes manifests are organized by service within the `backend/k8s` directory. Each directory contains the necessary Deployments, Services, ConfigMaps, and Secrets for the respective service and its database.

To deploy all microservices and databases at once, navigate to the `backend` directory and run the following command:

```bash
kubectl apply -f k8s/ --recursive
```

This command will recursively go through all the directories inside `k8s/` and apply every YAML file.

### Expected Output
You should see output indicating that ConfigMaps, Secrets, Deployments, and Services for all microservices (API Gateway, Auth, Patient, Doctor, Appointment, Payment, Telemedicine, Notification, AI Symptom Checker) and their respective databases have been created.

---

## 2. Verifying the Deployment

After applying the configuration, wait a few moments for the pods to initialize and the Docker images to be pulled (if not already local).

**Check the status of all Pods:**
```bash
kubectl get pods
```
Wait until all pods are in the `Running` state. If any pods are in a `CrashLoopBackOff` or `Error` state, you can check their logs:
```bash
kubectl logs <pod-name>
```

**Check the status of all Services:**
```bash
kubectl get services
```

---

## 3. Accessing the Services

The **API Gateway** is configured as a `LoadBalancer` service.

* **If using Docker Desktop:**
  The API Gateway will automatically be bound to `localhost:8080`.
  You can access the backend via `http://localhost:8080`.

* **If using Minikube:**
  Minikube does not natively support `LoadBalancer` IPs. You must run the tunnel command in a separate terminal window:
  ```bash
  minikube tunnel
  ```
  Once running, you can access the API Gateway via `http://localhost:8080` (or via the IP provided by `minikube ip`).

---

## 4. Teardown / Removal

When you are done testing and want to remove all the resources from your Kubernetes cluster, run:

```bash
kubectl delete -f k8s/ --recursive
```
This will cleanly delete all Deployments, Services, ConfigMaps, and Secrets created by the apply command.

---

## ⚠️ Important Note regarding RabbitMQ
It appears that **RabbitMQ**, which is present in the `docker-compose.yml` for handling asynchronous messaging (e.g., payment updates), does not currently have Kubernetes deployment manifests in the `backend/k8s` directory. 

If your services depend on RabbitMQ, you will need to add a RabbitMQ deployment and service manifest to the cluster, or use an external RabbitMQ instance and update the ConfigMaps accordingly, otherwise services expecting the message queue might fail to start or operate correctly.

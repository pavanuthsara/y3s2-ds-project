Overview (What you’ll deploy)

You have:

9 Spring Boot microservices (Dockerized)
1 React frontend (Dockerized)
Likely using docker-compose

👉 On AWS, you’ll use:

EC2 → run your containers
ECR (Elastic Container Registry) → store Docker images
Docker Compose → run all services


Step 1: Prepare your project
1.1 Build all services

For each Spring Boot service:

mvn clean package
1.2 Ensure Dockerfiles exist

Each service should have a Dockerfile like:

FROM openjdk:17-jdk-slim
COPY target/app.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]

Frontend:

FROM node:18 as build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

Step 2: Create Docker images
docker build -t service1 .
docker build -t service2 .
...
docker build -t frontend .

Step 3: Push images to AWS ECR

3.1 Create repositories in Amazon ECR
Go to AWS Console → ECR
Create repos:
service1
service2
...
frontend

3.2 Authenticate Docker to ECR
aws ecr get-login-password --region your-region \
| docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

3.3 Tag & push images
docker tag service1:latest <repo-url>/service1
docker push <repo-url>/service1

Repeat for all services.

Step 4: Launch EC2 server

Go to Amazon EC2

Configure:
OS: Ubuntu 22.04
Instance type: t2.medium (minimum for 9 services)
Storage: 20–30GB
Security group:
22 (SSH)
80 (HTTP)
443 (HTTPS)
Custom ports (e.g., 3000, 8080+)

Step 5: Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

Step 6: Install Docker + Compose
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Install docker-compose
sudo apt install docker-compose -y

Step 7: Pull images from ECR

Login again inside EC2:

aws ecr get-login-password --region your-region \
| docker login --username AWS --password-stdin <repo-url>

Pull:

docker pull <repo-url>/service1


Step 8: Create docker-compose.yml

Example:

version: "3.8"

services:
  service1:
    image: <repo-url>/service1
    ports:
      - "8081:8080"

  service2:
    image: <repo-url>/service2
    ports:
      - "8082:8080"

  frontend:
    image: <repo-url>/frontend
    ports:
      - "80:80"


Step 9: Run your system
docker-compose up -d

Check:

docker ps


Step 10: Access your app
Frontend:
http://<EC2-PUBLIC-IP>
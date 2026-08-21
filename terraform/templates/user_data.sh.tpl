#!/bin/bash
set -euxo pipefail

dnf install -y docker
systemctl enable --now docker

DB_PASSWORD=$(aws ssm get-parameter --name "${db_password_param}" --with-decryption --query Parameter.Value --output text --region "${aws_region}")
FIREBASE_PROJECT_ID=$(aws ssm get-parameter --name "${firebase_project_id_param}" --query Parameter.Value --output text --region "${aws_region}")

aws ecr get-login-password --region "${aws_region}" | docker login --username AWS --password-stdin "${ecr_registry}"

docker pull "${ecr_repository_url}:latest"

docker rm -f backend 2>/dev/null || true

docker run -d \
  --name backend \
  --restart unless-stopped \
  -p ${backend_port}:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e ConnectionStrings__Postgres="Host=${db_host};Port=${db_port};Database=${db_name};Username=${db_username};Password=$DB_PASSWORD" \
  -e Firebase__ProjectId="$FIREBASE_PROJECT_ID" \
  "${ecr_repository_url}:latest"

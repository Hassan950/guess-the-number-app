# Infrastructure (AWS Free Tier)

Provisions:

- **EC2 t3.micro** running the backend container (Docker), pulled from ECR
- **RDS db.t3.micro** (Postgres 16), private, reachable only from the EC2 instance
- **S3 + CloudFront** serving the built frontend as a static site, with
  CloudFront also proxying `/api/*` to the EC2 instance so the browser only
  ever talks to one HTTPS origin (the EC2 instance itself has no TLS
  certificate, so calling it directly from an `https://` page would be
  blocked as mixed content)
- **ECR** repository for the backend image
- IAM role using **SSM Session Manager** for shell access (no open port 22 by default)

Everything sits in the account's **default VPC** and default subnets to avoid NAT
gateway charges, which are not part of the free tier.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.6
- AWS CLI configured with credentials that can create these resources
  (`aws configure`)
- Docker, to build and push the backend image to ECR

## First-time setup

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: set db_password and firebase_project_id

terraform init
terraform plan
terraform apply
```

This creates the ECR repo, RDS instance, EC2 instance, and S3/CloudFront
distribution. **The EC2 instance's first boot will fail to pull a backend
image**, because the ECR repo is empty on a fresh apply — that's expected.
Continue to the next step.

## Push the backend image (first time, and every deploy)

```bash
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin "$(terraform output -raw ecr_repository_url | cut -d/ -f1)"

docker build -t backend -f ../backend/Dockerfile ../backend
docker tag backend:latest "$(terraform output -raw ecr_repository_url):latest"
docker push "$(terraform output -raw ecr_repository_url):latest"
```

Then pull the new image onto the running instance via SSM (no SSH needed).
This re-runs the instance's user-data script, which re-fetches secrets from
SSM Parameter Store and restarts the container — the same thing the CI/CD
deploy job below does:

```bash
INSTANCE_ID=$(terraform output -raw backend_instance_id)
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["curl -s http://169.254.169.254/latest/user-data | bash"]' \
  --query "Command.CommandId" --output text)
aws ssm wait command-executed --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID"
```

## Deploy the frontend

```bash
cd ../frontend
npm run build

aws s3 sync dist/ "s3://$(cd ../terraform && terraform output -raw frontend_bucket_name)" --delete

aws cloudfront create-invalidation \
  --distribution-id "$(cd ../terraform && terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

Build the frontend with:

- `VITE_API_BASE_URL` = `terraform output backend_api_url` — this is the
  CloudFront domain, not the EC2 instance directly; the frontend's own API
  calls already include the `/api` prefix, and CloudFront routes those to EC2
- Firebase envs same as local dev

## CI/CD

Pushes to `main` that pass the `backend` and `frontend` CI jobs trigger a
`deploy` job ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) that
does everything in the two sections above automatically: builds and pushes
the backend image to ECR, redeploys it to EC2 via SSM, builds the frontend,
and syncs it to S3 with a CloudFront invalidation.

Terraform state is local and not committed, so the workflow can't read
`terraform output` directly — instead it relies on **repository variables and
secrets** you set once after `terraform apply` and update whenever the
underlying infrastructure changes (e.g. after an `terraform apply` that
replaces the EC2 instance or S3 bucket).

Set these under **Settings → Secrets and variables → Actions**:

**Repository variables** (`vars.*`, from `terraform output`):

| Variable | Terraform output |
| --- | --- |
| `AWS_REGION` | `var.aws_region` (e.g. `us-east-1`) |
| `ECR_REPOSITORY_URL` | `ecr_repository_url` |
| `EC2_INSTANCE_ID` | `backend_instance_id` |
| `S3_BUCKET_NAME` | `frontend_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |
| `BACKEND_API_URL` | `backend_api_url` |

**Repository secrets**:

| Secret | Value |
| --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Credentials for an IAM user/role that can push to ECR, run `ssm:SendCommand`/`ssm:GetCommandInvocation` against the backend instance, and read/write the frontend S3 bucket + CloudFront invalidations |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` | Same values as `frontend/.env` |

The `deploy` job also uses a `production` GitHub Environment — create one (or
remove the `environment:` line from the workflow) if you don't need the
extra approval/protection controls it provides.

## Notes

- Secrets (`db_password`, `firebase_project_id`) are stored in SSM Parameter
  Store and fetched by the instance at boot — never baked into the AMI or
  committed to the repo.
- The backend security group only allows inbound traffic on `backend_port`
  from CloudFront's IP range (the `com.amazonaws.global.cloudfront.origin-facing`
  managed prefix list), not the open internet — the API is only meant to be
  reached through the CloudFront proxy.
- If you're applying these changes on top of an already-running deployment:
  the EC2 instance's user-data script changed (it no longer sets a CORS
  origin), so `terraform apply` will **replace the EC2 instance**. The new
  instance re-pulls the existing `:latest` image from ECR automatically, so
  no rebuild is needed — but it does get a new public DNS name/instance ID,
  and the CloudFront distribution update can take 5-15 minutes to propagate
  globally before `/api/*` starts working through it.

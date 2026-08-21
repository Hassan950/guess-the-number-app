output "backend_public_dns" {
  description = "Public DNS of the backend EC2 instance"
  value       = aws_instance.backend.public_dns
}

output "backend_api_url" {
  description = "Base URL for the backend API (use for VITE_API_BASE_URL)"
  value       = "http://${aws_instance.backend.public_dns}:${var.backend_port}"
}

output "rds_endpoint" {
  description = "RDS postgres connection endpoint"
  value       = aws_db_instance.postgres.address
}

output "ecr_repository_url" {
  description = "Push backend images here (used by the CI/CD deploy job)"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_bucket_name" {
  description = "S3 bucket to sync `frontend/dist` into"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_domain_name" {
  description = "Public URL for the frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "Used for cache invalidation after a frontend deploy"
  value       = aws_cloudfront_distribution.frontend.id
}

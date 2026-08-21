variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix/tag all resources"
  type        = string
  default     = "guess-the-number"
}

variable "ssh_key_name" {
  description = "Name of an existing EC2 key pair to allow SSH access (leave blank to disable SSH)"
  type        = string
  default     = ""
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into the EC2 instance (only used if ssh_key_name is set)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "instance_type" {
  description = "EC2 instance type (free tier: t3.micro or t2.micro depending on account)"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "RDS instance class (free tier: db.t3.micro)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Postgres database name"
  type        = string
  default     = "guessthenumber"
}

variable "db_username" {
  description = "Postgres master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Postgres master password"
  type        = string
  sensitive   = true
}

variable "firebase_project_id" {
  description = "Firebase project ID used for backend token verification"
  type        = string
}

variable "backend_port" {
  description = "Port the backend container listens on (host port, mapped to container 8080)"
  type        = number
  default     = 8080
}

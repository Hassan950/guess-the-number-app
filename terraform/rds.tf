resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Project = var.project_name
  }
}

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"

  # Free tier: db.t3.micro, 20GB gp2, single-AZ, no extra backups beyond default
  instance_class        = var.db_instance_class
  allocated_storage     = 20
  storage_type          = "gp2"
  multi_az              = false
  publicly_accessible   = false
  db_subnet_group_name  = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Project = var.project_name
  }
}

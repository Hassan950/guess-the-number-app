data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

locals {
  user_data = templatefile("${path.module}/templates/user_data.sh.tpl", {
    aws_region                = var.aws_region
    ecr_registry              = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
    ecr_repository_url        = aws_ecr_repository.backend.repository_url
    db_host                   = aws_db_instance.postgres.address
    db_port                   = aws_db_instance.postgres.port
    db_name                   = var.db_name
    db_username               = var.db_username
    db_password_param         = aws_ssm_parameter.db_password.name
    firebase_project_id_param = aws_ssm_parameter.firebase_project_id.name
    backend_port              = var.backend_port
  })
}

data "aws_caller_identity" "current" {}

resource "aws_instance" "backend" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.backend.id]
  iam_instance_profile        = aws_iam_instance_profile.backend_ec2.name
  key_name                    = var.ssh_key_name != "" ? var.ssh_key_name : null
  user_data                   = local.user_data
  user_data_replace_on_change = true

  tags = {
    Name    = "${var.project_name}-backend"
    Project = var.project_name
  }
}

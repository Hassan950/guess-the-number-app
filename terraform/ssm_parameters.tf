resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/db_password"
  type  = "SecureString"
  value = var.db_password

  tags = {
    Project = var.project_name
  }
}

resource "aws_ssm_parameter" "firebase_project_id" {
  name  = "/${var.project_name}/firebase_project_id"
  type  = "String"
  value = var.firebase_project_id

  tags = {
    Project = var.project_name
  }
}

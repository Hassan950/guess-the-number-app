data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "backend_ec2" {
  name               = "${var.project_name}-backend-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Project = var.project_name
  }
}

# Lets us connect via SSM Session Manager instead of opening port 22
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.backend_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Lets the instance pull the backend image from ECR
resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.backend_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

data "aws_iam_policy_document" "read_ssm_parameters" {
  statement {
    actions = ["ssm:GetParameter", "ssm:GetParameters"]
    resources = [
      aws_ssm_parameter.db_password.arn,
      aws_ssm_parameter.firebase_project_id.arn,
    ]
  }
}

resource "aws_iam_role_policy" "read_ssm_parameters" {
  name   = "${var.project_name}-read-ssm-parameters"
  role   = aws_iam_role.backend_ec2.id
  policy = data.aws_iam_policy_document.read_ssm_parameters.json
}

resource "aws_iam_instance_profile" "backend_ec2" {
  name = "${var.project_name}-backend-ec2"
  role = aws_iam_role.backend_ec2.name
}

package test

import (
	"fmt"
	"testing"
	"time"

	"github.com/gruntwork-io/terratest/modules/aws"
	"github.com/gruntwork-io/terratest/modules/http-helper"
	"github.com/gruntwork-io/terratest/modules/random"
	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestTerraformQAInfrastructure testa a infraestrutura QA
func TestTerraformQAInfrastructure(t *testing.T) {
	t.Parallel()

	uniqueName := fmt.Sprintf("qa-test-%s", random.UniqueId())
	awsRegion := "us-east-1"

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: "../modules/qa-infrastructure",
		Vars: map[string]interface{}{
			"environment":   "test",
			"project_name":  uniqueName,
			"instance_type": "t3.micro",
			"min_size":      1,
			"max_size":      2,
		},
		EnvVars: map[string]string{
			"AWS_DEFAULT_REGION": awsRegion,
		},
	})

	// Cleanup
	defer terraform.Destroy(t, terraformOptions)

	// Deploy
	terraform.InitAndApply(t, terraformOptions)

	// Validate outputs
	vpcID := terraform.Output(t, terraformOptions, "vpc_id")
	assert.NotEmpty(t, vpcID, "VPC ID should not be empty")

	albDNS := terraform.Output(t, terraformOptions, "alb_dns_name")
	assert.NotEmpty(t, albDNS, "ALB DNS should not be empty")

	// Test HTTP endpoint
	url := fmt.Sprintf("http://%s/health", albDNS)
	http_helper.HttpGetWithRetry(
		t,
		url,
		nil,
		200,
		"OK",
		30,
		10*time.Second,
	)

	t.Log("✅ Infrastructure tests passed")
}

// TestVPCConfiguration valida configuração da VPC
func TestVPCConfiguration(t *testing.T) {
	t.Parallel()

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: "../modules/vpc",
		Vars: map[string]interface{}{
			"cidr_block":        "10.0.0.0/16",
			"availability_zones": []string{"us-east-1a", "us-east-1b"},
		},
	})

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	vpcID := terraform.Output(t, terraformOptions, "vpc_id")
	require.NotEmpty(t, vpcID)

	// Validate VPC exists in AWS
	vpc := aws.GetVpcById(t, vpcID, "us-east-1")
	assert.Equal(t, "10.0.0.0/16", vpc.CidrBlock)

	// Validate subnets
	publicSubnets := terraform.OutputList(t, terraformOptions, "public_subnet_ids")
	assert.Len(t, publicSubnets, 2, "Should have 2 public subnets")

	privateSubnets := terraform.OutputList(t, terraformOptions, "private_subnet_ids")
	assert.Len(t, privateSubnets, 2, "Should have 2 private subnets")

	t.Log("✅ VPC configuration tests passed")
}

// TestSecurityGroups valida security groups
func TestSecurityGroups(t *testing.T) {
	t.Parallel()

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: "../modules/security",
	})

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Validate security group rules
	sgID := terraform.Output(t, terraformOptions, "web_sg_id")
	assert.NotEmpty(t, sgID)

	// Check no 0.0.0.0/0 on port 22
	plan := terraform.InitAndPlanAndShowWithStruct(t, terraformOptions)
	for _, resource := range plan.ResourcePlannedValuesMap {
		if resource.Type == "aws_security_group_rule" {
			if port, ok := resource.AttributeValues["from_port"].(float64); ok {
				if port == 22 {
					cidr := resource.AttributeValues["cidr_blocks"]
					assert.NotContains(t, cidr, "0.0.0.0/0", "SSH should not be open to world")
				}
			}
		}
	}

	t.Log("✅ Security group tests passed")
}

// TestDatabaseModule valida módulo RDS
func TestDatabaseModule(t *testing.T) {
	t.Parallel()

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: "../modules/database",
		Vars: map[string]interface{}{
			"db_name":           "testdb",
			"instance_class":    "db.t3.micro",
			"allocated_storage": 20,
			"multi_az":          false,
		},
	})

	// Only run plan (don't create actual RDS)
	terraform.InitAndPlan(t, terraformOptions)

	// Validate plan outputs
	plan := terraform.InitAndPlanAndShowWithStruct(t, terraformOptions)

	for _, resource := range plan.ResourcePlannedValuesMap {
		if resource.Type == "aws_db_instance" {
			// Check encryption enabled
			encrypted := resource.AttributeValues["storage_encrypted"]
			assert.Equal(t, true, encrypted, "Storage should be encrypted")

			// Check not publicly accessible
			public := resource.AttributeValues["publicly_accessible"]
			assert.Equal(t, false, public, "DB should not be publicly accessible")
		}
	}

	t.Log("✅ Database module tests passed")
}

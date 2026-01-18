# CI/CD Pipeline Documentation

## Overview

This project uses a hybrid CI/CD approach combining GitHub Actions for continuous integration and Terraform Cloud for continuous delivery.

```
Pull Request → GitHub Actions (CI) → Review → Merge → Terraform Cloud (CD) → Production
```

## Architecture

### Continuous Integration (GitHub Actions)

**Triggered on**: Pull requests and pushes to `main`

**Purpose**: Validate code quality before merge

**Jobs**:
1. **app-test**: Build and test application code
   - Install dependencies
   - Run linter
   - Build Astro site
   - Run tests
   - Upload build artifacts

2. **terraform-check**: Validate infrastructure code
   - Format check (`terraform fmt`)
   - Initialize Terraform
   - Validate configuration
   - **Dry-run plan** (read-only, no state changes)
   - Comment plan results on PR

3. **security-scan**: Security vulnerability scanning
   - Trivy filesystem scanner
   - Upload results to GitHub Security

4. **ci-complete**: Overall status gate
   - Requires all jobs to pass
   - Used for branch protection

### Continuous Delivery (Terraform Cloud)

**Triggered on**: Merge to `main` branch

**Purpose**: Automatically deploy infrastructure changes

**Flow**:
1. Detects merge to `main`
2. Runs `terraform plan` remotely
3. **Auto-applies** if plan succeeds (no manual approval needed)
4. Updates infrastructure

**Execution**: Remote (runs in Terraform Cloud with service account credentials)

## Configuration

### GitHub Repository Secrets

Required secrets in repository settings:

| Secret | Purpose | How to Get |
|--------|---------|------------|
| `TF_API_TOKEN` | Terraform Cloud authentication | [Create user token](https://app.terraform.io/app/settings/tokens) |

### Terraform Cloud Variables

Workspace: `corp-website`

**Environment Variables**:
- `GOOGLE_CREDENTIALS`: GCP service account JSON (sensitive)

**Terraform Variables** (from Variable Sets):
- `cloudflare_zone_id`: Cloudflare Zone ID
- `cloudflare_api_token`: Cloudflare API token (sensitive)
- `google_project_id`: GCP project ID
- `domain`: Domain name

### Service Account Permissions

**Service Account**: `terraform-cloud-automation@corp-core-hub.iam.gserviceaccount.com`

**IAM Roles**:
- `roles/firebasehosting.admin` - Manage Firebase Hosting sites and domains
- `roles/firebase.viewer` - Read Firebase project configuration
- `roles/serviceusage.serviceUsageConsumer` - Make API calls

## Workflow

### Development Flow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-change
   ```

2. **Make changes** to application or infrastructure code

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feature/my-change
   ```

4. **Create Pull Request**
   - GitHub Actions runs automatically
   - View CI results in PR checks
   - Terraform plan posted as PR comment
   - Security scan results in Security tab

5. **Code Review**
   - Review application changes
   - Review infrastructure plan
   - Check CI status (all must pass)
   - Request changes or approve

6. **Merge to main**
   - Requires:
     - ✅ All CI checks passing
     - ✅ Approved review(s)
     - ✅ Up-to-date with main
   
7. **Automatic Deployment**
   - Terraform Cloud detects merge
   - Runs terraform plan
   - Auto-applies changes
   - Infrastructure updated

### Emergency Rollback

If auto-apply causes issues:

1. **Via Terraform Cloud UI**:
   - Go to workspace → States
   - Select previous good state
   - "Restore this state"

2. **Via Git**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
   - Triggers new auto-apply with reverted config

3. **Manual Override**:
   - Temporarily disable auto-apply in workspace settings
   - Run manual terraform apply with fixes
   - Re-enable auto-apply

## Branch Protection Rules

**Branch**: `main`

**Required**:
- ✅ Require pull request before merging
- ✅ Require status checks to pass before merging
  - `CI Passed` (overall gate)
  - `Test Application Code`
  - `Validate Infrastructure Code`
  - `Security Checks`
- ✅ Require branches to be up to date
- ✅ Require approval before merging (1 reviewer)
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

## Monitoring & Alerts

### GitHub Actions

- **View runs**: Repository → Actions tab
- **Failed runs**: Receive email notification (if configured)
- **Artifacts**: Available for 7 days after run

### Terraform Cloud

- **View runs**: https://app.terraform.io/app/kattakath-technologies-inc/workspaces/corp-website/runs
- **State history**: Workspace → States tab
- **Notifications** (optional):
  - Slack integration
  - Email on failures
  - Webhook for custom integrations

## Testing the Pipeline

### Test 1: Application Change

```bash
# Make a small app change
echo "// test comment" >> src/pages/index.astro

# Commit and create PR
git checkout -b test/ci-app
git add .
git commit -m "test: CI pipeline for app changes"
git push origin test/ci-app

# Create PR and observe:
# ✅ app-test runs build
# ✅ terraform-check shows no changes
# ✅ security-scan completes
# ✅ Plan comment posted
```

### Test 2: Infrastructure Change

```bash
# Make a safe infrastructure change
# Edit main.tf to add a description
git checkout -b test/ci-infra
# ... make change ...
git push origin test/ci-infra

# Create PR and observe:
# ✅ terraform-check shows planned changes
# ✅ Plan details in PR comment
# ✅ All checks pass

# After merge:
# ✅ Terraform Cloud auto-applies
# ✅ Infrastructure updated
```

## Troubleshooting

### CI Failures

**"Terraform format check failed"**
```bash
terraform fmt -recursive
git add .
git commit -m "fix: format terraform files"
```

**"Build failed"**
- Check build logs in Actions tab
- Run `npm run build` locally to reproduce
- Fix errors and push again

**"Security vulnerabilities found"**
- View details in Security → Code scanning alerts
- Update dependencies: `npm update`
- Or suppress if false positive

### CD Failures

**"Terraform plan failed in Terraform Cloud"**
- Check run details in Terraform Cloud UI
- Common issues:
  - Invalid syntax (should be caught by CI)
  - Provider authentication (check service account permissions)
  - Resource conflicts

**"Auto-apply failed"**
- View apply logs in Terraform Cloud
- Check if manual intervention needed
- Use workspace lock if needed during investigation

### Credential Issues

**"GOOGLE_CREDENTIALS invalid"**
```bash
# Regenerate service account key
gcloud iam service-accounts keys create new-key.json \
  --iam-account=terraform-cloud-automation@corp-core-hub.iam.gserviceaccount.com

# Update in Terraform Cloud (see Service Account section)
```

**"TF_API_TOKEN expired"**
- Generate new token at https://app.terraform.io/app/settings/tokens
- Update GitHub secret: Settings → Secrets → TF_API_TOKEN

## Security Best Practices

### Secrets Management

- ✅ All credentials in Terraform Cloud or GitHub Secrets
- ✅ Service account follows principle of least privilege
- ✅ Secrets marked as sensitive
- ✅ `.gitignore` prevents credential commits

### Service Account Rotation

Rotate service account keys every 90 days:

```bash
# 1. Create new key
gcloud iam service-accounts keys create rotated-key.json \
  --iam-account=terraform-cloud-automation@corp-core-hub.iam.gserviceaccount.com

# 2. Update Terraform Cloud variable
# (Use upload-creds.py script or manual UI update)

# 3. Test with a terraform plan

# 4. Delete old key
gcloud iam service-accounts keys delete OLD_KEY_ID \
  --iam-account=terraform-cloud-automation@corp-core-hub.iam.gserviceaccount.com

# 5. Verify
gcloud iam service-accounts keys list \
  --iam-account=terraform-cloud-automation@corp-core-hub.iam.gserviceaccount.com
```

### Audit Trail

- **Git commits**: Who changed what and when
- **PR reviews**: Approval history
- **GitHub Actions logs**: CI execution details (90 days)
- **Terraform Cloud runs**: Full state history and apply logs
- **GCP Audit Logs**: Service account activity

## Cost Considerations

### GitHub Actions

- **Free tier**: 2,000 minutes/month for private repos
- **Current usage**: ~5 minutes per PR (app build + terraform checks)
- **Estimate**: ~400 PRs/month within free tier

### Terraform Cloud

- **Free tier**: Up to 500 resources
- **Current usage**: 5 resources
- **Runs**: Unlimited on free tier
- **State storage**: Free

## Future Enhancements

### Staging Environment

Add a staging workspace:
```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [develop]
# Deploy to staging workspace before production
```

### Preview Deployments

For visual changes:
- Deploy to Firebase preview channels
- Post preview URL in PR comment
- Automatic cleanup after merge

### Advanced Monitoring

- Terraform Cloud Sentinel policies (Team tier)
  - Cost estimation before apply
  - Policy as Code (deny dangerous changes)
  - Compliance checks
- Notification webhooks to Slack
- Datadog/New Relic integration

### Multi-Environment

```
Organization: kattakath-technologies-inc
└── Project: corp-core-hub
    ├── Workspace: corp-website-staging (auto-apply on develop branch)
    ├── Workspace: corp-website (auto-apply on main branch)
    └── Workspace: dns-management (shared)
```

## Support & Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Terraform Cloud Docs**: https://developer.hashicorp.com/terraform/cloud-docs
- **Workflow File**: `.github/workflows/ci.yml`
- **Terraform Backend**: `backend.tf`
- **CI/CD Issues**: Create GitHub issue with `ci/cd` label

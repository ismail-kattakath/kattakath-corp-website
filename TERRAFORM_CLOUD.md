# Terraform Cloud Setup Guide

## Organization Hierarchy

Understanding the structure (top to bottom):

```
Organization: kattakath-technologies-inc
└── Projects (logical grouping of related workspaces)
    └── Workspaces (individual infrastructure/environments)
        └── Resources (actual infrastructure)
```

**Key Concept**: Projects **contain** Workspaces (not the other way around!)

## Organization Structure

**Organization**: `kattakath-technologies-inc` (org-YhnSUp1qGRnzd9Gx)

### Projects

- **corp-core-hub** (prj-SzLuA24BUgWjWooU)
  - **Purpose**: Core infrastructure for Kattakath Technologies Inc
  - **Scope**: Websites, DNS management, shared services
  - **Strategy**: Centralized management of common resources
  
  **Future Expansion**:
  - DNS management workspace (centralized DNS for all properties)
  - Shared services workspace (monitoring, logging, etc.)based on scope:

#### 1. Cloudflare Credentials (varset-KmRNsREA72jWnwg9)
**Purpose**: Cloudflare API credentials - shared across all infrastructure workspaces

| Variable | Type | Sensitive | Value |
|----------|------|-----------|-------|
| `cloudflare_zone_id` | Terraform | No | 6e28971881e488941d052bbbf50d69cd |
| `cloudflare_api_token` | Terraform | Yes | (hidden) |

**Scope**: **Project-level** (`corp-core-hub`) - Shared across ALL workspaces in the project

**Rationale**: DNS management is centralized; multiple workspaces may need Cloudflare access (e.g., website workspaces, dedicated DNS workspace)

#### 2. GCP Firebase Credentials (varset-uMGUoGqYxPPzC6K7)
**Purpose**: Google Cloud Platform credentials - Firebase projects

| Variable | Type | Sensitive | Value |
|----------|------|-----------|-------|
| `google_project_id` | Terraform | No | corp-core-hub |
| `domain` | Terraform | No | kattakath.com |

**Scope**: **Project-level** (`corp-core-hub`) - Shared across ALL workspaces in the project

**Rationale**: Currently website-specific but can be shared if you add more Firebase-based workspaces (e.g., mobile apps, additional sites) to local credentials

### Variable Sets

Variables are organized into logical sets and automatically applied to the workspace:

#### 1. GCP Credentials (varset-uMGUoGqYxPPzC6K7)
**Purpose**: Google Cloud Platform credentials for Firebase and GCP resources

| Variable | Type | Sensitive | Value |
|----------|------|-----------|-------|
| `google_project_id` | Terraform | No | 709817050082 |
| `domain` | Terraform | No | kattakath.com |

**Scope**: Applied to `kattakath-com` workspace

#### 2. Cloudflare Credentials (varset-KmRNsREA72jWnwg9)
**Purpose**: Cloudflare API credentials for DNS management

| Variable | Type | Sensitive | Value |
|----------|------|-----------|-------|
| `cloudflare_zone_id` | Terraform | No | 6e28971881e488941d052bbbf50d69cd |
| `cloudflare_api_token` | Terraform | Yes | (hidden) |

**Scope**: Applied to `kattakath-com` workspace

**Hierarchy**: Organization → Projects → Workspaces → Resources

- **Projects**: Logical grouping of related workspaces (e.g., "enterprise-core" for all core infrastructure)
- **Workspaces**: Individual infrastructure components or environments (e.g., website, DNS, monitoring)

**Your Enterprise Setup**:
```
Organization: kattakath-technologies-inc
└── Project: enterprise-core (broad scope for core infrastructure)
    ├── Workspace: kattakath-com (website hosting)
    ├── Workspace: dns-management (future - centralized DNS)
    └── Workspace: shared-services (future - monitoring, logging)
```

**Benefits of This Structure**:
- ✅ Project-level variables shared across workspaces (e.g., Cloudflare credentials)
- ✅ Easy to add new workspaces without reconfiguring credentials
- ✅ Clear separation of concerns (each workspace owns specific infrastructure)
- ✅ Scalable as organization grows

### Variable Sets vs Workspace Variables

**Variable Set Scoping Options**:

| Scope | Applied To | Use Case | Example |
|-------|-----------|----------|---------|
| **Global** | All workspaces in org | Rarely used credentials | (Not used in your setup) |
| **Project-level** | All workspaces in a project | Shared credentials/config | Cloudflare API token ✅ |
| **Workspace-level** | Single workspace only | Workspace-specific config | (Reserved for future use) |

**Your Current Setup**: 
- **Project-level Variable Sets**: Cloudflare + GCP credentials
  - Automatically available to all workspaces in `enterprise-core` project
  - Add a new workspace? It gets these variables automatically!
- **Workspace Variables**: None currently needed
  - Use when a workspace needs unique configuration (e.g., different Firebase project)ation

**Current Setup**: 
- All variables in Variable Sets (easier to manage and reuse)
- No workspace-specific variables needed

### Execution Modes

| Mode | State Location | Execution Location | Use Case |
|------|---------------|-------------------|----------|
| **Remote** | Terraform Cloud | Terraform Cloud | Full CI/CD, shared credentials in TF Cloud |
| **Local** | Terraform Cloud | Your Machine | Local credentials (like your setup) |
| **Agent** | Terraform Cloud | Self-hosted Agent | Private networks, custom runners |

**Current Setup**: Local execution (your machine) + Remote state (Terraform Cloud)

### VCS Integration (Optional)

**Status**: Not configured

**Benefits if enabled**:
- Automatic `terraform plan` on pull requests
- Automatic `terraform apply` on merge to main branch
- Infrastructure changes tracked in git history
- Collaborative review process via GitHub PRs

**To enable**: Go to Terraform Cloud UI → Settings → Version Control → Connect to GitHub → Select `ismail-kattakath/kattakath-com` repository

## Current State

### Resources Managed (5 total)

```
cloudflare_record.firebase_verification    # TXT record for Firebase domain verification
cloudflare_record.root_a                   # A record pointing to Firebase Hosting
google_firebase_hosting_custom_domain      # Custom domain configuration
google_firebase_hosting_site.default_site  # Default Firebase Hosting site
google_firebase_hosting_site.site          # kattakath-com Firebase Hosting site
```

### Backend Configuration

```hcl
terraform {
  cloud {
    organization = "kattakath-technologies-inc"
    workspaces {
      name = "kattakath-com"
    }
  }
}
```

## Workflow

### Daily Operations

1. **Make changes** to `.tf` files locally
2. **Plan changes**: `terraform plan`
   - Execution: Runs locally on your machine
   - State: Fetched from Terraform Cloud
   - Credentials: Uses local `gcloud` and `firebase` CLI
3. **Apply changes**: `terraform apply`
   - Execution: Runs locally
   - State: Saved to Terraform Cloud
   - Locking: Handled automatically by Terraform Cloud

### Collaboration

With Terraform Cloud backend:
- ✅ State locking prevents concurrent modifications
- ✅ State versioning allows rollback
- ✅ State history shows who made what changes
- ✅ Remote state can be shared with team members

## Security

### Sensitive Data Storage

| Credential | Local Storage | Terraform Cloud | Git Repository |
|------------|---------------|-----------------|----------------|
| GCP credentials | `~/.config/gcloud/` | Not stored (local execution) | ❌ Never commit |
| Firebase credentials | `~/.config/firebase/` | Not stored (local execution) | ❌ Never commit |
| Cloudflare API token | `terraform.tfvars` (gitignored) | Variable Set (encrypted) | ❌ Never commit |
| Cloudflare Zone ID | `terraform.tfvars` (gitignored) | Variable Set | ❌ Never commit |

### Best Practices

1. **Never commit** `terraform.tfvars` (already in `.gitignore`)
2. **Use Variable Sets** for shared credentials across workspaces
3. **Mark sensitive variables** as sensitive in Terraform Cloud
4. **Local execution** keeps cloud provider credentials on your machine
5. **State encryption** is automatic in Terraform Cloud

## Access Management

### Terraform Cloud Authentication

Your local CLI is authenticated with an API token stored in:
```
~/.terraform.d/credentials.tfrc.json
```

**Token**: (stored securely in credentials file)

**Permissions**: Organization-level access

**To authenticate a new machine**: `terraform login`

## Useful Commands

### Terraform Cloud Management

```bash
# View current workspace info
terraform workspace show

# View state from Terraform Cloud
terraform state list

# View specific resource
terraform state show <resource_name>

# View outputs
terraform output
```

### Workspace Management via API

```bash
# Set Terraform Cloud token
export TFC_TOKEN=$(cat ~/.terraform.d/credentials.tfrc.json | jq -r '.credentials."app.terraform.io".token')

# List workspaces
curl -s \
  --header "Authorization: Bearer $TFC_TOKEN" \
  Project**: https://app.terraform.io/app/kattakath-technologies-inc/projects/enterprise-core

**--header "Content-Type: application/vnd.api+json" \
  "https://app.terraform.io/api/v2/organizations/kattakath-technologies-inc/workspaces" \
  | jq '.data[] | {name: .attributes.name, id: .id}'

# View workspace details
curl -s \
  --header "Authorization: Bearer $TFC_TOKEN" \
  "https://app.terraform.io/api/v2/workspaces/ws-cfBjPeFsyq5o6rSm" \
  | jq '.data.attributes | {name, "execution-mode", "terraform-version", description}'

# List variable sets
curl -s \
  --header "Authorization: Bearer $TFC_TOKEN" \
  "https://app.terraform.io/api/v2/organizations/kattakath-technologies-inc/varsets" \
  | jq '.data[] | {name: .attributes.name, id: .id, "var-count": .attributes."var-count"}'
```

## Web Interface

**Organization**: https://app.terraform.io/app/kattakath-technologies-inc

**Workspace**: https://app.terraform.io/app/kattakath-technologies-inc/workspaces/kattakath-com

### What You'll See in the UI

- **States**: History of all state versions with timestamps
- **Variables**: All variables from Variable Sets applied to this workspace
- **Runs**: History of plans and applies (will be empty with local execution)
- **Settings**: Workspace configuration, VCS, notifications

## Migration History

**Previous Backend**: Google Cloud Storage
- Bucket: `kattakath-com-firebase-tf-state`
- Path: `terraform/state/default.tfstate`
- Status: **Deleted** (migrated to Terraform Cloud)

**Migration Date**: January 18, 2026

**Migration Process**:
1. Downloaded state from GCS bucket
2. Created fresh Terraform Cloud workspace
3. Pushed state to Terraform Cloud via CLI
4. Verified all 5 resources migrated successfully
5. Deleted GCS bucket

## Troubleshooting

### "No changes" when expecting changes

```bash
# Refresh state from cloud
terraform refresh

# Force state pull
terraform state pull > state.json
```

### Variables not being picked up

```bash
# Check what variables TF Cloud is providing
terraform plan -var-file=/dev/null

# If using local execution, variables from Variable Sets are available
# No need for terraform.tfvars unless you want local overrides
```Expansion Strategy

### Adding New Workspaces to enterprise-core Project

When you need to add new infrastructure components:

#### Example: DNS Management Workspace

```bash
# Create new workspace via API
curl -s \
  --header "Authorization: Bearer $TFC_TOKEN" \
  --header "Content-Type: application/vnd.api+json" \
  --request POST \
  --data @- \
  https://app.terraform.io/api/v2/organizations/kattakath-technologies-inc/workspaces <<EOF
{
  "data": {
    "type": "workspaces",
    "attributes": {
      "name": "dns-management",
      "description": "Centralized DNS management for all Kattakath domains",
      "execution-mode": "local",
      "terraform-version": "1.5.7"
    },
    "relationships": {
      "project": {
        "data": {
          "id": "prj-SzLuA24BUgWjWooU",
          "type": "projects"
        }
      }
    }
  }
}
EOF
```

**Automatic Benefits**:
- ✅ Cloudflare credentials automatically available (project-level variable set)
- ✅ GCP credentials automatically available (project-level variable set)
- ✅ Consistent execution mode and Terraform version
- ✅ Part of `enterprise-core` project for organizational clarity

#### Example: Shared Services Workspace

For monitoring, logging, alerting infrastructure:
- Create workspace: `shared-services`
- Same project: `enterprise-core`
- Gets same project-level credentials automatically
- Manages: CloudWatch, Datadog, PagerDuty, etc.

### Variable Set Strategy for New Workspaces

**When to use Project-level Variable Sets**:
- Credentials shared across multiple workspaces (✅ Current: Cloudflare, GCP)
- Common configuration (domain names, organization IDs)
- Infrastructure that multiple workspaces depend on

**When to use Workspace-level Variables**:
- Workspace-specific configuration
- Different values per environment (if you add staging/prod workspaces)
- Sensitive data unique to one workspace

## 

### State locking errors

```bash
# Force unlock (only if you're sure no other operation is running)
terraform force-unlock <lock-id>
```

### Authentication issues

```bash
# Re-authenticate
terraform login

# Verify token
cat ~/.terraform.d/credentials.tfrc.json
```

## Next Steps (Optional)

### 1. Enable VCS Integration

Connect your GitHub repository for automatic runs:
1. Go to Workspace Settings → Version Control
2. Connect to GitHub
3. Select `ismail-kattakath/kattakath-com` repository
4. Configure: Auto-apply = false, Trigger patterns = `*.tf`

### 2. Add Team Members

Invite collaborators:
1. Go to Organization Settings → Teams
2. Create teams (e.g., "admins", "developers")
3. Assign permissions per workspace

### 3. Enable Notifications

Get alerts for runs:
1. Workspace Settings → Notifications
2. Add Slack, Email, or webhook integrations
3. Configure triggers (failures, approvals needed, etc.)

### 4. Implement Run Triggers

Automatically run this workspace when dependencies change:
1. Create dependency workspaces (e.g., networking, DNS)
2. Configure run triggers between workspaces

### 5. Add Sentinel Policies (Team & Governance plan)

Enforce compliance:
- Cost limits per apply
- Required tags on resources
- Naming conventions
- Security policies

## Support

- **Terraform Cloud Docs**: https://developer.hashicorp.com/terraform/cloud-docs
- **API Docs**: https://developer.hashicorp.com/terraform/cloud-docs/api-docs
- **Community Forum**: https://discuss.hashicorp.com/c/terraform-cloud

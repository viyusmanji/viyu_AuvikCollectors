---
sidebar_position: 3
---

# Naming Convention Standards

Standardized naming conventions for hostnames, site codes, IP addressing, and documentation to ensure consistency across multi-site Auvik collector deployments.

## Overview

Consistent naming conventions are critical for multi-site deployments. They enable:

- **Quick identification** of device location and purpose
- **Predictable IP addressing** for network planning
- **Efficient troubleshooting** when issues arise
- **Scalable documentation** as fleet grows
- **Clear communication** between teams and clients

Establish conventions early and enforce them across all deployments.

## Hostname Format Standard

### Standard Format

```
auvik-{clientcode}-{sitecode}
```

All lowercase, hyphens only (no underscores or spaces).

### Component Breakdown

| Component | Rules | Examples |
|-----------|-------|----------|
| **Prefix** | Always `auvik` | `auvik` |
| **Client Code** | 3-8 characters, abbreviation or acronym | `acme`, `globex`, `initech` |
| **Site Code** | 2-6 characters, location identifier | `hq`, `branch1`, `dc`, `nyc` |

### Hostname Examples

| Hostname | Client | Site | Notes |
|----------|--------|------|-------|
| `auvik-acme-hq` | Acme Corp | Headquarters | Simple HQ naming |
| `auvik-acme-branch1` | Acme Corp | Branch Office 1 | Numbered branches |
| `auvik-acme-chicago` | Acme Corp | Chicago Office | City name |
| `auvik-globex-dc` | Globex | Data Center | Abbreviated site type |
| `auvik-globex-dc2` | Globex | Data Center 2 | Multiple of same type |
| `auvik-initech-austin` | Initech | Austin Office | Full city name |
| `auvik-widgetco-warehouse` | Widget Co | Warehouse | Descriptive location |
| `auvik-techstart-remote` | TechStart | Remote Site | Generic remote |

### Maximum Length

Hostnames should be **24 characters or less** for compatibility:

```bash
# Good (19 chars)
auvik-acme-chicago

# Good (23 chars)
auvik-widgetco-warehouse

# Avoid (27 chars - too long)
auvik-verylongclientname-hq

# Better alternative (21 chars)
auvik-vlcn-hq
```

### Hostname Anti-Patterns

❌ **Avoid these patterns:**

| Bad Example | Issue | Better Alternative |
|-------------|-------|-------------------|
| `Auvik-ACME-HQ` | Mixed case | `auvik-acme-hq` |
| `auvik_acme_hq` | Underscores | `auvik-acme-hq` |
| `auvikacmehq` | No delimiters | `auvik-acme-hq` |
| `acme-hq` | Missing prefix | `auvik-acme-hq` |
| `auvik-acme-office-1` | Too verbose | `auvik-acme-off1` |
| `auvik-client1-site1` | Non-descriptive | `auvik-acme-hq` |
| `auvik-acme-192-168-1-50` | IP in hostname | `auvik-acme-hq` |

## Client Code Standards

### Creating Client Codes

Client codes should be short, memorable, and unique across your organization.

**Best Practices:**

1. **Use company acronym** if well-known
   - Acme Corporation → `acme`
   - Widget Manufacturing Co → `widgetco`
   - TechStart Solutions → `techstart`

2. **Abbreviate long names** consistently
   - Very Long Company Name LLC → `vlcn`
   - International Business Corp → `ibc`

3. **Avoid generic codes**
   - ❌ `client1`, `client2`, `test`
   - ✅ `acme`, `globex`, `initech`

4. **Handle duplicates** with suffix
   - First "ABC Corp" → `abc`
   - Second "ABC Corp" (different company) → `abc2` or `abc-east`

### Client Code Registry

Maintain a centralized registry:

| Client Code | Full Name | Active Sites | Notes |
|-------------|-----------|--------------|-------|
| `acme` | Acme Corporation | 12 | Main MSP client |
| `globex` | Globex Industries | 3 | Recent acquisition |
| `initech` | Initech LLC | 8 | Long-term customer |
| `widgetco` | Widget Manufacturing Co | 5 | Multi-state deployment |
| `techstart` | TechStart Solutions | 2 | Startup client |

Update this registry whenever adding new clients.

## Site Code Standards

### Creating Site Codes

Site codes identify specific locations within a client organization.

**Recommended Patterns:**

| Pattern | Example | Use Case |
|---------|---------|----------|
| **Geographic** | `nyc`, `chicago`, `austin` | City-based locations |
| **Functional** | `hq`, `dc`, `warehouse` | Site purpose |
| **Numbered** | `branch1`, `branch2`, `dc2` | Multiple similar sites |
| **Regional** | `east`, `west`, `central` | Regional offices |
| **Abbreviated** | `msp` (Minneapolis), `stl` (St. Louis) | Airport codes or common abbreviations |

### Site Code Examples by Client Type

**Single-Location Client:**
```
auvik-acme-hq          # Only one site
```

**Multi-Branch Retail:**
```
auvik-retail-store01   # Store 1
auvik-retail-store02   # Store 2
auvik-retail-dc        # Distribution center
auvik-retail-hq        # Corporate HQ
```

**Geographic Distribution:**
```
auvik-national-nyc     # New York office
auvik-national-chi     # Chicago office
auvik-national-la      # Los Angeles office
auvik-national-hq      # Corporate HQ (separate from offices)
```

**Functional Sites:**
```
auvik-mfg-plant1       # Manufacturing plant 1
auvik-mfg-plant2       # Manufacturing plant 2
auvik-mfg-warehouse    # Warehouse
auvik-mfg-office       # Corporate office
```

### Site Code Anti-Patterns

❌ **Avoid:**

- Very long codes: `distribution-center` → Use `dc`
- Spaces or special chars: `branch 1` → Use `branch1`
- Duplicate codes for same client (each must be unique)
- IP addresses in site codes: `site-192-168` → Use descriptive name

## IP Addressing Standards

### IP Address Assignment

Standardize IP addresses for Auvik collectors across all sites.

**Recommended Pattern:**

```
10.{site}.{subnet}.50
```

Where:
- **Site** = Unique identifier per location (1-255)
- **Subnet** = Network segment (typically `1` for management)
- **50** = Standard host address for Auvik collectors

### IP Addressing Examples

| Client | Site | IP Address | Subnet | Notes |
|--------|------|------------|--------|-------|
| Acme | HQ | `10.1.1.50` | `10.1.1.0/24` | Site 1 |
| Acme | Branch 1 | `10.2.1.50` | `10.2.1.0/24` | Site 2 |
| Acme | Branch 2 | `10.3.1.50` | `10.3.1.0/24` | Site 3 |
| Globex | Data Center | `10.10.1.50` | `10.10.1.0/24` | Site 10 |
| Globex | Office | `10.11.1.50` | `10.11.1.0/24` | Site 11 |

### Alternative Patterns

**Client-Specific Subnet Ranges:**

```
Client A: 10.100.x.50  (all sites in 10.100.0.0/16)
Client B: 10.101.x.50  (all sites in 10.101.0.0/16)
Client C: 10.102.x.50  (all sites in 10.102.0.0/16)
```

**Existing IP Scheme Integration:**

If client already has established IP scheme:

```
Existing network: 192.168.10.0/24
Auvik collector:  192.168.10.50
```

Always coordinate with client's network team.

### IP Documentation Template

Document every IP assignment:

```csv
hostname,ip_address,subnet_mask,gateway,vlan,site_id
auvik-acme-hq,10.1.1.50,255.255.255.0,10.1.1.1,100,ACME-HQ-001
auvik-acme-branch1,10.2.1.50,255.255.255.0,10.2.1.1,100,ACME-BR1-001
```

## Documentation Standards

### Required Documentation Fields

For each Auvik collector deployment, document:

| Field | Example | Source |
|-------|---------|--------|
| **Client Name** | Acme Corporation | Client contract |
| **Site Name** | Headquarters | Client site list |
| **Hostname** | `auvik-acme-hq` | Naming convention |
| **IP Address** | `10.1.1.50` | Network documentation |
| **Subnet Mask** | `255.255.255.0` or `/24` | Network documentation |
| **Gateway** | `10.1.1.1` | Network documentation |
| **VLAN** | `100` (Management) | Network documentation |
| **MAC Address** | `d8:3a:dd:12:34:56` | From device |
| **Serial Number** | `10000000abcd1234` | From Pi board |
| **Tailscale IP** | `100.64.1.50` | Tailscale admin |
| **Auvik Site** | `acme-headquarters` | Auvik portal |
| **Deploy Date** | `2026-02-03` | Deployment day |
| **Technician** | John Doe | Deployment records |
| **Asset Tag** | `AUVIK-001` | Asset label |

### Documentation Formats

**Spreadsheet (Recommended for < 50 sites):**

```
Client    | Site   | Hostname       | IP         | Gateway   | VLAN | Deploy Date
----------|--------|----------------|------------|-----------|------|------------
Acme Corp | HQ     | auvik-acme-hq  | 10.1.1.50  | 10.1.1.1  | 100  | 2026-02-03
Acme Corp | Branch | auvik-acme-br1 | 10.2.1.50  | 10.2.1.1  | 100  | 2026-02-05
```

**CMDB/Asset Management System (Recommended for > 50 sites):**

Integrate with:
- IT Glue
- Hudu
- Device42
- NetBox
- Custom CMDB

**CSV Export Template:**

```csv
client_name,site_name,hostname,ip_address,subnet_mask,gateway,vlan,mac_address,serial_number,tailscale_ip,auvik_site,deploy_date,technician,asset_tag,notes
Acme Corporation,Headquarters,auvik-acme-hq,10.1.1.50,255.255.255.0,10.1.1.1,100,d8:3a:dd:12:34:56,10000000abcd1234,100.64.1.50,acme-headquarters,2026-02-03,John Doe,AUVIK-001,Deployed successfully
```

### Asset Label Standards

Physical labels applied to each device should include:

```
viyu.net - Auvik Collector
═══════════════════════════
Hostname: auvik-acme-hq
IP: 10.1.1.50
Client: Acme Corp
Site: Headquarters
Deployed: 2026-02-03
Asset: AUVIK-001
```

**Label Specifications:**

- **Size**: 2" × 3" minimum
- **Material**: Polyester or vinyl (durable)
- **Adhesive**: Permanent
- **Placement**: Top or side of case (visible when rack-mounted)
- **Font**: Monospaced, 10pt minimum
- **Color**: White background, black text

## Multi-Client Organization

### Auvik Portal Organization

Structure Auvik portal to mirror naming conventions:

```
Organization: Your MSP Name
├── Client: Acme Corporation
│   ├── Site: Headquarters (auvik-acme-hq)
│   ├── Site: Branch 1 (auvik-acme-branch1)
│   └── Site: Chicago (auvik-acme-chicago)
├── Client: Globex Industries
│   ├── Site: Data Center (auvik-globex-dc)
│   └── Site: Office (auvik-globex-office)
└── Client: Initech LLC
    ├── Site: Austin (auvik-initech-austin)
    └── Site: Remote (auvik-initech-remote)
```

**Benefits:**

- Hostname matches Auvik site name
- Easy to locate devices
- Clear client/site hierarchy
- Simplified reporting

### Tailscale Device Naming

Tailscale devices should use the same hostname:

```bash
# Rename device in Tailscale
tailscale set --hostname auvik-acme-hq
```

Verify in Tailscale admin panel that device name matches hostname.

### File/Script Naming

For deployment files and scripts:

```
deployments/
├── acme/
│   ├── acme-deployment-plan.csv
│   ├── auvik-acme-hq-config.sh
│   └── auvik-acme-branch1-config.sh
├── globex/
│   ├── globex-deployment-plan.csv
│   └── auvik-globex-dc-config.sh
└── templates/
    └── deployment-template.csv
```

## Validation and Enforcement

### Hostname Validation Script

```bash
#!/bin/bash
# validate-hostname.sh - Check hostname against naming convention

HOSTNAME=$1

# Check format: auvik-{client}-{site}
if [[ ! $HOSTNAME =~ ^auvik-[a-z0-9]+-[a-z0-9]+$ ]]; then
  echo "❌ INVALID: Must be format 'auvik-{client}-{site}' (lowercase, hyphens only)"
  exit 1
fi

# Check length
if [ ${#HOSTNAME} -gt 24 ]; then
  echo "❌ INVALID: Hostname too long (max 24 chars, got ${#HOSTNAME})"
  exit 1
fi

# Check no uppercase
if [[ $HOSTNAME =~ [A-Z] ]]; then
  echo "❌ INVALID: Contains uppercase letters"
  exit 1
fi

# Check no underscores
if [[ $HOSTNAME =~ _ ]]; then
  echo "❌ INVALID: Contains underscores (use hyphens)"
  exit 1
fi

echo "✅ VALID: $HOSTNAME"
exit 0
```

Usage:
```bash
./validate-hostname.sh auvik-acme-hq
# ✅ VALID: auvik-acme-hq

./validate-hostname.sh Auvik-ACME-HQ
# ❌ INVALID: Contains uppercase letters

./validate-hostname.sh auvik_acme_hq
# ❌ INVALID: Contains underscores (use hyphens)
```

### Pre-Deployment Checklist

Before deploying any collector, verify:

- [ ] Hostname follows `auvik-{client}-{site}` format
- [ ] Hostname is all lowercase
- [ ] Hostname is 24 characters or less
- [ ] Client code is registered and unique
- [ ] Site code is unique within client
- [ ] IP address is documented and approved
- [ ] IP address doesn't conflict with existing devices
- [ ] Auvik site name matches hostname
- [ ] Tailscale device name will match hostname
- [ ] Asset label prepared with correct information
- [ ] All fields documented in tracking spreadsheet

## Naming Convention Change Procedure

If you need to change naming conventions mid-deployment:

### Impact Assessment

1. **Existing devices**: Will they be renamed or grandfathered?
2. **Documentation**: What needs updating?
3. **Monitoring**: Do alerts need reconfiguration?
4. **DNS**: Are there DNS entries to update?

### Renaming Existing Device

```bash
# SSH to device
ssh viyuadmin@old-hostname

# Set new hostname
sudo hostnamectl set-hostname new-hostname

# Update /etc/hosts
sudo sed -i 's/old-hostname/new-hostname/' /etc/hosts

# Update Tailscale
sudo tailscale set --hostname new-hostname

# Reboot
sudo reboot
```

After reboot:
- Update Auvik site name in portal
- Update documentation/CMDB
- Update asset label

### Version Control

Document naming convention changes:

```
Naming Convention Changelog
v1.0 (2026-01-01): Initial convention
  - Format: auvik-{client}-{site}

v1.1 (2026-03-15): Added length limit
  - Max 24 characters
  - Reason: Compatibility with older switches

v2.0 (2026-06-01): Changed client code format
  - Old: Client name abbreviation
  - New: Standardized acronyms from registry
  - Reason: Avoid duplicates as client base grew
```

## Best Practices

1. **Define conventions BEFORE first deployment**
   - Changing later is painful and time-consuming

2. **Document conventions in onboarding materials**
   - Every technician should know the format

3. **Validate hostnames during customization**
   - Catch mistakes early, before deployment

4. **Maintain a client code registry**
   - Prevents duplicates and confusion

5. **Use automation to enforce conventions**
   - Scripts catch errors humans miss

6. **Keep conventions simple**
   - Complex rules lead to mistakes

7. **Be consistent across all systems**
   - Same hostname in device, Auvik, Tailscale, documentation

8. **Plan for growth**
   - Will your convention scale to 100+ sites?

9. **Review quarterly**
   - Adjust if patterns no longer fit

10. **Archive old conventions**
    - Keep history for reference when supporting legacy devices

## Examples by Industry

### Retail Chain

```
auvik-retailco-store001    # Store #1
auvik-retailco-store002    # Store #2
...
auvik-retailco-store150    # Store #150
auvik-retailco-dc          # Distribution Center
auvik-retailco-hq          # Corporate HQ
```

### Healthcare Organization

```
auvik-healthsys-main       # Main Hospital
auvik-healthsys-west       # West Campus
auvik-healthsys-clinic1    # Clinic 1
auvik-healthsys-clinic2    # Clinic 2
auvik-healthsys-admin      # Admin Building
```

### Manufacturing Company

```
auvik-mfg-plant1           # Manufacturing Plant 1
auvik-mfg-plant2           # Manufacturing Plant 2
auvik-mfg-warehouse-tx     # Texas Warehouse
auvik-mfg-warehouse-ca     # California Warehouse
auvik-mfg-office           # Corporate Office
```

### Professional Services Firm

```
auvik-lawfirm-nyc          # New York Office
auvik-lawfirm-dc           # Washington DC Office
auvik-lawfirm-boston       # Boston Office
auvik-lawfirm-remote       # Remote Workers VPN Site
```

### Multi-Tenant MSP

```
auvik-client1-hq
auvik-client1-branch
auvik-client2-office
auvik-client3-dc1
auvik-client3-dc2
```

## Quick Reference

### Hostname Format
```
auvik-{clientcode}-{sitecode}
```

### Rules
- All lowercase
- Hyphens only (no underscores/spaces)
- Max 24 characters
- Descriptive, not generic
- Unique across all deployments

### Validation Command
```bash
./validate-hostname.sh <hostname>
```

### Documentation Required
✅ Client name
✅ Site name
✅ Hostname
✅ IP address
✅ Gateway
✅ Deploy date
✅ Asset label

## Next Steps

After establishing naming conventions:
- [Batch Customization](./batch-customization.md) — Apply conventions at scale
- [Fleet Management](./fleet-management.md) — Manage devices with consistent naming

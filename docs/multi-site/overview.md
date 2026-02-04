---
sidebar_position: 1
---

# Multi-Site Deployment Overview

Efficient workflows for deploying Raspberry Pi 5 Auvik collectors across multiple client sites using golden image cloning and standardized customization procedures.

:::info About Multi-Site Deployment
This section covers strategies for scaling deployment operations when installing Auvik collectors at 5+ sites. Use these workflows to reduce deployment time, ensure consistency, and minimize field configuration errors.
:::

## When to Use Multi-Site Deployment

Multi-site deployment is recommended when:

- **Multiple Sites** — Deploying 5 or more collectors within a short timeframe
- **Consistency Required** — Standardized configuration across all installations
- **Efficiency Critical** — Limited technician time or resources
- **Rapid Rollout** — Client requires quick deployment across locations

For 1-4 sites, standard single-site deployment procedures are typically sufficient.

## Key Benefits

| Benefit | Impact |
|---------|--------|
| **Faster Deployment** | Pre-configured images eliminate redundant setup steps |
| **Consistency** | Golden image ensures identical base configuration |
| **Reduced Errors** | Standardized customization script minimizes field mistakes |
| **Quality Control** | Bench testing before shipping catches issues early |
| **Scalability** | Process scales from 5 to 50+ sites efficiently |

## Multi-Site Workflow Overview

The multi-site deployment process consists of four key phases:

### 1. Golden Image Creation

Create a master SD card image with all standard software pre-installed:

- Base OS configuration
- System updates and security hardening
- Tailscale VPN client
- Monitoring and management tools
- Standard user accounts

This image serves as the template for all deployments.

### 2. Bench Configuration

Clone the golden image to SD cards and customize for each site:

- Set unique hostname
- Configure static IP addressing
- Set timezone for site location
- Pre-stage Auvik collector credentials
- Document configuration details

All customization happens in the workshop, not in the field.

### 3. Bench Testing

Verify each collector before shipping:

- Boot test and network connectivity
- Tailscale VPN connection
- Auvik collector readiness
- Hardware functionality check
- Label and document

Catch issues in controlled environment, not at client sites.

### 4. Field Deployment

On-site installation becomes a simple physical procedure:

- Connect to PoE+ network port
- Power on and verify boot
- Confirm Tailscale and Auvik online
- Complete site documentation
- Hand off to client

Most technical configuration is already complete.

## Time Comparison

| Deployment Type | Single Site | Multi-Site (5 sites) | Multi-Site (20 sites) |
|-----------------|-------------|---------------------|----------------------|
| Per-Site Setup Time | 2.5 hours | 1.5 hours | 1.0 hours |
| Field Time | 1.5 hours | 0.75 hours | 0.5 hours |
| **Total Time** | **2.5 hours** | **7.5 hours** | **20 hours** |
| **Time Savings** | Baseline | 5 hours (40%) | 30 hours (60%) |

*Time savings increase with scale as golden image and process overhead amortize.*

## Key Concepts

### Golden Image

A master SD card image containing all standard software and configuration. Cloned for each deployment, then customized per site. The golden image includes everything except site-specific settings.

### Per-Site Customization

The minimal set of settings that must be unique for each site:

- Hostname (identifies the device)
- IP address (network addressing)
- Timezone (local time display)
- Auvik collector token (links to client/site)

All other configuration is inherited from the golden image.

### Bench Testing

Pre-deployment verification performed in a controlled workshop environment. Simulates production network conditions to validate functionality before shipping equipment to remote sites.

### Mass Cloning

The process of duplicating the golden image to multiple SD cards simultaneously. Can be done serially (one at a time) or in parallel (using USB hubs and multi-card writers).

## Quick Links

| Task | Documentation |
|------|---------------|
| Create golden image | [Golden Image Creation](/docs/golden-image/creating-the-image) |
| Clone to multiple cards | [Mass Cloning Procedures](/docs/multi-site/mass-cloning) |
| Customize per site | [Batch Customization](/docs/multi-site/batch-customization) |
| Bench test collectors | [Pre-Deployment Testing](/docs/multi-site/bench-testing) |
| Ship to sites | [Packaging and Shipping](/docs/multi-site/packaging-shipping) |
| Track deployments | [Deployment Tracking](/docs/multi-site/deployment-tracking) |

## Prerequisites

Before starting multi-site deployment:

- [ ] Golden image created and tested
- [ ] Client network documentation for all sites
- [ ] Auvik sites created in portal
- [ ] Hardware procured for all deployments
- [ ] SD cards and labeling materials ready
- [ ] Shipping materials and timeline confirmed

## Process Flow

```
┌─────────────────────┐
│  Golden Image       │  Created once, tested thoroughly
│  (Master SD Card)   │  Contains all standard config
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
    ┌──────────┐      ┌──────────┐
    │  Clone 1 │      │  Clone N │  Clone to all SD cards
    │ Site A   │ ...  │ Site Z   │  (parallel or serial)
    └─────┬────┘      └─────┬────┘
          │                 │
          ▼                 ▼
    ┌──────────┐      ┌──────────┐
    │Customize │      │Customize │  Per-site settings
    │ & Test   │      │ & Test   │  (hostname, IP, etc)
    └─────┬────┘      └─────┬────┘
          │                 │
          ▼                 ▼
    ┌──────────┐      ┌──────────┐
    │  Ship    │      │  Ship    │  Send to field sites
    │ to Site  │      │ to Site  │  with documentation
    └─────┬────┘      └─────┬────┘
          │                 │
          ▼                 ▼
    ┌──────────┐      ┌──────────┐
    │ Install  │      │ Install  │  Simple on-site setup
    │ & Verify │      │ & Verify │  (plug in and verify)
    └──────────┘      └──────────┘
```

## Success Criteria

A successful multi-site deployment achieves:

- **Zero field configuration** — All technical setup completed before shipping
- **100% boot success** — All collectors power on and connect at sites
- **Same-day activation** — Auvik collectors online within deployment day
- **Complete documentation** — All deployments tracked and recorded
- **Client satisfaction** — Minimal disruption, professional execution

## Common Pitfalls

Avoid these common mistakes in multi-site deployments:

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| Skipping golden image testing | Errors replicate to all sites | Thoroughly test master image |
| Inconsistent customization | Sites have mismatched config | Use standardized scripts |
| No bench testing | Ship broken units | Test every collector before shipping |
| Poor documentation | Can't troubleshoot remotely | Complete tracking spreadsheet |
| Wrong timezone | Logs show incorrect times | Verify timezone for each site location |
| DHCP instead of static | IP changes break monitoring | Always use static IPs |

## Next Steps

1. **New to multi-site?** → Start with [Golden Image Creation](/docs/golden-image/creating-the-image)
2. **Ready to clone?** → Follow [Mass Cloning Procedures](/docs/multi-site/mass-cloning)
3. **Need to customize?** → Use [Batch Customization](/docs/multi-site/batch-customization)
4. **Preparing to ship?** → Check [Packaging and Shipping](/docs/multi-site/packaging-shipping)

## Support and Questions

For multi-site deployment assistance:

- Review the [Complete Deployment Checklist](/docs/checklists/complete-deployment)
- Consult [Troubleshooting](/docs/troubleshooting/common-issues) for common problems
- Reference [Golden Image Documentation](/docs/golden-image/overview) for image creation issues

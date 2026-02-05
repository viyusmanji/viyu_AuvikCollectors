---
sidebar_position: 1
---

# External References Strategy Guide

Comprehensive guide for integrating external documentation references (particularly Auvik documentation) into internal documentation with consistency and quality.

## Purpose

This guide provides standards, templates, and best practices for documentation authors to consistently reference external resources while maintaining link quality, user experience, and documentation integrity.

---

## 1. Reference Integration Guidelines

### Decision Framework: When to Link vs. Summarize

Use this framework to determine whether to link externally or summarize content inline:

| Factor | Link Externally | Summarize Inline |
|--------|----------------|------------------|
| **Content Stability** | Official docs that rarely change | Frequently updated content |
| **Update Frequency** | Version-stable references | Rapidly evolving features |
| **Workflow Interruption** | Deep-dive topics, optional reading | Critical path instructions |
| **Content Ownership** | Vendor-maintained specifications | Your own procedures/standards |
| **Content Length** | Long technical references | Short decision points |
| **User Context** | Background/theory | Step-by-step procedures |

#### When to Link Externally

✅ **Link when:**
- Official vendor documentation provides authoritative reference
- Content is version-stable and unlikely to break
- Topic is supplementary/optional reading
- You want users to get latest updates directly from source
- Content is too lengthy to duplicate

**Example:** Link to Auvik's firewall rules documentation rather than duplicating the full port list.

#### When to Summarize Inline

✅ **Summarize when:**
- Information is critical to completing current task
- Content is brief (1-3 key points)
- You need to add context specific to your implementation
- External source might change or become unavailable
- Users shouldn't need to leave the workflow

**Example:** Summarize the key collector system requirements in your deployment checklist rather than linking.

#### Hybrid Approach (Best Practice)

**Best of both worlds:** Provide key information inline AND link to the full resource.

```markdown
The collector requires at least 2GB RAM and 20GB disk space. For complete system requirements, see [Auvik Collector System Requirements](https://support.auvik.com/hc/en-us/articles/200741514).
```

---

## 2. Admonition Formatting Standards

Use consistent admonition styles for different types of external references. These examples use Docusaurus/MkDocs syntax.

### Standard Admonition Types

| Type | Use Case | Color/Icon |
|------|----------|------------|
| `:::info` | Neutral informational references | Blue (ℹ️) |
| `:::tip` | Pro tips and best practices | Green (💡) |
| `:::warning` | Important updates or deprecations | Orange (⚠️) |
| `:::caution` | Breaking changes or critical info | Red (🔥) |
| `:::note` | General notes and asides | Gray (📝) |

### Formatting Guidelines

1. **Keep titles concise** — 2-5 words maximum
2. **Include source type** — "Official Docs", "Third-Party", etc.
3. **Use active voice** — "See the official guide" not "The official guide can be seen"
4. **Link placement** — Put links at the end of the admonition content
5. **Attribution** — Always identify the source (Auvik, vendor, community)

---

## 3. Link Maintenance Procedures

### Link Validation

**Automated Checks:**
- Use link checker tools (e.g., `markdown-link-check`) in CI/CD
- Run monthly link validation reports
- Monitor for 404 errors in analytics

**Manual Reviews:**
- Quarterly review of all external references
- Verify links still point to correct content (not just valid URLs)
- Check for updated/redirected URLs

### Handling Broken Links

When an external link breaks:

1. **Search for new location** — Check if content moved
2. **Use Internet Archive** — Find archived version as temporary fallback
3. **Update or remove** — Fix the link or remove if content is gone
4. **Add fallback content** — If link is critical, summarize key points inline
5. **Document in changelog** — Note what was updated and why

**Template for Broken Link Update:**

```markdown
<!-- UPDATED 2026-02-03: Original link deprecated, replaced with new URL -->
For firewall configuration, see [Auvik Firewall Rules](https://support.auvik.com/hc/en-us/articles/NEW-ARTICLE-ID).
```

### Version Tracking

For version-specific references:

```markdown
:::note Version-Specific
This guide references Auvik Collector v2.42.0 (February 2026). For the latest version, see [Auvik Release Notes](https://support.auvik.com/hc/en-us/sections/360007963074).
:::
```

---

## 4. Citation Format Standards

### Standard Citation Format

**Inline References:**

```markdown
According to the [Auvik ARM64 FAQ](https://support.auvik.com/hc/en-us/articles/28775790530964), the collector supports native installation on Raspberry Pi 4 and 5.
```

**Reference Tables:**

```markdown
| Resource | Description |
|----------|-------------|
| [ARM64 Collector FAQ](https://support.auvik.com/hc/en-us/articles/28775790530964) | Deployment options, supported devices |
```

### Metadata Requirements

For significant external references, include:

- **Source name** — "Auvik Support", "Raspberry Pi Foundation", etc.
- **Document title** — Use exact title from source
- **URL** — Full URL (not shortened links)
- **Last verified date** — When you last checked the link (optional but recommended)
- **Version reference** — If content is version-specific

**Example with Full Metadata:**

```markdown
:::info Official Documentation
**Source:** Auvik Support
**Title:** ARM64 (Raspberry Pi) Collector FAQ
**URL:** https://support.auvik.com/hc/en-us/articles/28775790530964
**Last Verified:** February 2026

Covers deployment options, supported ARM64 devices, and Docker vs. native installation.
:::
```

---

## 5. Reference Type Templates

### Template 1: Official Auvik Documentation

Use this template when referencing official Auvik support documentation.

#### Standard Reference Block

```markdown
:::info Official Auvik Documentation
For detailed information on ARM64 collector deployment, see the official [ARM64 (Raspberry Pi) Collector FAQ](https://support.auvik.com/hc/en-us/articles/28775790530964).

Key topics covered:
- Supported ARM64 devices (Pi 4, Pi 5, etc.)
- Docker vs. native installation
- System requirements and limitations
:::
```

#### Inline Reference

```markdown
The Auvik collector requires specific firewall rules. See the official [Firewall Rules for Auvik](https://support.auvik.com/hc/en-us/articles/204310536) for the complete port list.
```

#### Reference Table Format

```markdown
## Auvik Collector Resources

| Resource | Description |
|----------|-------------|
| [Bash Script Installation Guide](https://support.auvik.com/hc/en-us/articles/204822246) | Step-by-step native install |
| [Collector System Requirements](https://support.auvik.com/hc/en-us/articles/200741514) | CPU, RAM, storage minimums |
| [Firewall Rules](https://support.auvik.com/hc/en-us/articles/204310536) | Required ports and destinations |
```

#### When to Use

- ✅ Linking to Auvik knowledge base articles
- ✅ Referencing official API documentation
- ✅ Pointing to Auvik training resources
- ✅ Citing Auvik release notes or changelogs

---

### Template 2: Third-Party Resources

Use this template when referencing non-Auvik external resources (Raspberry Pi, Tailscale, networking standards, etc.).

#### Standard Reference Block

```markdown
:::note Third-Party Resource
**Source:** Raspberry Pi Foundation
**Title:** Raspberry Pi Documentation
**URL:** https://www.raspberrypi.com/documentation/

Official documentation for Raspberry Pi hardware, operating systems, and configuration. Particularly useful for troubleshooting hardware issues and understanding GPIO pinouts.
:::
```

#### Inline Reference

```markdown
For PoE HAT installation instructions, refer to the [Raspberry Pi PoE HAT Documentation](https://www.raspberrypi.com/documentation/accessories/poe-hat.html).
```

#### Comparison Table

```markdown
## Third-Party Tools Comparison

| Tool | Documentation | Use Case |
|------|---------------|----------|
| [Tailscale](https://tailscale.com/kb/) | Mesh VPN setup | Remote collector access |
| [Raspberry Pi Imager](https://www.raspberrypi.com/software/) | OS installation | Creating golden image |
| [Docker](https://docs.docker.com/) | Container deployment | Alternative to native install |
```

#### When to Use

- ✅ Referencing vendor documentation (Raspberry Pi, Tailscale, etc.)
- ✅ Linking to industry standards (IEEE, RFC, etc.)
- ✅ Citing community resources (forums, tutorials)
- ✅ Pointing to third-party tools and utilities

---

### Template 3: Important Updates

Use this template for critical updates, deprecations, or breaking changes related to external resources.

#### Breaking Change Alert

```markdown
:::warning Important Update
**Effective Date:** February 2026
**Impact:** All ARM64 collectors

Auvik has deprecated the legacy installer script. All new deployments must use the updated bash script installer.

- ❌ **Old (Deprecated):** `install-collector-legacy.sh`
- ✅ **New (Required):** `install-collector.sh`

See [Bash Script Installation Guide](https://support.auvik.com/hc/en-us/articles/204822246) for updated instructions.
:::
```

#### Deprecation Notice

```markdown
:::caution Deprecated Feature
The Docker image for ARM32 devices is no longer maintained as of January 2026. ARM32 users should migrate to ARM64 devices (Raspberry Pi 4/5) or use x86 collectors.

**Migration Guide:** [ARM64 Migration FAQ](https://support.auvik.com/hc/en-us/articles/EXAMPLE)
:::
```

#### Version-Specific Warning

```markdown
:::warning Version Compatibility
This guide assumes Raspberry Pi OS Bookworm (Debian 12). If you're running Bullseye (Debian 11), some commands may differ.

Check your OS version:
```bash
cat /etc/os-release
```

For Bullseye-specific instructions, see the [Pi OS Version Compatibility Guide](https://example.com/link).
:::
```

#### When to Use

- ✅ Announcing deprecated features or APIs
- ✅ Highlighting breaking changes in external dependencies
- ✅ Warning about version-specific incompatibilities
- ✅ Alerting users to security updates or patches

---

### Template 4: Pro Tips

Use this template for best practices, recommendations, and helpful shortcuts related to external resources.

#### Best Practice Tip

```markdown
:::tip Pro Tip
**Bookmark the Auvik Status Page**

Before troubleshooting a collector offline issue, always check [status.auvik.com](https://status.auvik.com) to rule out a service-wide outage. This can save 15+ minutes of unnecessary diagnostics.
:::
```

#### Performance Optimization

```markdown
:::tip Performance Optimization
For large networks (100+ devices), consider enabling SNMP bulk requests in Auvik settings. This can reduce discovery time by 30-40%.

See the [SNMP Configuration Guide](https://support.auvik.com/hc/en-us/articles/204821786) for bulk request settings.
:::
```

#### Workflow Shortcut

```markdown
:::tip Quick Reference
**Need to quickly reference firewall rules in the field?**

Print the [Firewall Rules PDF](https://support.auvik.com/hc/en-us/articles/204310536) or save it to your phone. Most client firewalls are already configured correctly, but having the reference speeds up validation.
:::
```

#### Learning Resource

```markdown
:::tip Learning Path
**New to Auvik?**

Complete the free [Auvik Academy Fundamentals Course](https://academy.auvik.com/) (2 hours) before your first deployment. It covers network discovery, alerting, and the dashboard—essential knowledge for troubleshooting.
:::
```

#### When to Use

- ✅ Sharing time-saving shortcuts or bookmarks
- ✅ Recommending training resources or learning paths
- ✅ Highlighting non-obvious but useful features
- ✅ Suggesting performance optimizations
- ✅ Providing field-tested best practices

---

## Quick Reference: Template Selection

Use this decision tree to pick the right template:

```
Is it Auvik documentation?
├─ Yes → Use Template 1 (Official Auvik Documentation)
└─ No → Is it about a breaking change or deprecation?
    ├─ Yes → Use Template 3 (Important Updates)
    └─ No → Is it a pro tip or best practice?
        ├─ Yes → Use Template 4 (Pro Tips)
        └─ No → Use Template 2 (Third-Party Resources)
```

---

## Tool Compatibility

These templates are compatible with:

- ✅ **Docusaurus** — Native admonition syntax (`:::type`)
- ✅ **MkDocs Material** — Use `!!!` instead of `:::` for admonitions
- ✅ **GitHub Markdown** — Renders as blockquotes (no color, but readable)
- ✅ **GitBook** — Native hint syntax (similar to admonitions)

### MkDocs Material Conversion

To convert for MkDocs Material, replace `:::` with `!!!`:

```markdown
!!! info "Official Auvik Documentation"
    Content here...
```

---

## Examples in Practice

### Example 1: Deployment Guide with Mixed References

```markdown
# Auvik Collector Installation

The Auvik collector can be installed via bash script (recommended) or Docker.

:::info Official Installation Guide
Follow the official [Bash Script Installation Guide](https://support.auvik.com/hc/en-us/articles/204822246) for step-by-step instructions.

This guide covers:
- Prerequisites and system requirements
- Collector registration and authentication
- Post-installation verification
:::

:::tip Pro Tip
Run the installer with `bash -x install-collector.sh` to see detailed output if you encounter errors. This verbose mode is invaluable for troubleshooting installation issues.
:::

## System Requirements

The collector requires:
- **CPU:** 2+ cores (ARM64 or x86_64)
- **RAM:** 2GB minimum, 4GB recommended
- **Disk:** 20GB free space
- **OS:** Debian/Ubuntu, RHEL/CentOS, or Raspberry Pi OS

For complete requirements, see [Auvik Collector System Requirements](https://support.auvik.com/hc/en-us/articles/200741514).
```

### Example 2: Troubleshooting Page with External References

```markdown
# Troubleshooting Collector Offline

:::warning Check Service Status First
Before troubleshooting, verify the Auvik service is operational at [status.auvik.com](https://status.auvik.com). Regional outages can cause collectors to appear offline.
:::

## Common Causes

1. **Network connectivity** — Verify firewall rules allow HTTPS (443) to Auvik servers
2. **Service stopped** — Check if `auvik-collector` service is running
3. **Authentication expired** — Re-register the collector

For detailed troubleshooting steps, see the official [Collector Offline Troubleshooting Guide](https://support.auvik.com/hc/en-us/articles/204310396).

:::tip Field-Tested Solution
In 80% of offline cases, the issue is firewall rules. Use `curl https://api.auvik.com` to quickly test connectivity before diving into logs.
:::
```

---

## Maintenance Checklist

Use this checklist quarterly to maintain external reference quality:

- [ ] **Run link checker** — Validate all external URLs
- [ ] **Review Auvik release notes** — Check for deprecated features
- [ ] **Update version references** — Ensure OS/software versions are current
- [ ] **Test critical links manually** — Verify content hasn't changed significantly
- [ ] **Check for new official docs** — Add newly published Auvik guides
- [ ] **Archive outdated warnings** — Remove obsolete deprecation notices
- [ ] **Update "Last Verified" dates** — For metadata-heavy references

---

## Conclusion

Consistent external reference management improves documentation quality, reduces maintenance burden, and creates a better user experience. Use these templates as starting points and adapt them to fit your documentation's voice and tooling.

**Questions or suggestions?** Submit improvements via pull request or open an issue.

---

**Document Version:** 1.0
**Last Updated:** February 2026
**Maintained By:** Documentation Team

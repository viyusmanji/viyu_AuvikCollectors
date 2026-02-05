---
sidebar_position: 3
---

# Admonition Style Guide

Comprehensive reference for using custom admonitions in the Auvik Collector documentation. This guide covers the 6 specialized admonition types designed for external references, notifications, and callouts.

## Overview

Admonitions (also called "callouts" or "alerts") are visual boxes used to highlight important information in documentation. This site extends Docusaurus's built-in admonition system with 6 custom types, each designed for specific use cases in Auvik deployment documentation.

### When to Use Admonitions

| Situation | Recommended Type |
|-----------|-----------------|
| Linking to official Auvik resources | [Official Auvik Documentation](#official-auvik-documentation) |
| Referencing external vendor docs | [Third-Party Resources](#third-party-resources) |
| Announcing product changes | [Important Auvik Updates](#important-auvik-updates) |
| Sharing best practices | [Pro Tips from Auvik](#pro-tips-from-auvik) |
| Security-related warnings | [Security Warnings](#security-warnings) |
| Version-specific information | [Version-Specific Notes](#version-specific-notes) |

## Quick Reference

| Admonition Type | Syntax | Color | Use Case |
|----------------|--------|-------|----------|
| Official Auvik Docs | `:::admonition-auvik-docs` | Blue | Auvik Knowledge Base links |
| Third-Party Resources | `:::admonition-third-party` | Purple | External vendor documentation |
| Important Updates | `:::admonition-auvik-update` | Orange | Product announcements |
| Pro Tips | `:::admonition-pro-tip` | Green | Best practices |
| Security Warnings | `:::admonition-security` | Red | Security alerts |
| Version-Specific | `:::admonition-version` | Gray | Version requirements |

## Admonition Types

### Official Auvik Documentation

**Purpose**: Link to official Auvik support resources, Knowledge Base articles, API documentation, and training materials.

**When to Use**:
- Referencing Auvik support articles
- Linking to Auvik API documentation
- Pointing to Auvik Academy training
- Citing official Auvik webinars or release notes

**Syntax**:
```markdown
:::admonition-auvik-docs 📘 Official Documentation
See the [Auvik Knowledge Base](https://support.auvik.com) for detailed installation steps.
:::
```

**Example**:

:::admonition-auvik-docs 📘 Official Documentation
See the [ARM64 (Raspberry Pi) FAQ](https://support.auvik.com/hc/en-us/articles/28775790530964) for official deployment options and supported devices. The Auvik team maintains this resource with the latest ARM64 collector information.
:::

**Do's and Don'ts**:

✅ **DO**:
- Use for official Auvik URLs (support.auvik.com, auvikapi.us1.my.auvik.com, academy.auvik.com)
- Include specific article titles and direct links
- Update links if Auvik documentation changes

❌ **DON'T**:
- Use for third-party resources (use `admonition-third-party` instead)
- Use for general information without external links
- Link to outdated or deprecated Auvik pages

---

### Third-Party Resources

**Purpose**: Reference external documentation and resources outside the Auvik ecosystem, such as vendor docs, community forums, and technical standards.

**When to Use**:
- Linking to Raspberry Pi Foundation documentation
- Referencing Tailscale or networking vendor docs
- Citing SNMP standards or technical specifications
- Pointing to community forums or third-party guides

**Syntax**:
```markdown
:::admonition-third-party 🌐 External Resource
The [Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/) provides comprehensive hardware and OS reference.
:::
```

**Example**:

:::admonition-third-party 🌐 External Resource
For PoE HAT installation and pinout diagrams, see the [Raspberry Pi PoE HAT documentation](https://www.raspberrypi.com/documentation/accessories/poe-hat.html). Note that official Pi PoE+ HATs are limited to 5A per device.
:::

**Do's and Don'ts**:

✅ **DO**:
- Clearly identify the external source
- Verify links are stable and authoritative
- Use for vendor-specific documentation (Pi, Tailscale, etc.)

❌ **DON'T**:
- Link to random blog posts or unverified sources
- Use for Auvik resources (use `admonition-auvik-docs` instead)
- Assume external links will remain stable indefinitely

---

### Important Auvik Updates

**Purpose**: Announce critical product updates, breaking changes, feature deprecations, or important product news that affects deployment workflows.

**When to Use**:
- API changes or deprecations
- Breaking changes in collector versions
- Feature announcements affecting deployment
- Critical product updates requiring action

**Syntax**:
```markdown
:::admonition-auvik-update 📢 Important Update
As of collector version 2024.10, the legacy SNMP v1 discovery method is deprecated. Migrate to SNMP v2c or v3.
:::
```

**Example**:

:::admonition-auvik-update 📢 Important Update
**ARM64 Collector Now Generally Available** — As of January 2024, the ARM64 collector has moved from beta to general availability. All new Pi deployments should use the officially supported bash script installation method.
:::

**Do's and Don'ts**:

✅ **DO**:
- Include effective dates for changes
- Specify required actions if applicable
- Link to release notes or announcements
- Keep content actionable and clear

❌ **DON'T**:
- Use for general tips (use `admonition-pro-tip` instead)
- Create alarm without providing context
- Leave outdated announcements in documentation

---

### Pro Tips from Auvik

**Purpose**: Share best practices, optimization suggestions, MSP recommendations, and helpful tips that improve deployment outcomes.

**When to Use**:
- Best practice recommendations
- Performance optimization tips
- MSP deployment strategies
- Configuration recommendations

**Syntax**:
```markdown
:::admonition-pro-tip 💡 Pro Tip
Label your collectors with the site name in Auvik using the `--name` flag during installation for easier multi-site management.
:::
```

**Example**:

:::admonition-pro-tip 💡 Pro Tip
**Multi-Site Naming Convention** — Use a consistent hostname pattern like `{client-code}-auvik-pi-{location}` (e.g., `acme-auvik-pi-hq`, `acme-auvik-pi-branch1`) to instantly identify sites in Tailscale and Auvik dashboards.
:::

**Do's and Don'ts**:

✅ **DO**:
- Share practical, actionable advice
- Include specific configuration examples
- Explain why the tip improves outcomes
- Keep content positive and helpful

❌ **DON'T**:
- Use for critical warnings (use `admonition-security` instead)
- State opinions without rationale
- Recommend undocumented workarounds

---

### Security Warnings

**Purpose**: Alert readers to security-related concerns, vulnerability notices, credential handling requirements, and security best practices.

**When to Use**:
- Security vulnerabilities or CVEs
- Credential handling warnings
- Firewall requirement alerts
- Authentication security notices
- SSH key management advisories

**Syntax**:
```markdown
:::admonition-security 🔒 Security Warning
Never commit API tokens or collector installation tokens to version control. Use environment variables or secret management tools.
:::
```

**Example**:

:::admonition-security 🔒 Security Warning
**Tailscale Key Exposure** — The Tailscale auth key generated during setup is a **one-time use secret**. If accidentally exposed, generate a new key immediately and revoke the compromised one in the Tailscale admin console.
:::

**Do's and Don'ts**:

✅ **DO**:
- Clearly state the security risk
- Provide specific mitigation steps
- Reference CVE numbers when applicable
- Include links to security advisories

❌ **DON'T**:
- Use for general warnings (use `:::warning` instead)
- Create panic without providing solutions
- Downplay legitimate security concerns

---

### Version-Specific Notes

**Purpose**: Document version-dependent information, compatibility requirements, version constraints, and deprecation schedules.

**When to Use**:
- Software version requirements
- Compatibility matrices
- Feature availability by version
- Deprecation schedules
- OS version constraints

**Syntax**:
```markdown
:::admonition-version 🏷️ Version Note
ARM64 collector support requires Auvik collector version 2023.8 or later. Earlier versions do not support ARM architecture.
:::
```

**Example**:

:::admonition-version 🏷️ Version Compatibility
**Raspberry Pi OS Bookworm Required** — The official Auvik bash script installer requires Raspberry Pi OS Bookworm (Debian 12) or Ubuntu 22.04/24.04. Earlier OS versions (Bullseye, Buster) are not supported for ARM64 collectors.
:::

**Do's and Don'ts**:

✅ **DO**:
- Specify exact version numbers
- Include minimum and maximum version bounds
- Update when version requirements change
- Link to release notes or changelogs

❌ **DON'T**:
- Use vague version references ("recent versions")
- Assume version numbers without verification
- Leave outdated version warnings in docs

---

## Syntax and Formatting

### Basic Syntax

All custom admonitions follow standard Docusaurus syntax:

```markdown
:::admonition-type Optional Title
Content goes here. Supports **markdown**, [links](url), and `code`.
:::
```

### Title Guidelines

| Guideline | Example |
|-----------|---------|
| Use emoji icons for visual scanning | `📘 Official Documentation` |
| Keep titles short (2-5 words) | `🔒 Security Warning` |
| Capitalize title-case style | `💡 Pro Tip` |
| Make titles descriptive | `🏷️ Version Compatibility` |

### Content Guidelines

- **Keep it concise** — Admonitions should highlight key information, not replace sections
- **Use markdown** — Format with bold, links, lists, and code blocks as needed
- **Be specific** — Include version numbers, dates, and direct links
- **Make it scannable** — Use short paragraphs and bullet points

## Advanced Usage

### Multiple Paragraphs

Admonitions can contain multiple paragraphs, lists, and code blocks:

:::admonition-pro-tip 💡 Multi-Paragraph Example
**First paragraph** introduces the tip.

Second paragraph provides additional context:
- Bullet point 1
- Bullet point 2

```bash
# Example command
echo "Code blocks work too"
```
:::

### Nested Lists

Lists work naturally inside admonitions:

:::admonition-security 🔒 Security Checklist
Before deploying to production, verify:

1. SSH key authentication is configured (no password auth)
2. Firewall rules limit access to management ports
3. Tailscale ACLs restrict device access
4. Collector token is not committed to Git
:::

### Code Blocks

Code examples render correctly inside admonitions:

:::admonition-auvik-docs 📘 Installation Command
Run the Auvik installer with your site-specific token:

```bash
curl -sSL https://install.auvik.com | sudo bash -s -- --token YOUR_SITE_TOKEN
```

Replace `YOUR_SITE_TOKEN` with the token from your Auvik portal.
:::

## Standard Docusaurus Admonitions

In addition to the 6 custom types above, Docusaurus provides 5 standard admonition types for general use:

| Type | Syntax | Use Case |
|------|--------|----------|
| Note | `:::note` | General notes and additional context |
| Tip | `:::tip` | Helpful suggestions (use `:::admonition-pro-tip` for Auvik-specific tips) |
| Info | `:::info` | Informational content (use `:::admonition-auvik-docs` for external links) |
| Warning | `:::warning` | General warnings (use `:::admonition-security` for security-specific) |
| Danger | `:::danger` | Critical warnings requiring immediate attention |

**When to Use Standard vs. Custom**:
- Use **standard admonitions** for general documentation needs
- Use **custom admonitions** when the content specifically relates to external resources, security, or version constraints

---

## Accessibility and Theming

All custom admonitions are designed to:
- ✅ Work in both light and dark themes
- ✅ Meet WCAG AA contrast requirements
- ✅ Render correctly on mobile devices
- ✅ Print legibly for offline reference
- ✅ Use distinct colors for instant recognition

---

## Best Practices

### Content Organization

1. **Placement** — Insert admonitions near related content, not at document start/end
2. **Density** — Avoid multiple admonitions in a row (separate with normal text)
3. **Priority** — Use security warnings sparingly to maintain their impact
4. **Brevity** — Keep admonition content to 3-5 sentences maximum

### Writing Style

1. **Active Voice** — "Use the bash script method" not "The bash script method should be used"
2. **Specific** — Include version numbers, dates, and precise details
3. **Actionable** — Tell readers what to do, not just what to know
4. **Scannable** — Use bold, lists, and short paragraphs

### Maintenance

1. **Link Checking** — Verify external links regularly
2. **Version Updates** — Update version-specific admonitions when releases occur
3. **Deprecation** — Remove outdated announcements and warnings
4. **Consistency** — Follow this guide's patterns across all documentation

---

## Examples from Documentation

### Good Example: Security Warning with Context

:::admonition-security 🔒 Firewall Requirements
**Outbound HTTPS (443) required** — The Auvik collector must reach `*.auvik.com` on TCP port 443 for cloud communication. Configure firewall rules to allow this traffic, or the collector will appear offline. See the [Firewall Rules Guide](https://support.auvik.com/hc/en-us/articles/204310536) for specific destinations.
:::

### Good Example: Version Note with Specifics

:::admonition-version 🏷️ Hardware Compatibility
The Waveshare PoE HAT (C) requires **Raspberry Pi 5 specifically** — it is not compatible with Pi 4 or earlier models due to GPIO pinout differences. For Pi 4, use the official Raspberry Pi PoE+ HAT instead.
:::

### Good Example: Pro Tip with Rationale

:::admonition-pro-tip 💡 Collector Placement Strategy
**Deploy collectors at Layer 2 network boundaries** — Place Pi collectors on the same VLAN segment as devices you want to discover. SNMP discovery does not cross Layer 3 boundaries without routing configuration, so strategic placement maximizes device visibility.
:::

---

## Migration from Standard Admonitions

If you have existing documentation using standard admonitions that would benefit from custom types:

| Current | Migrate To | When |
|---------|------------|------|
| `:::info` with Auvik links | `:::admonition-auvik-docs` | Content links to Auvik resources |
| `:::info` with external links | `:::admonition-third-party` | Content links to external vendors |
| `:::warning` about security | `:::admonition-security` | Content relates to security |
| `:::tip` about Auvik | `:::admonition-pro-tip` | Content shares Auvik best practices |
| `:::note` about versions | `:::admonition-version` | Content is version-specific |

---

## Troubleshooting

### Admonition not rendering

**Symptom**: Admonition appears as plain text with `:::` visible

**Solution**: Ensure proper syntax:
- Opening `:::admonition-type` on its own line
- Content on following lines
- Closing `:::` on its own line
- No extra spaces or tabs

### Wrong color/style

**Symptom**: Admonition renders but with wrong color

**Solution**: Verify the admonition type name:
- `:::admonition-auvik-docs` (not `auvik-doc` or `auvik-docs`)
- `:::admonition-third-party` (not `third-party` without prefix)
- `:::admonition-auvik-update` (not `auvik-updates`)
- `:::admonition-pro-tip` (not `tip` or `protip`)
- `:::admonition-security` (not `security-warning`)
- `:::admonition-version` (not `version-note`)

### Dark mode contrast issues

**Symptom**: Admonition is hard to read in dark theme

**Solution**: This should not occur — all custom admonitions are designed for both themes. If it does, report as a styling bug. The CSS uses theme-aware color variables.

---

## External References

- [Docusaurus Admonitions Documentation](https://docusaurus.io/docs/markdown-features/admonitions)
- [Markdown Syntax Guide](https://www.markdownguide.org/basic-syntax/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

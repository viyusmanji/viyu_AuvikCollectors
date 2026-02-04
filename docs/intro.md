---
sidebar_position: 1
slug: /
---

# Raspberry Pi 5 + Auvik Collector Deployment Guide

Standard operating procedure for deploying Raspberry Pi 5 devices with PoE+ HATs as dedicated Auvik network monitoring collectors at client sites.

:::info About This Guide
This is a public technician reference document. It covers hardware selection, OS configuration, Auvik collector installation, networking requirements, and field deployment procedures for the Pi 5 + PoE + Auvik stack.
:::

## Key Benefits

- **Single Cable Deployment** — PoE+ delivers power and data over one Ethernet connection
- **Low Power** — 5-12W draw vs 15-40W for mini PCs
- **Compact Form Factor** — Credit card sized, fits anywhere
- **Cost Effective** — $175-210 per site vs $300-500 for alternatives
- **Remote Management** — Tailscale mesh VPN for secure access

## Quick Links

| Need | Go To |
|------|-------|
| Parts list and costs | [Hardware BOM](/docs/hardware/bill-of-materials) |
| Install Auvik on Pi | [Auvik Installation](/docs/software/auvik-installation) |
| Field deployment | [On-Site Checklist](/docs/deployment/on-site) |
| MSP/multi-site deployment | [Multi-Site Overview](/docs/multi-site/overview) |
| Something not working | [Troubleshooting](/docs/troubleshooting/common-issues) |
| Print checklists | [Complete Deployment Checklist](/docs/checklists/complete-deployment) |

## Platform Specifications

| Specification | Value |
|--------------|-------|
| Platform | Raspberry Pi 5 (8GB recommended) |
| OS | Raspberry Pi OS Lite (64-bit) — Bookworm |
| Power | 802.3at PoE+ via third-party HAT |
| Remote Access | Tailscale mesh VPN |
| Monitoring | Auvik Network Management |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | February 2026 | Initial release |

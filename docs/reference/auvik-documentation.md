---
sidebar_position: 2
---

# Auvik Documentation

Links to official Auvik support documentation and resources.

## ARM64 / Raspberry Pi

| Resource | Description |
|----------|-------------|
| [ARM64 (Raspberry Pi) FAQ](https://support.auvik.com/hc/en-us/articles/28775790530964) | Deployment options, supported devices, Docker vs. native |
| [Step 7: Deploy ARM64 Collector on Raspberry Pi](https://support.auvik.com/hc/en-us/articles/28775088355348) | Official Pi deployment overview |
| [ARM64 Collector Demo (On-Demand)](https://www.auvik.com/franklyit/webinars/demo-on-demand-arm64-collector/) | Video walkthrough |

## Collector Installation

| Resource | Description |
|----------|-------------|
| [Bash Script Installation Guide](https://support.auvik.com/hc/en-us/articles/204822246) | Step-by-step native install |
| [Docker FAQ](https://support.auvik.com/hc/en-us/articles/18616185672852) | Docker image details, ARM64 support |
| [Collector System Requirements](https://support.auvik.com/hc/en-us/articles/200741514) | CPU, RAM, storage minimums |

## Network Configuration

| Resource | Description |
|----------|-------------|
| [Firewall Rules for Auvik](https://support.auvik.com/hc/en-us/articles/204310536) | Required ports and destinations |
| [Proxy Configuration](https://support.auvik.com/hc/en-us/articles/209118046) | Configuring collector behind proxy |
| [SNMP Configuration Guide](https://support.auvik.com/hc/en-us/articles/204821786) | Setting up SNMP for discovery |

## SSH/Remote Access

| Resource | Description |
|----------|-------------|
| [Raspberry Pi SSH Setup](https://www.raspberrypi.com/documentation/computers/remote-access.html#ssh) | Enable and configure SSH for remote Pi 5 Collector management |
| [Tailscale for Raspberry Pi](https://tailscale.com/kb/1142/raspberry-pi) | Secure remote access to Pi 5 Collectors across networks |
| [SSH Key Authentication](https://www.raspberrypi.com/documentation/computers/remote-access.html#passwordless-ssh-access) | Passwordless SSH setup for Pi 5 Collector security |
| [VNC for Raspberry Pi](https://www.raspberrypi.com/documentation/computers/remote-access.html#vnc) | GUI remote access for Pi 5 Collector troubleshooting |

## Security Best Practices

| Resource | Description |
|----------|-------------|
| [Raspberry Pi Security Guide](https://www.raspberrypi.com/documentation/computers/configuration.html#security) | Official security hardening for Pi 5 Collectors |
| [Fail2ban Setup](https://pimylifeup.com/raspberry-pi-fail2ban/) | Protect Pi 5 Collector SSH from brute force attacks |
| [UFW Firewall Configuration](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu) | Configure local firewall on Pi 5 Collectors |
| [Unattended Upgrades](https://wiki.debian.org/UnattendedUpgrades) | Automatic security updates for Pi 5 Collector OS |
| [Docker Security Best Practices](https://docs.docker.com/engine/security/) | Secure Docker deployments on Pi 5 Collectors |

## Monitoring & Alerting

| Resource | Description |
|----------|-------------|
| [Collector Health Monitoring](https://support.auvik.com/hc/en-us/articles/204310386) | Built-in Auvik collector health checks for Pi 5 deployments |
| [Raspberry Pi Monitoring with Prometheus](https://pimylifeup.com/raspberry-pi-prometheus/) | Monitor Pi 5 Collector system metrics (CPU, memory, temperature) |
| [Pi-hole Temperature Monitoring](https://www.raspberrypi.com/documentation/computers/os.html#measure_temp) | Track Pi 5 thermal performance under collector load |
| [Uptime Kuma](https://github.com/louislam/uptime-kuma) | Self-hosted monitoring for Pi 5 Collector availability |
| [Auvik Collector Alerts](https://support.auvik.com/hc/en-us/articles/204310396) | Configure alerts for Pi 5 Collector offline events |

## Multi-Site Deployment

| Resource | Description |
|----------|-------------|
| [Multi-Collector Architecture](https://support.auvik.com/hc/en-us/articles/204821976) | Best practices for distributed Pi 5 Collector deployments |
| [Collector Placement Guidelines](https://support.auvik.com/hc/en-us/articles/360018826494) | Optimal Pi 5 Collector positioning for multi-site networks |
| [Tailscale Subnet Routing](https://tailscale.com/kb/1019/subnets) | Connect Pi 5 Collectors across remote sites securely |
| [Site-to-Site VPN Planning](https://support.auvik.com/hc/en-us/articles/204310536) | Network connectivity planning for multi-site Pi 5 deployments |
| [Collector Naming Conventions](https://support.auvik.com/hc/en-us/articles/204822246) | Organize and identify Pi 5 Collectors across multiple locations |

## API Documentation

| Resource | Description |
|----------|-------------|
| [Auvik API Portal](https://auvikapi.us1.my.auvik.com/docs) | REST API reference |
| [API Integration Guide](https://support.auvik.com/hc/en-us/sections/360007963114) | API authentication and usage |
| [API Rate Limits](https://support.auvik.com/hc/en-us/articles/360018826374) | 2500 requests per 5 minutes |
| [Collector API Endpoints](https://auvikapi.us1.my.auvik.com/docs#tag/Collectors) | Query Pi 5 Collector status and configuration via API |
| [Python API Examples](https://github.com/auvik/api-examples) | Sample scripts for automating Pi 5 Collector management |
| [API Authentication with Python](https://support.auvik.com/hc/en-us/articles/360007963114) | Secure API access from Pi 5 Collector scripts |

## Troubleshooting

| Resource | Description |
|----------|-------------|
| [Collector Offline Troubleshooting](https://support.auvik.com/hc/en-us/articles/204310396) | Connectivity issues |
| [Device Discovery Issues](https://support.auvik.com/hc/en-us/articles/204310446) | SNMP and discovery problems |
| [Known Issues](https://support.auvik.com/hc/en-us/sections/360007963094) | Current known issues list |
| [Raspberry Pi Diagnostics](https://www.raspberrypi.com/documentation/computers/os.html#diagnostics) | System-level diagnostics for Pi 5 Collector hardware issues |
| [Docker Logs Troubleshooting](https://docs.docker.com/config/containers/logging/) | Debug Pi 5 Collector container issues with Docker logs |
| [ARM64 Collector Logs](https://support.auvik.com/hc/en-us/articles/204822246) | Access and analyze Pi 5 Collector application logs |
| [Network Connectivity Testing](https://support.auvik.com/hc/en-us/articles/204310536) | Verify Pi 5 Collector network access and firewall rules |

## Release Notes

| Resource | Description |
|----------|-------------|
| [Auvik Release Notes](https://support.auvik.com/hc/en-us/sections/360007963074) | Weekly release updates |
| [Collector Release Notes](https://support.auvik.com/hc/en-us/articles/360018826234) | Collector-specific changes |

## Training Resources

| Resource | Description |
|----------|-------------|
| [Auvik Academy](https://academy.auvik.com/) | Free training courses |
| [Webinars (On-Demand)](https://www.auvik.com/franklyit/webinars/) | Recorded webinars |
| [Auvik Blog](https://www.auvik.com/franklyit/blog/) | Tips and best practices |

## Support Channels

| Channel | Use Case |
|---------|----------|
| [Support Portal](https://support.auvik.com) | Knowledge base, ticket submission |
| [Community Forum](https://community.auvik.com) | Peer discussions |
| [Status Page](https://status.auvik.com) | Service status and incidents |

## Third-Party Resources

### Raspberry Pi

| Resource | Description |
|----------|-------------|
| [Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/) | Official Pi docs |
| [Raspberry Pi OS Downloads](https://www.raspberrypi.com/software/operating-systems/) | OS images |
| [Raspberry Pi Forums](https://forums.raspberrypi.com/) | Community support |

### Tailscale

| Resource | Description |
|----------|-------------|
| [Tailscale Documentation](https://tailscale.com/kb/) | Official docs |
| [Tailscale Status](https://status.tailscale.com/) | Service status |
| [Tailscale CLI Reference](https://tailscale.com/kb/1080/cli) | Command reference |

### Networking

| Resource | Description |
|----------|-------------|
| [SNMP Tutorial](https://www.comparitech.com/net-admin/snmp-mibs-oids-explained/) | SNMP fundamentals |
| [PoE Standards Explained](https://www.cisco.com/c/en/us/products/switches/power-over-ethernet-poe.html) | Cisco PoE reference |

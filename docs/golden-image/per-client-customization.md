---
sidebar_position: 2
---

# Per-Client Customization

After cloning the golden image, customize these settings for each client deployment.

## Required Customizations

| Setting | Source | Action |
|---------|--------|--------|
| Hostname | Client naming convention | Change from `auvik-TEMPLATE` |
| Static IP | Client network documentation | Configure via nmcli |
| Timezone | Client location | Set via timedatectl |
| Auvik Collector | Auvik portal | Run site-specific install script |
| Documentation | Documentation platform | Record deployment details |
| Asset Label | Label printer | Print and apply |

## Step-by-Step Customization

### 0. Verify Golden Image Version

Before customizing, verify you're starting with the correct golden image version:

```bash
# Run version check script
~/version-check.sh
```

This displays:
- Current golden image version
- Last update date
- Installed components and versions
- System information

**Important:** Record the golden image version in your deployment documentation. This helps troubleshoot issues and ensures consistency across deployments.

Example output:
```
Golden Image Version Check
==========================
Golden Image: v2024-01-15
Last Updated: 2024-01-15
Base OS: Raspberry Pi OS (Bookworm)
...
```

If the version doesn't match your expected golden image, stop and verify you're using the correct SD card or image source.

### 1. Set Hostname

```bash
# Set new hostname
sudo hostnamectl set-hostname auvik-acme-hq

# Update /etc/hosts
sudo sed -i 's/auvik-TEMPLATE/auvik-acme-hq/' /etc/hosts

# Verify
hostname
```

Hostname format: `auvik-{clientcode}-{sitecode}`

Examples:
- `auvik-acme-hq` — Acme Corp headquarters
- `auvik-globex-branch1` — Globex branch office 1
- `auvik-initech-dc` — Initech data center

### 2. Configure Static IP

```bash
# List current connections
nmcli con show

# Configure static IP
sudo nmcli con mod "Wired connection 1" \
  ipv4.method manual \
  ipv4.addresses 10.1.1.50/24 \
  ipv4.gateway 10.1.1.1 \
  ipv4.dns "10.1.1.1 8.8.8.8"

# Apply changes
sudo nmcli con down "Wired connection 1"
sudo nmcli con up "Wired connection 1"

# Verify
ip addr show eth0
ip route show
```

### 3. Set Timezone

```bash
# List available timezones
timedatectl list-timezones | grep America

# Set timezone
sudo timedatectl set-timezone America/Chicago

# Verify
timedatectl
```

Common timezones:
- `America/New_York` — Eastern
- `America/Chicago` — Central
- `America/Denver` — Mountain
- `America/Los_Angeles` — Pacific

### 4. Install Auvik Collector

1. Log into Auvik portal
2. Navigate to client → site
3. Click **Add Collector** → **Bash Script**
4. Copy the generated command
5. Run on the Pi:

```bash
curl -sSL https://install.auvik.com | sudo bash -s -- --token YOUR_SITE_TOKEN
```

Wait for reboot and verify collector shows online in Auvik.

### 5. Verify Tailscale

Tailscale from the golden image should auto-connect. Verify:

```bash
tailscale status
```

If not connected:
```bash
sudo tailscale up --ssh
```

Update the device name in Tailscale admin if needed to match the new hostname.

### 6. Update Documentation

Record in your documentation platform:

| Field | Value |
|-------|-------|
| Client | Acme Corp |
| Site | Headquarters |
| Hostname | `auvik-acme-hq` |
| IP Address | `10.1.1.50` |
| Subnet | `10.1.1.0/24` |
| Gateway | `10.1.1.1` |
| VLAN | 100 (Management) |
| MAC Address | `d8:3a:dd:xx:xx:xx` |
| Serial Number | From Pi board |
| Tailscale IP | `100.x.x.x` |
| Auvik Site | acme-hq |
| Deploy Date | 2026-02-03 |

### 7. Create Asset Label

Print a label with:

```
viyu.net - Auvik Collector
═══════════════════════════
Hostname: auvik-acme-hq
IP: 10.1.1.50
Client: Acme Corp
Site: Headquarters
Deployed: 2026-02-03
```

Apply to the Pi case in a visible location.

## Customization Script

For faster customization, use this script:

```bash
#!/bin/bash
# customize-collector.sh

read -p "Enter hostname (e.g., auvik-acme-hq): " HOSTNAME
read -p "Enter IP address (e.g., 10.1.1.50): " IP
read -p "Enter subnet mask (e.g., 24): " SUBNET
read -p "Enter gateway (e.g., 10.1.1.1): " GATEWAY
read -p "Enter timezone (e.g., America/Chicago): " TIMEZONE

# Set hostname
sudo hostnamectl set-hostname "$HOSTNAME"
sudo sed -i "s/auvik-TEMPLATE/$HOSTNAME/" /etc/hosts

# Configure IP
sudo nmcli con mod "Wired connection 1" \
  ipv4.method manual \
  ipv4.addresses "$IP/$SUBNET" \
  ipv4.gateway "$GATEWAY" \
  ipv4.dns "$GATEWAY 8.8.8.8"

# Set timezone
sudo timedatectl set-timezone "$TIMEZONE"

# Apply network changes
sudo nmcli con down "Wired connection 1"
sudo nmcli con up "Wired connection 1"

echo "Customization complete!"
echo "Hostname: $HOSTNAME"
echo "IP: $IP/$SUBNET"
echo "Gateway: $GATEWAY"
echo "Timezone: $TIMEZONE"
echo ""
echo "Next steps:"
echo "1. Install Auvik collector"
echo "2. Verify Tailscale connection"
echo "3. Update documentation"
echo "4. Print and apply asset label"
```

Save this script to the golden image at `/home/viyuadmin/customize-collector.sh` and make executable:

```bash
chmod +x ~/customize-collector.sh
```

## Pre-Deployment Verification

Before packaging for field deployment:

- [ ] Golden image version verified and recorded
- [ ] Hostname changed from `auvik-TEMPLATE`
- [ ] Static IP configured correctly
- [ ] Can ping gateway
- [ ] Can reach internet (`ping 8.8.8.8`)
- [ ] Auvik collector online in portal
- [ ] Tailscale connected
- [ ] Documentation updated
- [ ] Asset label ready

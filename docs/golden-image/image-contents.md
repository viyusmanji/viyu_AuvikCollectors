---
sidebar_position: 1
---

# Golden Image Contents

The golden image is a pre-configured base image that enables fast, repeatable collector deployments.

## What's Included

A properly configured golden image contains:

| Component | Configuration |
|-----------|---------------|
| OS | Raspberry Pi OS Lite (64-bit) — Bookworm, fully updated |
| SSH | Enabled with authorized keys pre-loaded, password auth disabled |
| Admin Account | `viyuadmin` with sudo privileges |
| Firewall | `ufw` configured: allow SSH, allow all outbound |
| Auto-Updates | `unattended-upgrades` for security patches |
| Remote Access | Tailscale installed and authenticated |
| Watchdog | Hardware watchdog enabled for auto-recovery |
| Hostname | Set to `auvik-TEMPLATE` (placeholder) |

## Creating the Golden Image

### 1. Start with Fresh Install

Flash Raspberry Pi OS Lite (64-bit) using Raspberry Pi Imager with these settings:

- Hostname: `auvik-TEMPLATE`
- User: `viyuadmin`
- SSH: Enabled with password (temporary)
- Timezone: `America/Chicago` (or your primary timezone)

### 2. Boot and Update

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt autoremove -y
```

### 3. Configure SSH Key Authentication

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add viyu.net deployment key
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3... viyu-deployment-key
EOF

chmod 600 ~/.ssh/authorized_keys
```

### 4. Disable Password Authentication

```bash
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### 5. Configure Firewall

```bash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw --force enable
```

### 6. Enable Automatic Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 7. Install Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh
```

Authenticate via the URL provided, then disable key expiry in the Tailscale admin console.

### 8. Enable Hardware Watchdog

Add to `/boot/firmware/config.txt`:
```bash
echo "dtparam=watchdog=on" | sudo tee -a /boot/firmware/config.txt
```

Install and configure watchdog:
```bash
sudo apt install watchdog -y
sudo sed -i 's/#watchdog-device/watchdog-device/' /etc/watchdog.conf
sudo sed -i 's/#max-load-1/max-load-1/' /etc/watchdog.conf
sudo systemctl enable watchdog
```

### 9. Clean Up for Cloning

Remove machine-specific data:

```bash
# Clear SSH host keys (will regenerate on first boot)
sudo rm -f /etc/ssh/ssh_host_*

# Clear machine ID (will regenerate)
sudo truncate -s 0 /etc/machine-id
sudo rm -f /var/lib/dbus/machine-id

# Clear command history
history -c
rm -f ~/.bash_history

# Clear logs
sudo journalctl --vacuum-time=1s

# Sync and shutdown
sudo sync
sudo shutdown -h now
```

### 10. Create Image Backup

Remove the microSD card and create an image:

**On macOS:**
```bash
diskutil list  # Find disk (e.g., disk4)
sudo dd if=/dev/rdisk4 of=~/auvik-golden-image.img bs=1m status=progress
```

**On Linux:**
```bash
lsblk  # Find device (e.g., sdb)
sudo dd if=/dev/sdb of=~/auvik-golden-image.img bs=4M status=progress
```

**On Windows:**
Use Win32 Disk Imager or balenaEtcher to read the SD card to a file.

## Image Storage

Store the golden image:

| Location | Purpose |
|----------|---------|
| NAS/File Server | Primary storage, versioned |
| Technician Laptops | Local copy for field use |
| Cloud Storage | Backup/disaster recovery |

## Image Versioning

Golden images follow semantic versioning to track changes and compatibility. See [Version History](./version-history.md) for detailed change logs.

### Version Numbering

Use semantic versioning format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or major OS upgrades
- **MINOR**: New features or significant updates
- **PATCH**: Bug fixes and minor updates

### Naming Convention

Name images with version and date:

```
auvik-golden-v1.0.0-2026-02-03.img
auvik-golden-v1.1.0-2026-03-15.img
auvik-golden-v2.0.0-2027-01-10.img
```

### Version File

Each golden image must include a version file at `/etc/golden-image-version`:

```bash
# Create version file during image build
echo "1.0.0" | sudo tee /etc/golden-image-version
sudo chmod 644 /etc/golden-image-version
```

This file enables automated version checking on deployed collectors.

### Version Check Script

Add the version check script to enable remote version auditing:

```bash
# Download and install version-check.sh
sudo curl -o /usr/local/bin/version-check.sh https://raw.githubusercontent.com/viyu/auvik-collectors/main/scripts/version-check.sh
sudo chmod +x /usr/local/bin/version-check.sh
```

The version check script reads `/etc/golden-image-version` and reports the current image version, enabling centralized tracking of all deployed collectors.

## Maintenance Schedule

| Task | Frequency |
|------|-----------|
| OS Updates | Quarterly |
| Security Patches | Monthly (via unattended-upgrades) |
| Full Image Rebuild | Annually or on major OS release |
| Tailscale Update | Automatic |

## Golden Image Checklist

Before marking an image as ready:

- [ ] OS fully updated (`apt update && apt upgrade`)
- [ ] SSH key authentication only (password disabled)
- [ ] `viyuadmin` account with sudo
- [ ] `ufw` firewall active
- [ ] `unattended-upgrades` enabled
- [ ] Tailscale installed and authenticated
- [ ] Hardware watchdog enabled
- [ ] Hostname set to `auvik-TEMPLATE`
- [ ] SSH host keys removed
- [ ] Machine ID cleared
- [ ] History cleared

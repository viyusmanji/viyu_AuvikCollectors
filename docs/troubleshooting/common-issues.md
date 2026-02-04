---
sidebar_position: 1
---

# Common Issues

Quick reference for troubleshooting the most frequently encountered problems.

## Issue Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Pi doesn't power on | Switch port 802.3af-only, or PoE budget exhausted | Verify 802.3at support, test with USB-C PSU |
| Collector offline in Auvik | Network issue, Pi crash, SD card failure | Check Tailscale status, attempt SSH |
| No device discovery | SNMP not enabled, wrong credentials, VLAN isolation | Verify SNMP config on devices, check routing |
| High CPU/memory | Site exceeds Pi capacity | Review device/interface counts, scale to VM |
| Tailscale not connecting | Firewall blocking outbound | Verify HTTPS to tailscale.com allowed |
| SD card corruption | Write wear-out or power loss | Re-flash from golden image |

## Diagnostic Commands

### System Health

```bash
# Overall status
uptime
free -h
df -h

# Service status
systemctl status auvik-collector
systemctl status tailscaled

# Network
ip addr show
ip route show
ping 8.8.8.8
curl -I https://auvik.com
```

### Auvik Collector

```bash
# Service logs
journalctl -u auvik-collector -f

# Service control
sudo systemctl restart auvik-collector
sudo systemctl stop auvik-collector
sudo systemctl start auvik-collector
```

### Tailscale

```bash
# Status
tailscale status
tailscale netcheck

# Reconnect
sudo tailscale up --ssh
```

## Escalation Path

If standard troubleshooting doesn't resolve the issue:

1. **Check Auvik support docs** — [support.auvik.com](https://support.auvik.com)
2. **Review Tailscale status** — [status.tailscale.com](https://status.tailscale.com)
3. **Check Pi forums** — [forums.raspberrypi.com](https://forums.raspberrypi.com)
4. **Internal escalation** — Document issue and escalate to senior team

## SSH Connection Scenarios

Multiple methods exist for accessing collectors remotely. Choose the appropriate method based on your network configuration and security requirements.

### 1. LAN (Local Network) Connection

Direct SSH access when on the same local network as the collector.

**Prerequisites:**
- Collector IP address (check router DHCP, or use `arp-scan`)
- SSH access enabled on collector
- Network connectivity to collector subnet

**Connection command:**

```bash
ssh viyu@<collector-ip>
# Example:
ssh viyu@192.168.1.100
```

**Common errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection refused` | SSH service not running | Verify service: `systemctl status sshd` |
| `Connection timed out` | Firewall blocking port 22, or wrong IP | Check firewall rules, verify IP with `ping` |
| `Permission denied (publickey)` | Key authentication failed | Use password auth: `ssh -o PreferredAuthentications=password viyu@<ip>` |
| `Host key verification failed` | SSH key changed (re-imaged Pi) | Remove old key: `ssh-keygen -R <collector-ip>` |

**Verification:**

```bash
# Test connectivity
ping <collector-ip>

# Verify SSH port is open
nc -zv <collector-ip> 22

# Check collector hostname
ssh viyu@<collector-ip> hostname
```

### 2. Tailscale VPN Connection

Remote access via Tailscale mesh VPN network.

**Prerequisites:**
- Tailscale installed on your workstation
- Collector enrolled in Tailscale network
- Authenticated to same Tailscale account

**Connection command:**

```bash
# Connect using Tailscale hostname
ssh viyu@<collector-hostname>

# Or use Tailscale IP (100.x.x.x range)
ssh viyu@100.64.0.5

# Check Tailscale status first
tailscale status
```

**Common errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Could not resolve hostname` | Tailscale not running or collector offline | Run `tailscale status`, verify collector listed |
| `Connection timed out` | Tailscale SSH not enabled | Enable on collector: `sudo tailscale up --ssh` |
| `Network is unreachable` | Tailscale daemon not running | Start service: `sudo systemctl start tailscaled` |
| `No route to host` | Subnet routing or firewall issue | Check routes: `tailscale status --peers` |

**Verification:**

```bash
# Check Tailscale connectivity
tailscale ping <collector-hostname>

# List all Tailscale devices
tailscale status

# Verify Tailscale IP
tailscale ip -4
```

**Troubleshooting Tailscale SSH:**

```bash
# Enable SSH on collector (requires physical/console access)
sudo tailscale up --ssh

# Check Tailscale logs
sudo journalctl -u tailscaled -f

# Force reconnection
sudo tailscale down
sudo tailscale up --ssh
```

### 3. SSH Jump Host (ProxyJump)

Access collectors behind firewalls using an intermediate jump/bastion host.

**Prerequisites:**
- SSH access to jump host
- Jump host can reach collector network
- SSH keys configured on jump host and collector

**Connection methods:**

**Option A: Command-line ProxyJump**

```bash
# Single jump host
ssh -J jumpuser@jumphost viyu@<collector-ip>

# Multiple jump hosts
ssh -J jumpuser@jump1,jumpuser@jump2 viyu@<collector-ip>

# With specific ports
ssh -J jumpuser@jumphost:2222 viyu@<collector-ip>
```

**Option B: SSH Config file**

```bash
# Add to ~/.ssh/config
Host jump-host
    HostName jumphost.example.com
    User jumpuser
    Port 22

Host collector-*
    User viyu
    ProxyJump jump-host

# Then connect simply:
ssh collector-192.168.1.100
```

**Option C: ProxyCommand (legacy)**

```bash
# Using ProxyCommand
ssh -o ProxyCommand="ssh -W %h:%p jumpuser@jumphost" viyu@<collector-ip>

# In ~/.ssh/config:
Host collector-*
    User viyu
    ProxyCommand ssh -W %h:%p jumpuser@jumphost
```

**Common errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Jump host authentication failed` | Can't authenticate to jump host | Verify jump host credentials/keys first |
| `Channel open failed` | Jump host can't reach collector | Test from jump host: `ssh jumpuser@jumphost`, then `ssh viyu@<collector-ip>` |
| `Permission denied on final hop` | Collector authentication failed | Ensure SSH key forwarding: `ssh -A -J ...` |
| `Connection closed by jump host` | Jump host policy/timeout | Check jump host SSH config, increase timeout |

**Verification:**

```bash
# Test jump host access first
ssh jumpuser@jumphost

# Test from jump host to collector
ssh jumpuser@jumphost "ssh viyu@<collector-ip> hostname"

# Test full chain
ssh -J jumpuser@jumphost viyu@<collector-ip> "uptime"
```

### 4. Client VPN Connection

Access via corporate or site-to-site VPN.

**Prerequisites:**
- VPN client installed and configured
- Connected to VPN with access to collector subnet
- DNS resolution configured (if using hostnames)

**Connection command:**

```bash
# Connect to VPN first (example using OpenVPN)
sudo openvpn --config /path/to/client.ovpn

# Then SSH to collector via private IP
ssh viyu@<collector-private-ip>

# Or using hostname (if DNS configured)
ssh viyu@collector.internal.domain
```

**Common errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `No route to host` | VPN not connected or wrong route | Verify VPN: `ip route show`, check VPN status |
| `Connection timed out` | VPN firewall blocking SSH | Check VPN ACLs, verify SSH allowed through VPN |
| `Could not resolve hostname` | DNS not working through VPN | Use IP instead, or check DNS config: `cat /etc/resolv.conf` |
| `Network is unreachable` | VPN routes not pushed | Check routes: `ip route \| grep <collector-subnet>` |

**Verification:**

```bash
# Verify VPN connection
ip addr show tun0  # or tap0, depending on VPN type

# Check VPN routes
ip route show | grep <collector-subnet>

# Test connectivity to collector subnet
ping <collector-private-ip>

# Verify DNS (if using hostnames)
nslookup collector.internal.domain

# Test SSH connection
ssh viyu@<collector-private-ip> "echo 'VPN SSH working'"
```

**VPN-specific debugging:**

```bash
# Check VPN interface
ifconfig | grep -A 5 tun0

# Verify routing table
netstat -rn | grep <collector-subnet>

# Test without DNS
ssh viyu@<collector-ip> -v  # verbose mode for debugging

# Check if split-tunnel or full-tunnel
ip route show default
```

## Detailed Troubleshooting

For detailed troubleshooting of specific issues, see:

- [Pi Not Powering On](/docs/troubleshooting/pi-not-powering)
- [Collector Offline](/docs/troubleshooting/collector-offline)
- [SD Card Failure](/docs/troubleshooting/sd-card-failure)

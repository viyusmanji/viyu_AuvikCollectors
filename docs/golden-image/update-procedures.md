---
sidebar_position: 5
---

# Update Procedures

Guidelines for updating deployed collectors, including in-place updates, re-imaging, rollback procedures, and batch operations.

:::info Update Strategy
Choose the appropriate update method based on the scope of changes needed. In-place updates minimize downtime but require careful testing. Re-imaging provides a clean slate but requires more time and coordination.
:::

## When to Update vs. Re-Image

| Scenario | Method | Downtime | Complexity |
|----------|--------|----------|------------|
| Security patches | In-place update | ~1-2 minutes | Low |
| Package updates | In-place update | ~5-10 minutes | Low |
| Configuration changes | In-place update | ~1-2 minutes | Low |
| Major OS upgrade | Re-image | ~15-30 minutes | Medium |
| Corrupt filesystem | Re-image | ~15-30 minutes | Medium |
| Golden image version change | Re-image | ~15-30 minutes | Medium |
| Hardware failure | Re-image | ~15-30 minutes | Low |

## In-Place Updates

Update deployed collectors without replacing the SD card.

### Security Patches (Automatic)

The golden image includes `unattended-upgrades` for automatic security patches:

**Check automatic update status:**
```bash
ssh viyuadmin@collector-hostname
sudo systemctl status unattended-upgrades
sudo cat /var/log/unattended-upgrades/unattended-upgrades.log
```

**Verify last update:**
```bash
sudo apt update
sudo apt list --upgradable
```

### Manual Package Updates

For quarterly maintenance or immediate updates:

**1. Connect via SSH:**
```bash
ssh viyuadmin@collector-hostname
# Or via Tailscale
ssh viyuadmin@collector-hostname.tailnet-name.ts.net
```

**2. Check current version:**
```bash
cat /etc/golden-image-version
```

**3. Update packages:**
```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

**4. Check for required reboot:**
```bash
if [ -f /var/run/reboot-required ]; then
    echo "Reboot required"
    cat /var/run/reboot-required.pkgs
fi
```

**5. Reboot if needed:**
```bash
sudo reboot
```

**6. Verify services after reboot:**
```bash
# Wait ~2 minutes for boot, then reconnect
ssh viyuadmin@collector-hostname
sudo systemctl status tailscaled
sudo systemctl status watchdog
sudo ufw status
```

### Configuration Updates

Update configuration without full re-image:

**Firewall rule changes:**
```bash
# Add new rule
sudo ufw allow 8080/tcp
sudo ufw reload
sudo ufw status
```

**SSH key updates:**
```bash
# Add new key
echo "ssh-ed25519 AAAAC3... new-key" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Hostname changes:**
```bash
# Update hostname
sudo hostnamectl set-hostname new-collector-name
sudo reboot
```

**Tailscale re-authentication:**
```bash
sudo tailscale down
sudo tailscale up --ssh
# Follow authentication URL
```

### Software Installation

Add new tools to deployed collectors:

```bash
# Example: Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker viyuadmin
sudo systemctl enable docker
```

## Re-Imaging Procedures

Replace the SD card with a fresh golden image clone.

### When to Re-Image

Re-imaging is recommended when:

- Upgrading to new golden image version (e.g., 1.0.0 → 1.1.0)
- Major OS upgrade (e.g., Bookworm → next release)
- Filesystem corruption or SD card failure
- Collector experiencing persistent issues
- Significant configuration drift from golden image
- Annual maintenance refresh

### Pre-Re-Image Checklist

Before re-imaging a collector:

- [ ] Schedule maintenance window with client
- [ ] Notify client of expected downtime (~15-30 minutes)
- [ ] Document current configuration (hostname, Tailscale, Auvik settings)
- [ ] Back up any custom scripts or configurations
- [ ] Verify new golden image version available
- [ ] Verify new image checksum (SHA256)
- [ ] Prepare spare SD card (32GB+ A2 rated)

### Re-Imaging Process

**1. Document Current State**

```bash
# Connect and document
ssh viyuadmin@collector-hostname

# Record current version
cat /etc/golden-image-version

# Record Auvik configuration
sudo systemctl status auvik-collector
sudo cat /etc/auvik/collector.conf

# Record hostname
hostname

# Record Tailscale status
sudo tailscale status
```

**2. Shut Down Collector**

```bash
sudo shutdown -h now
```

Wait for green LED to stop blinking (powered down).

**3. Flash New Image**

Follow the [Cloning Process](/docs/golden-image/cloning-process) to flash the new golden image to a spare SD card.

**4. Swap SD Cards**

- Power off and unplug the Pi
- Remove old SD card (label and retain for backup)
- Insert new SD card with fresh golden image
- Power on the Pi

**5. Customize for Site**

Follow [Per-Client Customization](/docs/golden-image/per-client-customization) process:

```bash
# SSH in (may need to use local IP initially)
ssh viyuadmin@auvik-TEMPLATE

# Set hostname
sudo hostnamectl set-hostname collector-hostname

# Configure Tailscale
sudo tailscale up --ssh
# Follow authentication URL

# Install Auvik collector
# Use site-specific install command from Auvik portal
```

**6. Verify Operation**

```bash
# Check services
sudo systemctl status tailscaled
sudo systemctl status auvik-collector
sudo systemctl status watchdog

# Check firewall
sudo ufw status

# Check version
cat /etc/golden-image-version

# Check disk space
df -h

# Check memory
free -h
```

**7. Monitor for 24 Hours**

- Verify collector reports to Auvik portal
- Check Tailscale connectivity
- Monitor system logs for errors
- Confirm automatic updates working

### Post-Re-Image Documentation

Update your deployment records:

| Field | Value |
|-------|-------|
| Site Name | `{Client name}` |
| Hostname | `{collector-hostname}` |
| Golden Image Version | `{e.g., 1.1.0}` |
| Re-Image Date | `{YYYY-MM-DD}` |
| Technician | `{Name}` |
| Old SD Card Location | `{e.g., labeled and stored}` |
| Auvik Status | `{Online/Reporting}` |
| Tailscale Status | `{Connected}` |

## Rollback Procedures

How to recover from failed updates or re-imaging.

### Rollback Scenarios

| Issue | Rollback Method | Recovery Time |
|-------|----------------|---------------|
| Failed package update | Restore from backup or rollback packages | ~5 minutes |
| Failed re-image (new card won't boot) | Reinstall old SD card | ~2 minutes |
| Broken configuration | Restore config files or re-image | ~5-15 minutes |
| Network connectivity lost | Physical access or restore previous card | ~5-15 minutes |

### Quick Rollback: Reinstall Old SD Card

If new image fails to boot or has critical issues:

**1. Power down:**
```bash
# If accessible via SSH
sudo shutdown -h now
# Otherwise, physically power off
```

**2. Swap cards:**
- Remove new SD card
- Reinstall old SD card (should be labeled and retained)
- Power on

**3. Verify operation:**
```bash
ssh viyuadmin@collector-hostname
sudo systemctl status auvik-collector
sudo tailscale status
```

**4. Document issue:**
- Record what failed with new image
- Check `/var/log/syslog` for errors
- Report to team for investigation

### Package Rollback

If a package update causes issues:

**Hold problematic package:**
```bash
# Prevent package from being upgraded
sudo apt-mark hold package-name

# Verify hold
apt-mark showhold
```

**Downgrade package (if available):**
```bash
# List available versions
apt list -a package-name

# Install specific version
sudo apt install package-name=version
```

**Full system rollback (advanced):**
```bash
# Restore from backup using Timeshift or similar
# This requires backup tools to be pre-configured
```

### Configuration Rollback

Restore previous configuration files:

**Restore from backup:**
```bash
# If you backed up before changes
sudo cp /etc/config-file.bak /etc/config-file
sudo systemctl restart service-name
```

**Reset to golden image defaults:**
```bash
# Re-image the SD card to restore default configuration
# Follow Re-Imaging Procedures above
```

### Emergency Recovery

If collector becomes completely inaccessible:

**1. Physical Access Required:**
- Connect keyboard and monitor to Pi
- Boot and login as `viyuadmin`
- Diagnose issue from console

**2. Common Issues:**

**SSH not accessible:**
```bash
# From console
sudo systemctl status ssh
sudo systemctl restart ssh

# Check firewall
sudo ufw status
sudo ufw allow ssh
```

**Tailscale not connecting:**
```bash
# From console
sudo tailscale status
sudo tailscale up --ssh
```

**Network not working:**
```bash
# Check network interface
ip addr show
sudo systemctl restart NetworkManager

# Check connectivity
ping -c 4 8.8.8.8
```

**3. Last Resort: Re-Image**

If recovery attempts fail, perform full re-image following Re-Imaging Procedures above.

## Batch Updates

Efficiently update multiple collectors.

### Batch Update Planning

**Before batch updates:**

- [ ] Test update on single collector in lab
- [ ] Document exact update commands
- [ ] Schedule maintenance windows with all clients
- [ ] Prepare rollback plan
- [ ] Assign technicians to sites if needed
- [ ] Create update checklist

### Sequential Update Strategy

Update collectors one-by-one with verification between each:

**1. Create collector inventory:**

```bash
# collectors.txt
collector1.tailnet.ts.net
collector2.tailnet.ts.net
collector3.tailnet.ts.net
```

**2. Update script template:**

```bash
#!/bin/bash
# update-collector.sh

COLLECTOR=$1

echo "Updating $COLLECTOR..."

ssh viyuadmin@$COLLECTOR << 'ENDSSH'
    echo "Current version:"
    cat /etc/golden-image-version

    echo "Updating packages..."
    sudo apt update
    sudo apt upgrade -y
    sudo apt autoremove -y

    if [ -f /var/run/reboot-required ]; then
        echo "Reboot required"
        sudo reboot
    else
        echo "No reboot required"
    fi
ENDSSH

echo "$COLLECTOR update complete"
```

**3. Run updates sequentially:**

```bash
chmod +x update-collector.sh

while read collector; do
    ./update-collector.sh $collector
    echo "Waiting 5 minutes before next update..."
    sleep 300
done < collectors.txt
```

**4. Verify each collector after update:**

```bash
#!/bin/bash
# verify-collectors.sh

while read collector; do
    echo "Verifying $collector..."
    ssh viyuadmin@$collector << 'ENDSSH'
        echo "Version: $(cat /etc/golden-image-version)"
        echo "Uptime: $(uptime)"
        echo "Tailscale: $(sudo tailscale status --json | jq -r '.Self.Online')"
        echo "Auvik: $(sudo systemctl is-active auvik-collector)"
ENDSSH
    echo "---"
done < collectors.txt
```

### Parallel Update Strategy

**⚠️ Use with caution** — only for non-critical updates with tested procedures:

```bash
#!/bin/bash
# parallel-update.sh

update_collector() {
    collector=$1
    ssh viyuadmin@$collector 'sudo apt update && sudo apt upgrade -y'
    echo "$collector complete"
}

# Export function for parallel execution
export -f update_collector

# Update all collectors in parallel (max 5 at once)
cat collectors.txt | xargs -n 1 -P 5 -I {} bash -c 'update_collector "$@"' _ {}
```

### Batch Re-Imaging

For major golden image version upgrades:

**1. Prepare materials:**
- Flash multiple SD cards with new golden image
- Label each card with destination site
- Prepare site-specific documentation

**2. Schedule site visits:**
- Group by geographic location
- Allow 30-45 minutes per site
- Schedule backup time for issues

**3. Site visit procedure:**
- Follow Re-Imaging Procedures for each collector
- Document old SD card and store as backup
- Verify operation before leaving site
- Update deployment records

**4. Follow-up monitoring:**
- Check all collectors daily for 1 week
- Address any issues promptly
- Document lessons learned

### Batch Update Best Practices

- **Stagger updates** — Don't update all collectors simultaneously
- **Test first** — Always test on non-critical collector first
- **Monitor closely** — Watch each collector for 24 hours post-update
- **Document everything** — Record what was updated and results
- **Have rollback ready** — Prepare for quick rollback if needed
- **Communicate** — Keep clients informed of maintenance schedules

## Update Testing Checklist

Verify updates are successful and collectors are operating correctly.

### Pre-Update Testing

Before applying updates to production collectors:

- [ ] Test update on lab/dev collector
- [ ] Verify all services start after update
- [ ] Check Auvik collector compatibility
- [ ] Test Tailscale connectivity
- [ ] Verify firewall rules intact
- [ ] Check for known issues with update
- [ ] Document exact update commands used

### Post-Update Verification

After updating each collector:

**Immediate checks (within 5 minutes):**

```bash
# System is responsive
ssh viyuadmin@collector-hostname "uptime"

# Services are running
ssh viyuadmin@collector-hostname "sudo systemctl is-active tailscaled auvik-collector watchdog"

# Network connectivity
ssh viyuadmin@collector-hostname "ping -c 4 8.8.8.8"

# Disk space adequate
ssh viyuadmin@collector-hostname "df -h / | tail -1"

# No critical errors in logs
ssh viyuadmin@collector-hostname "sudo journalctl -p err -n 20 --no-pager"
```

**Extended checks (within 30 minutes):**

- [ ] Auvik collector shows "Online" in portal
- [ ] Tailscale shows "Connected" in admin console
- [ ] No firewall blocks reported
- [ ] SSH access working normally
- [ ] System load normal (`uptime`, `top`)
- [ ] No memory issues (`free -h`)
- [ ] Temperature normal (Raspberry Pi 5: &lt;60°C idle)

**24-Hour monitoring:**

- [ ] Collector continues reporting to Auvik
- [ ] No unexpected reboots (check `uptime`)
- [ ] No service failures (check `systemctl --failed`)
- [ ] No recurring errors in logs
- [ ] Automatic updates still functioning
- [ ] Tailscale connection stable

### Automated Testing Script

Create a health check script for quick verification:

```bash
#!/bin/bash
# health-check.sh

COLLECTOR=$1

echo "=== Health Check: $COLLECTOR ==="
echo ""

ssh viyuadmin@$COLLECTOR << 'ENDSSH'
    echo "1. System Info:"
    echo "   Version: $(cat /etc/golden-image-version)"
    echo "   Hostname: $(hostname)"
    echo "   Uptime: $(uptime -p)"
    echo ""

    echo "2. Service Status:"
    for service in tailscaled auvik-collector watchdog ssh ufw; do
        status=$(sudo systemctl is-active $service 2>/dev/null || echo "not-found")
        echo "   $service: $status"
    done
    echo ""

    echo "3. Network:"
    echo "   Tailscale: $(sudo tailscale status --peers=false | head -1)"
    ping -c 2 -W 2 8.8.8.8 >/dev/null 2>&1 && echo "   Internet: Connected" || echo "   Internet: FAILED"
    echo ""

    echo "4. Resources:"
    echo "   Disk: $(df -h / | awk 'NR==2 {print $5 " used"}')"
    echo "   Memory: $(free -h | awk 'NR==2 {print $3 "/" $2}')"
    echo "   Load: $(uptime | awk -F'load average:' '{print $2}')"
    echo ""

    echo "5. Recent Errors:"
    error_count=$(sudo journalctl -p err --since "1 hour ago" --no-pager | wc -l)
    echo "   Errors in last hour: $error_count"
    if [ $error_count -gt 0 ]; then
        sudo journalctl -p err --since "1 hour ago" --no-pager | tail -5
    fi
ENDSSH

echo ""
echo "=== Health Check Complete ==="
```

**Usage:**
```bash
chmod +x health-check.sh
./health-check.sh collector-hostname.tailnet.ts.net
```

### Rollback Decision Criteria

Initiate rollback if any of these occur:

- ❌ Collector stops reporting to Auvik for >15 minutes
- ❌ Tailscale connectivity lost and not recoverable
- ❌ Critical services fail to start after reboot
- ❌ System becomes unresponsive or extremely slow
- ❌ Filesystem corruption detected
- ❌ Recurring kernel panics or hardware errors
- ❌ Network connectivity completely lost

### Success Criteria

Update is successful when:

- ✅ All services running normally
- ✅ Auvik collector reporting correctly
- ✅ Tailscale connected and accessible
- ✅ No critical errors in logs
- ✅ System performance normal
- ✅ Client connectivity unaffected
- ✅ 24-hour stability confirmed

## Update Documentation

Maintain records of all updates:

### Update Log Template

```markdown
## Update Log Entry

**Date:** YYYY-MM-DD
**Collector:** collector-hostname
**Technician:** Name
**Update Type:** [In-Place | Re-Image]

**Pre-Update State:**
- Golden Image Version: X.X.X
- OS Packages: [Versions]
- Services Status: All OK

**Update Details:**
- New Golden Image Version: X.X.X (if applicable)
- Packages Updated: [List]
- Configuration Changes: [List]
- Downtime: XX minutes

**Post-Update State:**
- All services: Running
- Auvik status: Online
- Tailscale status: Connected
- Health check: Passed

**Issues Encountered:** None / [Description]
**Rollback Performed:** No / Yes - [Reason]

**Notes:** [Additional observations]
```

### Version Tracking

Track deployed golden image versions:

```bash
#!/bin/bash
# audit-versions.sh

echo "=== Golden Image Version Audit ==="
echo ""

while read collector; do
    version=$(ssh viyuadmin@$collector "cat /etc/golden-image-version 2>/dev/null || echo 'unknown'")
    uptime=$(ssh viyuadmin@$collector "uptime -p")
    echo "$collector: v$version ($uptime)"
done < collectors.txt
```

---

## Related Documentation

- [Image Contents](/docs/golden-image/image-contents) — What's included in the golden image
- [Version History](/docs/golden-image/version-history) — Golden image version changelog
- [Cloning Process](/docs/golden-image/cloning-process) — How to flash golden images to SD cards
- [Per-Client Customization](/docs/golden-image/per-client-customization) — Site-specific configuration steps

---
sidebar_position: 4
---

# Performance Issues

Diagnosing and resolving performance problems with Raspberry Pi 5 Auvik collectors.

## Symptoms

- **Polling latency** — Gaps in monitoring graphs, delayed updates
- **High CPU/memory usage** — Sustained &gt;80% utilization
- **Slow device discovery** — New devices take longer to appear
- **Auvik portal warnings** — Performance degradation alerts
- **System responsiveness** — SSH lag, slow command execution

## Performance Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| High memory (&gt;85%) | Too many devices/interfaces | Review scale thresholds, consider VM migration |
| High CPU (&gt;80%) | Polling overload or runaway process | Check device count, review top processes |
| Slow discovery | Resource exhaustion | Reduce discovery scope, scale to VM |
| Disk I/O bottleneck | Poor SD card, excessive logging | Replace with A2-rated card, rotate logs |
| Network latency spikes | Bandwidth saturation | Review polling frequency, check network utilization |

## Performance Baselines

Understanding normal performance helps identify issues early.

### Pi 5 8GB Baseline Metrics

Under typical load (100 devices, 4,000 interfaces):

| Metric | Normal Range | Warning Threshold | Critical |
|--------|--------------|-------------------|----------|
| CPU Usage | 20-40% | &gt;60% sustained | &gt;80% |
| Memory Used | 2-4 GB | &gt;6.5 GB (&gt;85%) | &gt;7.5 GB |
| Load Average (1m) | 0.5-1.5 | &gt;2.5 | &gt;3.5 |
| Disk Free | &gt;20 GB | &lt;5 GB | &lt;2 GB |
| SNMP Poll Time | &lt;10s | &gt;20s | &gt;30s |

### Pi 5 4GB Baseline Metrics

Under typical load (50 devices, 2,000 interfaces):

| Metric | Normal Range | Warning Threshold | Critical |
|--------|--------------|-------------------|----------|
| CPU Usage | 20-40% | &gt;60% sustained | &gt;80% |
| Memory Used | 1.5-2.5 GB | &gt;3.2 GB (&gt;85%) | &gt;3.7 GB |
| Load Average (1m) | 0.5-1.5 | &gt;2.5 | &gt;3.5 |
| Disk Free | &gt;20 GB | &lt;5 GB | &lt;2 GB |
| SNMP Poll Time | &lt;10s | &gt;20s | &gt;30s |

:::tip
Baseline metrics vary by network size and complexity. Establish your own baselines during initial deployment by monitoring for the first week.
:::

## Capacity and Scaling Thresholds

### Device and Interface Limits

Know when to scale from Pi to VM:

| Configuration | Devices (Max) | Interfaces (Max) | Recommended Action |
|---------------|---------------|------------------|--------------------|
| Pi 5 4GB | ~100 | ~4,000 | Small to medium sites only |
| Pi 5 8GB | ~200 | ~9,000 | Medium sites, monitor closely |
| x86 VM (4GB) | ~250 | ~12,000 | Large sites |
| x86 VM (8GB) | ~500+ | ~20,000+ | Enterprise sites |

:::warning
These are approximate limits. Actual capacity depends on:
- Device types (switches with many interfaces consume more resources)
- Polling frequency (higher frequency = more load)
- SNMP complexity (some MIBs are resource-intensive)
- Network topology (complex routing requires more discovery cycles)
:::

### Scaling Decision Tree

```
Monitoring more than 150 devices
or 7,000 interfaces on Pi 5 8GB?
       │
       ▼
     YES → Migrate to VM now
       │
      NO
       ▼
CPU &gt;60% sustained
or Memory &gt;85%?
       │
       ▼
     YES → Plan VM migration
       │
      NO
       ▼
Polling latency &gt;15s
or discovery slow?
       │
       ▼
     YES → Optimize (see below)
            then reassess
       │
      NO
       ▼
Continue monitoring,
review monthly
```

## Resource Monitoring Commands

### Quick Health Check

```bash
# One-line status
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')% | Mem: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100}') | Load: $(uptime | awk -F'load average:' '{print $2}')"
```

### CPU Monitoring

```bash
# Current CPU usage
top -bn1 | head -20

# CPU usage by process
ps aux --sort=-%cpu | head -10

# Historical CPU (requires sysstat)
sar -u 1 10

# Live CPU per core
mpstat -P ALL 1
```

**Interpreting CPU metrics:**
- **&lt;40%** — Healthy
- **40-60%** — Monitor, plan for growth
- **60-80%** — Scale soon
- **&gt;80%** — Critical, migrate to VM immediately

### Memory Monitoring

```bash
# Memory overview
free -h

# Detailed memory breakdown
cat /proc/meminfo | grep -E "(MemTotal|MemFree|MemAvailable|Cached|Buffers)"

# Memory usage by process
ps aux --sort=-%mem | head -10

# Watch memory in real-time
watch -n 2 free -h
```

**Interpreting memory metrics:**
- **&lt;60%** — Healthy
- **60-80%** — Normal under load
- **80-90%** — Warning, plan to scale
- **&gt;90%** — Critical, migrate immediately

### Disk I/O Monitoring

```bash
# Disk space usage
df -h

# Disk I/O statistics
iostat -x 2 5

# Check for I/O wait
top -bn1 | grep "Cpu(s)" | awk '{print "IO Wait: " $10}'

# Find large files
du -sh /var/log/*
du -sh /home/viyu/*
```

**Warning signs:**
- **High iowait** (&gt;10%) — Disk bottleneck
- **&lt;2GB free** — Risk of disk full
- **Large log files** (&gt;1GB) — Rotation needed

### Network Monitoring

```bash
# Network interface statistics
ifconfig
ip -s link

# Bandwidth usage (requires vnstat)
vnstat -i eth0

# Active connections
netstat -tunap | grep auvik

# Monitor network traffic live
iftop -i eth0
```

### Auvik Collector Metrics

```bash
# Collector service status
systemctl status auvik-collector

# Recent collector logs
journalctl -u auvik-collector --since "1 hour ago" | tail -50

# Check for error patterns
journalctl -u auvik-collector --since "24 hours ago" | grep -i "error\|warn\|timeout"

# Collector process resource usage
ps aux | grep auvik

# Count monitored devices (check Auvik portal API or logs)
```

### Complete Health Report

Run this comprehensive check script:

```bash
#!/bin/bash
echo "=== Pi 5 Collector Health Report ==="
echo "Generated: $(date)"
echo ""
echo "--- System Info ---"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Kernel: $(uname -r)"
echo ""
echo "--- CPU ---"
echo "Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo ""
echo "--- Memory ---"
free -h
echo ""
echo "--- Disk Space ---"
df -h | grep -E "(Filesystem|/dev/root|/dev/mmcblk)"
echo ""
echo "--- Top Processes (CPU) ---"
ps aux --sort=-%cpu | head -6
echo ""
echo "--- Top Processes (Memory) ---"
ps aux --sort=-%mem | head -6
echo ""
echo "--- Auvik Collector Status ---"
systemctl status auvik-collector --no-pager | head -15
echo ""
echo "--- Recent Errors ---"
journalctl -u auvik-collector --since "1 hour ago" | grep -i error | tail -10
echo ""
echo "=== End Report ==="
```

Save as `/home/viyu/health-check.sh`, make executable with `chmod +x health-check.sh`, then run with `./health-check.sh`.

## Performance Optimization Tips

Before migrating to a VM, try these optimizations:

### 1. Reduce Discovery Scope

In Auvik portal:
- Exclude non-critical subnets from discovery
- Disable monitoring for unused interfaces
- Reduce polling frequency for non-critical devices

### 2. Optimize System Resources

```bash
# Clear system caches (safe, temporary)
sudo sync && sudo sysctl -w vm.drop_caches=3

# Rotate logs manually
sudo journalctl --vacuum-time=7d

# Remove old packages
sudo apt-get autoremove -y
sudo apt-get clean

# Disable unnecessary services (if any)
systemctl list-units --type=service --state=running
```

### 3. Improve SD Card Performance

```bash
# Check current I/O performance
sudo hdparm -t /dev/mmcblk0

# Enable TRIM (if supported)
sudo fstrim -v /

# Consider replacing with A2-rated card
```

### 4. Network Optimization

```bash
# Verify MTU settings
ip link show eth0

# Check for network errors
ip -s link show eth0

# Optimize SNMP timeouts (adjust in Auvik portal)
```

### 5. Tune Kernel Parameters

```bash
# Increase file descriptors
echo "fs.file-max = 65535" | sudo tee -a /etc/sysctl.conf

# Optimize network buffers
echo "net.core.rmem_max = 16777216" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_max = 16777216" | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -p
```

:::warning
Only apply kernel tuning if you understand the implications. Document any changes made.
:::

## Pi-to-VM Migration Procedure

When a site exceeds Pi capacity, migrate to an x86 VM.

### Pre-Migration Checklist

Before starting migration:

- [ ] Verify VM resources meet requirements (4 cores, 8GB RAM, 50GB disk)
- [ ] Confirm network access from VM to monitored devices
- [ ] Have Auvik portal admin credentials ready
- [ ] Schedule maintenance window (1-2 hours)
- [ ] Notify stakeholders of brief monitoring gap
- [ ] Document current Pi configuration

### Migration Steps

#### Step 1: Prepare the VM

```bash
# On the new VM (Ubuntu 22.04 LTS recommended)

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install prerequisites
sudo apt-get install -y curl wget

# Verify system meets requirements
echo "CPU Cores: $(nproc)"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk Space: $(df -h / | tail -1 | awk '{print $4}')"
```

#### Step 2: Download Auvik Collector

From Auvik portal:
1. Navigate to **Collectors** > **Add Collector**
2. Select **Linux (x86_64)**
3. Copy the installation command
4. Note the collector key

```bash
# Example installation command (use your actual command from Auvik)
curl -s https://downloads.auvik.com/collector/install.sh | sudo bash -s -- <your-collector-key>
```

#### Step 3: Configure Network Access

```bash
# Verify connectivity to devices
ping <device-ip>

# Test SNMP access to a known device
snmpwalk -v2c -c <community> <device-ip> system

# Verify outbound HTTPS to Auvik
curl -I https://auvik.com
```

#### Step 4: Verify VM Collector Online

In Auvik portal:
1. Check **Collectors** page
2. Confirm new collector shows **Online** status
3. Verify it's assigned to correct site

#### Step 5: Transition Monitoring

```bash
# In Auvik portal:
# 1. Reassign devices from Pi collector to VM collector
# 2. Wait 10-15 minutes for discovery to complete
# 3. Verify device count matches
# 4. Check for any discovery errors
```

#### Step 6: Monitor VM Performance

```bash
# On the VM, monitor for first 24 hours
watch -n 60 'free -h && uptime'

# Check collector logs
journalctl -u auvik-collector -f
```

#### Step 7: Decommission Pi Collector

**Wait 24-48 hours** to ensure VM stability, then:

```bash
# In Auvik portal:
# 1. Verify all devices migrated
# 2. Remove Pi collector from portal
# 3. Document completion

# On the Pi (optional):
sudo systemctl stop auvik-collector
sudo systemctl disable auvik-collector
```

### Post-Migration Validation

After migration, verify:

- [ ] All devices discovered on new VM collector
- [ ] Monitoring data flowing (check graphs in portal)
- [ ] No discovery errors in collector logs
- [ ] VM performance metrics within normal range
- [ ] Alerting configured correctly
- [ ] Documentation updated with new collector details

### Rollback Plan

If migration fails:

1. **Immediate:** Re-enable Pi collector in Auvik portal
2. **Re-assign devices** back to Pi collector
3. **Wait 10 minutes** for discovery to stabilize
4. **Troubleshoot VM** issues while Pi continues monitoring
5. **Retry migration** once VM issues resolved

### Common Migration Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| VM collector shows offline | Firewall blocking Auvik cloud | Allow HTTPS to *.auvik.com |
| No device discovery on VM | Network routing issue | Verify VM can reach device subnets |
| Devices discovered twice | Both collectors running | Disable Pi collector in portal |
| High latency on VM | VM resources insufficient | Increase VM CPU/RAM allocation |
| SNMP timeouts on VM | Firewall blocking UDP 161 | Allow outbound UDP 161 from VM |

## Performance Troubleshooting Scenarios

### Scenario 1: Sudden CPU Spike

**Symptoms:** CPU jumps from 30% to 90%

**Diagnosis:**
```bash
# Identify high-CPU process
top -bn1 | head -20
ps aux --sort=-%cpu | head -10

# Check for runaway processes
journalctl -u auvik-collector --since "30 min ago"
```

**Resolution:**
- If Auvik collector: Restart service
- If other process: Investigate and kill if necessary
- If sustained: Check device count, consider scaling

### Scenario 2: Memory Leak

**Symptoms:** Memory usage climbing over days

**Diagnosis:**
```bash
# Monitor memory trend
free -h
ps aux --sort=-%mem | head -10

# Check for memory growth
watch -n 300 'free -h'
```

**Resolution:**
```bash
# Restart Auvik collector
sudo systemctl restart auvik-collector

# If recurring, escalate to Auvik support
```

### Scenario 3: Disk Space Exhaustion

**Symptoms:** Disk usage &gt;95%, services failing

**Diagnosis:**
```bash
# Check disk usage
df -h

# Find large files
du -sh /var/log/*
du -sh /home/viyu/*
```

**Resolution:**
```bash
# Clean logs
sudo journalctl --vacuum-time=7d
sudo find /var/log -name "*.log" -mtime +30 -delete

# Clear package cache
sudo apt-get clean

# If recurring, investigate log growth rate
```

### Scenario 4: Polling Latency Increase

**Symptoms:** Graphs show gaps, delayed updates

**Diagnosis:**
- Check device count in Auvik portal
- Review CPU and memory on Pi
- Test SNMP response times manually

**Resolution:**
- Reduce discovery scope
- Optimize polling intervals
- Plan VM migration if near capacity

## Escalation Criteria

Escalate to senior team or Auvik support when:

1. **Performance degradation after optimization** — Issue persists after following this guide
2. **Unexplained resource usage** — Can't identify cause of high CPU/memory
3. **Collector instability** — Frequent crashes or restarts
4. **Migration failure** — VM collector won't stabilize
5. **Data collection gaps** — Missing monitoring data despite collector online

## Related Documentation

- [System Requirements](/docs/software/system-requirements) — Capacity guidelines
- [Collector Offline](/docs/troubleshooting/collector-offline) — Connectivity issues
- [Common Issues](/docs/troubleshooting/common-issues) — Quick reference

## Performance Monitoring Best Practices

1. **Establish baselines early** — Monitor for first week to understand normal
2. **Review monthly** — Check trends in resource usage
3. **Plan proactively** — Migrate to VM before hitting limits, not after
4. **Document optimization** — Track what works for each site
5. **Monitor alerts** — Configure Auvik alerts for collector performance
6. **Test under load** — Verify performance during discovery cycles
7. **Keep systems updated** — Apply OS and collector updates regularly

:::tip
Set up automated health reports to run weekly and email results. This proactive monitoring catches issues before they impact operations.
:::

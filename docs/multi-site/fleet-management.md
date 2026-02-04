---
sidebar_position: 4
---

import Checklist from '@site/src/components/Checklist';

# Fleet Management & Dashboard Setup

Centralized monitoring and management of multiple Auvik collectors across client sites.

## Fleet Management Checklist

<Checklist
  id="fleet-management-setup"
  title="Multi-Site Fleet Setup"
  items={[
    { id: 'multi-tenant', label: 'Verify Auvik multi-tenant account configured for viyu.net' },
    { id: 'site-hierarchy', label: 'Organize clients and sites in logical hierarchy' },
    { id: 'collector-naming', label: 'Apply consistent naming convention to all collectors' },
    { id: 'health-dashboard', label: 'Configure collector health monitoring dashboard' },
    { id: 'alerts-global', label: 'Set up global alert rules for all collectors' },
    { id: 'reports-scheduled', label: 'Configure scheduled reports for fleet overview' },
    { id: 'inventory-view', label: 'Create custom views for multi-site device inventory' },
    { id: 'remote-access', label: 'Verify Tailscale access to all deployed collectors' },
    { id: 'documentation', label: 'Maintain fleet inventory spreadsheet/database' },
  ]}
/>

## Multi-Site View Configuration

### Auvik Account Structure

Organize your Auvik account to support multiple clients and sites:

```
viyu.net (MSP Account)
├── Client A
│   ├── Headquarters
│   ├── Branch Office 1
│   └── Branch Office 2
├── Client B
│   ├── Main Office
│   └── Warehouse
└── Client C
    └── Single Location
```

**Best practices:**
- One collector per site (physical location)
- Group sites by client for billing and access control
- Use consistent naming: `clientname-sitename-collector01`
- Tag collectors with metadata (region, size, deployment-date)

### Accessing Multi-Site Views

**Dashboard Navigation:**
1. Log into Auvik portal
2. Use client selector dropdown (top-left)
3. Select **All Clients** for fleet-wide view
4. Or select specific client to view their sites

**Quick Filters:**
| View | Use Case |
|------|----------|
| All Clients → All Sites | Fleet-wide overview |
| Specific Client → All Sites | Client-specific multi-site |
| Specific Client → Specific Site | Single site detail |

### Creating Custom Multi-Site Views

**To create a saved view:**

1. Navigate to **Network → Inventory**
2. Apply filters:
   - Device type (e.g., all switches)
   - Client/site selection
   - Status (online/offline)
   - Tags or custom attributes
3. Click **Save View** → Name it (e.g., "All Client Firewalls")
4. Access from sidebar for quick retrieval

**Useful saved views:**
- **All Collectors** - Status of every deployed collector
- **Critical Devices** - Firewalls and core switches across all sites
- **Offline Devices** - Any device currently unreachable
- **High CPU/Memory** - Devices with resource issues

:::tip
Create a "Fleet Health" view filtered to show only collectors. This becomes your daily check dashboard.
:::

## Collector Health Monitoring

### Individual Collector Status

**To check a specific collector:**

1. Navigate to **Admin → Collectors**
2. Find collector by name (use search/filter)
3. Review key metrics:

| Metric | Healthy | Investigate |
|--------|---------|-------------|
| Status | Online (green) | Offline or warning |
| Last Check-in | < 5 minutes ago | > 15 minutes |
| Devices Monitored | Expected count | Sudden drop |
| CPU Usage | < 60% | > 80% sustained |
| Memory Usage | < 75% | > 90% |
| Disk Space | > 20% free | < 10% free |

**Quick health check via CLI:**

```bash
# SSH to collector via Tailscale
ssh viyuadmin@clienta-hq-collector01

# Check system load
uptime

# Check Auvik service
systemctl status auvik-collector

# Check resources
free -h
df -h

# Check Auvik service logs
journalctl -u auvik-collector --since "1 hour ago" | tail -n 50
```

### Fleet-Wide Health Dashboard

**Creating a Fleet Health Dashboard:**

1. Navigate to **Dashboards → Create New Dashboard**
2. Name it **"viyu.net Fleet Health"**
3. Add widgets:

**Widget 1: Collector Status Overview**
- Type: **Status Summary**
- Scope: **All Clients**
- Filter: **Device Type = Collector**
- Display: Online/Offline counts

**Widget 2: Collector List**
- Type: **Device List**
- Scope: **All Clients**
- Columns: Name, Site, Status, Last Check-in, Uptime
- Sort by: Status (offline first)

**Widget 3: Network Device Count by Site**
- Type: **Bar Chart**
- Metric: **Device Count**
- Group by: **Site**
- Use to spot sites with discovery issues

**Widget 4: Alert Summary**
- Type: **Alert List**
- Scope: **All Clients**
- Filter: **Severity = Critical or High**
- Time range: **Last 24 hours**

**Widget 5: Bandwidth Utilization (Top Sites)**
- Type: **Top N Chart**
- Metric: **Bandwidth Utilization**
- Scope: **All Clients**
- Top: **10 sites**

:::tip
Pin this dashboard as your home page: **User Settings → Default Dashboard → viyu.net Fleet Health**
:::

### Automated Health Monitoring

**Set up proactive monitoring:**

1. **Collector Offline Alerts**
   - Navigate to **Admin → Alerts → Alert Rules**
   - Enable **"Collector Offline"** rule
   - Set threshold: **Offline for 10 minutes**
   - Notification: Email + Slack/Teams webhook

2. **Collector Resource Alerts**
   - Create custom alert: **"Collector High CPU"**
   - Condition: CPU > 80% for 15 minutes
   - Action: Email to ops team

3. **Device Discovery Anomalies**
   - Create alert: **"Device Count Drop"**
   - Condition: Device count decreases by >20% suddenly
   - Indicates collector or network issue

**Alert delivery channels:**
```
Email → ops@viyu.net
Slack → #network-alerts
PagerDuty → On-call rotation (critical only)
```

### Remote Access Health Checks

Use Tailscale to verify all collectors are remotely accessible:

```bash
# From your management workstation
# List all collectors in Tailscale network
tailscale status | grep collector

# Ping each collector
for host in $(tailscale status | grep collector | awk '{print $1}'); do
  echo "Testing $host..."
  tailscale ping $host -c 2
done

# SSH connectivity test
for host in clienta-hq-collector01 clientb-main-collector01; do
  echo "SSH test: $host"
  ssh -o ConnectTimeout=5 viyuadmin@$host 'uptime' || echo "FAILED: $host"
done
```

## Dashboard Configuration

### Default Dashboard Setup

Configure a default landing page for quick fleet visibility:

1. **Create Main Dashboard**
   - Name: **"viyu.net Operations Dashboard"**
   - Layout: 3 columns

2. **Add Key Widgets:**

**Row 1: Fleet Status**
- Collector Online/Offline count
- Total devices monitored across all sites
- Critical alerts (last 24h)

**Row 2: Top Issues**
- Offline devices across all sites
- High bandwidth utilization
- Failed backups or discovery issues

**Row 3: Per-Client Summary**
- Client A: Device count, status
- Client B: Device count, status
- Client C: Device count, status

3. **Set Refresh Interval**
   - Dashboard Settings → Auto-refresh: **5 minutes**

4. **Share with Team**
   - Dashboard Settings → Share → **All viyu.net users**
   - Or specific user groups

### Per-Client Dashboards

For clients with multiple sites, create dedicated dashboards:

**Example: Client A Multi-Site Dashboard**

1. **Create Dashboard**: "Client A - All Sites"
2. **Widgets:**
   - Site status grid (HQ, Branch 1, Branch 2)
   - Inter-site bandwidth utilization
   - Critical devices per site
   - Recent alerts across all sites

3. **Scheduled Reports:**
   - Configure **Weekly Report** → Email to client contact
   - Include: Device inventory, alerts summary, uptime stats

### Mobile Dashboard Access

**Auvik Mobile App Configuration:**

1. Download Auvik app (iOS/Android)
2. Log in with your MSP credentials
3. Configure home screen widgets:
   - Fleet status overview
   - Critical alerts
   - Quick access to specific client sites

4. Enable push notifications:
   - Settings → Notifications
   - Enable: **Critical alerts**, **Collector offline**
   - Disable: **Informational alerts** (avoid notification fatigue)

**Mobile quick-check workflow:**
- Open app
- Glance at fleet status widget
- Tap into any offline collectors
- SSH via Tailscale (use Termius or similar) if needed

## Fleet Inventory Management

### Maintaining Collector Inventory

Keep a spreadsheet/database of all deployed collectors:

| Collector Name | Client | Site | IP Address | Switch Port | Deployment Date | Serial Number | Status |
|----------------|--------|------|------------|-------------|-----------------|---------------|--------|
| clienta-hq-collector01 | Client A | Headquarters | 10.10.1.50 | SW1-Gi1/0/24 | 2024-01-15 | ABC123 | Active |
| clienta-br1-collector01 | Client A | Branch 1 | 10.20.1.50 | SW2-Gi0/12 | 2024-01-18 | ABC124 | Active |
| clientb-main-collector01 | Client B | Main Office | 192.168.1.100 | SW-Main-24 | 2024-01-22 | ABC125 | Active |

**Update this spreadsheet:**
- After each deployment
- When collector is decommissioned
- When site details change (IP, switch port, etc.)

**Use for:**
- Warranty tracking
- Maintenance scheduling
- Capacity planning
- Asset management

### Automated Inventory Sync

**Script to export Auvik collector list:**

```python
#!/usr/bin/env python3
# Export Auvik collector inventory to CSV

import requests
import csv
from datetime import datetime

AUVIK_API_USER = "your-api-user"
AUVIK_API_KEY = "your-api-key"
AUVIK_DOMAIN = "your-domain.auvik.com"

# API request
url = f"https://{AUVIK_DOMAIN}/api/v1/inventory/device/info"
params = {
    "filter[deviceType]": "collector",
    "page[first]": 100
}
response = requests.get(
    url,
    auth=(AUVIK_API_USER, AUVIK_API_KEY),
    params=params
)

collectors = response.json()["data"]

# Export to CSV
with open(f'collector-inventory-{datetime.now().strftime("%Y%m%d")}.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Site', 'Status', 'IP', 'Last Seen'])

    for c in collectors:
        attrs = c['attributes']
        writer.writerow([
            attrs['deviceName'],
            attrs['siteName'],
            attrs['status'],
            attrs.get('ipAddresses', ['N/A'])[0],
            attrs['lastSeenTime']
        ])

print(f"Exported {len(collectors)} collectors to CSV")
```

Run weekly via cron to maintain automated inventory.

## Multi-Site Reporting

### Scheduled Reports

**Configure fleet-wide reports:**

1. Navigate to **Reports → Scheduled Reports**
2. Create **Weekly Fleet Health Report**:
   - Scope: **All Clients**
   - Sections:
     - Collector uptime summary
     - Top 10 bandwidth consumers
     - Critical alerts summary
     - Device count changes
   - Schedule: **Every Monday 8:00 AM**
   - Recipients: ops@viyu.net

3. Create **Monthly Executive Summary**:
   - Per-client device counts
   - Month-over-month changes
   - Major incidents
   - Schedule: **First of each month**
   - Recipients: management@viyu.net

### Custom Report Templates

**Per-Client Monthly Report:**
```
Client: [Client Name]
Report Period: [Month Year]

Collector Status:
- Site 1: Online, 99.8% uptime
- Site 2: Online, 100% uptime

Devices Monitored:
- Total: 87 devices
- New this month: 3 (added APs in Branch 2)
- Removed: 1 (decommissioned old switch)

Top Alerts:
1. High bandwidth usage on Site 1 firewall (3 occurrences)
2. Switch SW-3 offline for 2 hours (scheduled maintenance)

Recommendations:
- Consider upgrading internet link at Site 1
- Plan firmware update for EOL switches at Site 2
```

## Troubleshooting Fleet-Wide Issues

### Multiple Collectors Offline

**Possible causes:**
- Auvik cloud service disruption
- Widespread internet outage (rare)
- MSP account issue

**Resolution:**
1. Check Auvik status page: https://status.auvik.com
2. Verify individual collector reachability via Tailscale
3. If Auvik issue, wait for resolution and monitor
4. If internet outage, identify affected region
5. If account issue, contact Auvik support

### Discovery Issues Across Sites

**Possible causes:**
- SNMP credential change across multiple devices
- Firmware updates blocking SNMP
- Network segmentation changes

**Resolution:**
1. Identify common pattern (same vendor, same network segment)
2. Verify SNMP credentials in Auvik
3. Test SNMP from one collector: `snmpwalk -v2c -c <community> <device-ip>`
4. Update credentials or firewall rules as needed

### Dashboard Performance Degradation

**Possible causes:**
- Too many widgets on dashboard
- Complex queries on large datasets
- API rate limiting

**Resolution:**
1. Reduce widgets showing real-time data
2. Increase widget refresh intervals
3. Use saved views instead of dynamic filters
4. Split into multiple dashboards per client

### Alert Fatigue

**Symptoms:**
- Too many alerts being ignored
- Important alerts missed in noise

**Resolution:**
1. Review alert rules: **Admin → Alerts**
2. Increase thresholds on informational alerts
3. Use alert suppression during maintenance
4. Create alert groups by severity
5. Route critical-only to PagerDuty, all others to email

## Best Practices

### Daily Fleet Management Routine

**Morning Check (5 minutes):**
1. Open Fleet Health dashboard
2. Glance at collector status widget
3. Review critical alerts from overnight
4. If all green, continue with day

**Weekly Review (15 minutes):**
1. SSH into 2-3 random collectors for spot checks
2. Review week's alert trends
3. Check for devices with sustained high utilization
4. Verify all scheduled reports delivered

**Monthly Maintenance (1 hour):**
1. Review and update fleet inventory spreadsheet
2. Plan firmware updates for collectors (coordinated)
3. Review capacity: any collectors near device limits?
4. Audit Auvik user access and permissions

### Scaling Considerations

As fleet grows beyond 20 collectors:

| Challenge | Solution |
|-----------|----------|
| Manual SSH checks tedious | Script automated health checks |
| Dashboard becomes cluttered | Split into regional dashboards |
| Alert volume high | Implement alert aggregation/grouping |
| Reporting time-consuming | Use Auvik API for custom reports |
| Tailscale scale limits | Organize into Tailnets per region |

**Consider automation tools:**
- Ansible for bulk configuration management
- Custom scripts for collector health polling
- Grafana for advanced multi-source dashboards
- PagerDuty for on-call routing

### Security and Access Control

**For multi-site deployments:**

1. **Role-Based Access**
   - Create roles: Admin, Technician, Read-Only
   - Assign per client/site as needed
   - viyu.net staff: Admin across all
   - Client contacts: Read-Only for their sites

2. **API Key Management**
   - Separate API keys for production scripts vs testing
   - Rotate keys quarterly
   - Store in password manager, not code repos

3. **Collector SSH Access**
   - Restrict Tailscale ACLs to viyu.net management network
   - Use SSH keys, not passwords
   - Log all SSH sessions for audit

4. **Auvik Session Security**
   - Enforce 2FA for all viyu.net users
   - Set session timeout: 4 hours
   - Review login audit logs monthly

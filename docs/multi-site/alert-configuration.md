---
sidebar_position: 6
---

# Multi-Site Alert Configuration

Configure alerts efficiently across multiple client sites using templates, bulk deployment, and MSP-optimized escalation policies.

## Why MSP Alert Strategy Matters

Managing alerts across 10+ client sites requires a different approach than single-tenant monitoring:

| Single-Site Approach | Multi-Site MSP Approach |
|---------------------|------------------------|
| Configure each alert manually | **Use templates for consistency** |
| One notification channel | **Client-specific escalation** |
| Simple on-call rotation | **Tiered support model** |
| Ad-hoc alert tuning | **Standardized alert policies** |

A well-designed alert strategy prevents alert fatigue while ensuring critical issues reach the right team.

## Alert Configuration Philosophy

### Template-First Approach

Create standard alert templates once, deploy everywhere:

- **Collector offline** — Critical alert for all sites
- **Device offline** — Per-device-type templates
- **Performance thresholds** — Standardized across clients
- **Bandwidth alerts** — Configurable thresholds per site tier

Templates ensure consistency and reduce configuration time per site.

### Client-Specific Customization

Override templates where needed:

| Client Type | Customization Example |
|-------------|---------------------|
| 24/7 Operations | Lower alert thresholds, immediate escalation |
| Business Hours Only | Suppress alerts outside 8am-6pm local time |
| High-Value Client | Direct escalation to senior engineers |
| Budget-Conscious | Fewer alert types, email-only notifications |

Balance standardization with client needs.

### Scalable Escalation

Structure escalation to handle increasing alert volume:

1. **Tier 1** — Automated triage and common issues
2. **Tier 2** — NOC technicians for standard response
3. **Tier 3** — Senior engineers for complex problems
4. **Vendor escalation** — ISP, hardware vendor, Auvik support

Clear escalation paths prevent bottlenecks as deployment scales.

## Creating Alert Templates

### Standard Collector Alert Template

Create the baseline template all sites inherit:

#### 1. Create Template Alert Rule

1. **Admin → Alerts → Alert Rules → Create Rule**
2. Name: `[TEMPLATE] Collector Offline - Standard`
3. Configure baseline settings:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Alert Type | Collector Offline | Core monitoring metric |
| Severity | Critical | Collector down = blind to network |
| Trigger After | 5 minutes | Balance responsiveness vs. noise |
| Auto-close | Yes | Reduce manual cleanup |
| Description | `Collector {{collector_name}} at {{client_name}} offline` | Context in alert |

#### 2. Set Default Notification Channels

Configure multi-channel notifications:

| Priority | Channel | Configuration |
|----------|---------|---------------|
| Primary | Email | `noc@yourcompany.com` |
| Secondary | Slack | `#auvik-alerts` channel |
| Escalation | PagerDuty | After 15 minutes unacknowledged |

#### 3. Tag as Template

- Add tag: `alert-template`
- Add tag: `collector-monitoring`
- Add tag: `multi-site-standard`

Tags enable bulk operations and filtering.

### Device Offline Templates

Create per-device-type templates:

#### Critical Infrastructure Template

**Template:** `[TEMPLATE] Critical Device Offline`

| Setting | Value |
|---------|-------|
| Device Types | Firewall, Core Switch, Primary Router |
| Severity | Critical |
| Trigger After | 3 minutes |
| Escalation | Immediate PagerDuty |

#### Standard Infrastructure Template

**Template:** `[TEMPLATE] Standard Device Offline`

| Setting | Value |
|---------|-------|
| Device Types | Access Switches, Access Points |
| Severity | Warning |
| Trigger After | 10 minutes |
| Escalation | Email only, escalate after 1 hour |

#### Non-Critical Device Template

**Template:** `[TEMPLATE] Non-Critical Device Offline`

| Setting | Value |
|---------|-------|
| Device Types | IP Phones, Printers, Cameras |
| Severity | Info |
| Trigger After | 30 minutes |
| Escalation | Daily digest email |

### Performance Alert Templates

#### Bandwidth Threshold Template

**Template:** `[TEMPLATE] High Bandwidth Utilization`

| Setting | Small Site | Medium Site | Large Site |
|---------|-----------|-------------|-----------|
| Threshold | >80% of 100 Mbps | >80% of 500 Mbps | >80% of 1 Gbps |
| Trigger After | 15 minutes sustained | 15 minutes | 10 minutes |
| Severity | Warning | Warning | Critical |

Create variants for different site tiers.

#### High Latency Template

**Template:** `[TEMPLATE] Network Latency Alert`

| Setting | Value |
|---------|-------|
| Threshold | >100ms average latency |
| Trigger After | 5 minutes |
| Severity | Warning |
| Scope | WAN connections only |

## Bulk Alert Deployment

### Method 1: Site-Level Application

Deploy template to all collectors at a site:

#### Using Auvik Portal

1. **Admin → Alerts → Alert Rules**
2. Select template rule
3. Click **Apply to Sites**
4. Multi-select target sites:
   - Filter by client
   - Filter by collector tag
   - Filter by geographic region
5. Click **Apply**

All collectors at selected sites inherit the alert rule.

#### Verification

1. Navigate to **Alerts → Active Rules**
2. Filter by site
3. Confirm template applied
4. Verify notification channels correct

### Method 2: Tag-Based Deployment

Use tags for dynamic alert assignment:

#### Tagging Strategy

| Tag | Purpose |
|-----|---------|
| `priority-tier1` | High-value clients, aggressive alerting |
| `priority-tier2` | Standard clients, balanced alerting |
| `priority-tier3` | Budget clients, minimal alerting |
| `region-west` | Pacific/Mountain time zones |
| `region-central` | Central time zone |
| `region-east` | Eastern time zone |

#### Apply Alerts by Tag

1. **Admin → Alerts → Alert Rules**
2. Select alert template
3. **Scope → Tag-Based**
4. Add tag filter: `priority-tier1`
5. Save rule

All current and future devices with that tag inherit alert.

### Method 3: API-Based Bulk Deployment

For large-scale deployments (50+ sites):

#### Preparation

1. Export site list to CSV
2. Map site to alert template
3. Prepare Auvik API credentials

#### Script Example (Conceptual)

```bash
#!/bin/bash
# Bulk apply alert template to sites

AUVIK_API_KEY="your-api-key"
TEMPLATE_ID="template-alert-id"

while IFS=, read -r site_id site_name template
do
  curl -X POST "https://api.auvik.com/v1/alertRules/$TEMPLATE_ID/apply" \
    -H "Authorization: Bearer $AUVIK_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"siteId\": \"$site_id\"}"

  echo "Applied template to $site_name"
  sleep 1  # Rate limiting
done < sites.csv
```

**Note:** Consult Auvik API documentation for current endpoints and authentication.

### Method 4: Multi-Tenant Alert Configuration

For MSPs managing multiple client tenants:

1. **Admin → Multi-Tenant Settings**
2. Create **Master Alert Policy**
3. Select clients to inherit policy
4. Enable **Auto-apply to new sites**

New sites automatically receive standard alert configuration.

## MSP Escalation Policies

### Tiered Support Model

Structure escalation to scale with team size:

#### Tier 1: Automated Response

| Alert Type | Automated Action |
|-----------|------------------|
| Collector offline | Auto-create ticket, check Tailscale |
| Device reboot | Log event, monitor for pattern |
| Brief outage (&lt;5 min) | Log only, no ticket |

Automation handles routine events.

#### Tier 2: NOC Technicians

**Escalation Trigger:**
- Critical alert open >15 minutes
- Warning alert open >1 hour
- Client-reported issue

**Response SLA:**
| Priority | Response Time | Resolution Target |
|----------|--------------|-------------------|
| Critical | 15 minutes | 4 hours |
| Warning | 1 hour | Next business day |
| Info | Next business day | 3 business days |

#### Tier 3: Senior Engineers

**Escalation Trigger:**
- Tier 2 unable to resolve within SLA
- Multi-site outage (3+ sites)
- Client VIP status
- Complex troubleshooting required

**Response SLA:**
| Scenario | Response Time |
|----------|--------------|
| Critical escalation | 30 minutes |
| Multi-site issue | Immediate |
| VIP client | 15 minutes |

### Client-Specific Escalation

#### Configuration by Client Tier

**Platinum Clients:**
- Direct escalation to senior engineer
- 24/7 on-call paging
- 15-minute response SLA
- Dedicated Slack channel

**Gold Clients:**
- Standard NOC escalation
- Business hours priority
- 1-hour response SLA
- Shared alert channel

**Silver/Bronze Clients:**
- Automated triage first
- Email-only alerts
- Next business day response
- Batch ticket processing

#### Setting Up Client Tiers in Auvik

1. **Admin → Sites → Site Settings**
2. Add custom field: `Client Tier`
3. Set value: `Platinum`, `Gold`, `Silver`, `Bronze`
4. Use in alert scoping:
   - Create separate alert rules per tier
   - Configure notification channels by tier
   - Set different thresholds/SLAs

### PagerDuty Integration for Escalation

#### Setup Multi-Tier Escalation

1. **PagerDuty → Services → Create Service**
   - Name: `Auvik Collectors - Tier 2`
   - Escalation Policy: `NOC → Senior Engineers`

2. **Configure Escalation Policy:**
   - Level 1: NOC team (notify immediately)
   - Level 2: If unack after 15 min → Senior engineer
   - Level 3: If unack after 30 min → Director on-call

3. **Auvik Integration:**
   - **Admin → Integrations → PagerDuty**
   - Map Critical alerts → PagerDuty Service
   - Map Warning alerts → Email/Slack only

### Time-Based Escalation

Route alerts based on time of day:

| Time Window | Escalation Path |
|-------------|----------------|
| Business hours (8am-6pm) | Email → Slack → NOC |
| After hours (6pm-10pm) | PagerDuty → On-call tech |
| Overnight (10pm-8am) | PagerDuty → Senior on-call only |
| Weekends | PagerDuty → Weekend rotation |

Configure in Auvik using schedule-based notification rules.

### Geographic Escalation

For multi-region MSPs:

| Site Region | Primary NOC | Backup NOC |
|-------------|-------------|------------|
| US West | Seattle team | Denver team |
| US Central | Dallas team | Chicago team |
| US East | New York team | Atlanta team |

**Configuration:**
1. Tag sites by region
2. Create region-specific alert rules
3. Route to appropriate NOC team
4. Backup escalation to adjacent region

## Alert Threshold Standardization

### Per-Client Tuning Process

Prevent alert fatigue through systematic tuning:

#### Week 1: Baseline Collection

- Deploy with conservative (sensitive) thresholds
- Collect all alerts for 7 days
- Do not adjust during baseline period

#### Week 2: Analysis

- Review alert frequency by type
- Identify false positives
- Document legitimate vs. noise alerts

#### Week 3: Tuning

| Alert Type | Too Many Alerts | Action |
|-----------|----------------|--------|
| Device offline | Access points flapping | Increase trigger time 5→15 min |
| High bandwidth | Daily backup window | Suppress alerts 2am-4am |
| Latency spikes | WAN circuit variance | Increase threshold or add dampening |

#### Week 4: Validation

- Monitor adjusted alert volume
- Confirm no missed critical issues
- Document final thresholds as client standard

### Standardized Threshold Library

Maintain documented thresholds by client type:

**Healthcare Clients:**
```
Collector Offline: 3 minutes (strict uptime requirement)
Device Offline: 5 minutes (critical systems)
Bandwidth: >70% (capacity planning)
```

**Small Business:**
```
Collector Offline: 10 minutes (tolerate brief outages)
Device Offline: 15 minutes (reduce noise)
Bandwidth: >90% (alert only on near-saturation)
```

**Retail/POS:**
```
Collector Offline: 5 minutes (business impact)
Device Offline: Critical devices 3 min, others 30 min
Bandwidth: >85% (transaction processing)
```

Apply appropriate template based on client industry.

## Alert Notification Best Practices

### Multi-Channel Strategy

Don't rely on single notification channel:

| Channel | Purpose | Latency |
|---------|---------|---------|
| PagerDuty | Critical, requires immediate response | Real-time |
| Slack | Team awareness, collaboration | Real-time |
| Email | Record keeping, less urgent | 1-5 minutes |
| Webhook | Custom integrations, ticketing | Real-time |

Configure redundancy for critical alerts.

### Alert Message Templates

Include actionable context in alerts:

**Good Alert Message:**
```
🔴 CRITICAL: Collector offline at ABC Corp HQ
Site: ABC Corp - Headquarters
Collector: abccorp-hq-collector01
Duration: 8 minutes
Last Seen: 2024-02-03 14:23 EST
Tailscale: Offline (https://login.tailscale.com/admin/machines)
Runbook: https://docs.yourcompany.com/runbooks/collector-offline
```

**Poor Alert Message:**
```
Alert: Collector offline
```

Provide enough context for immediate triage.

### Alert Suppression Windows

Prevent noise during maintenance:

#### Scheduled Maintenance

1. **Admin → Alerts → Suppression Windows**
2. Create window:
   - Start: Maintenance start time
   - End: Maintenance end time + 1 hour buffer
   - Scope: Specific site or collector
   - Suppress: All alerts or specific types

#### Bulk Suppression for Multi-Site Maintenance

When updating firmware across 20 sites:

1. Create CSV with site IDs and maintenance windows
2. Use API to create suppression windows
3. Verify suppressions active before maintenance
4. Auto-expire after completion

Prevents alert storm during planned changes.

## Testing Alert Configuration

### Pre-Deployment Testing

Before rolling out to production:

#### 1. Create Test Site

- Single test collector
- Apply alert templates
- Verify all notification channels

#### 2. Trigger Test Alerts

```bash
# SSH to test collector
ssh testcollector

# Stop Auvik service to trigger offline alert
sudo systemctl stop auvik-collector

# Wait for alert (per configured threshold)
# Verify received via all channels

# Restart service
sudo systemctl start auvik-collector

# Verify alert auto-closes
```

#### 3. Validate Escalation

- Wait for escalation timer
- Confirm escalates to next tier
- Verify PagerDuty integration
- Test acknowledgment workflow

#### 4. Check Alert Context

Confirm alert includes:
- [ ] Collector/device name
- [ ] Client/site identification
- [ ] Duration of outage
- [ ] Link to Auvik portal
- [ ] Runbook reference (if applicable)

### Post-Deployment Validation

After bulk deployment to sites:

1. **Sample site check** — Verify 10% of sites have alerts active
2. **Notification test** — Ensure alerts reach correct channels
3. **Escalation verification** — Confirm tiered escalation working
4. **Alert volume monitoring** — Track alert frequency, tune as needed

## Troubleshooting Multi-Site Alerts

### Alert Not Firing

**Symptom:** Collector offline but no alert received

**Troubleshooting:**
1. Verify alert rule applied to site
   - Check **Admin → Alerts → Active Rules**
   - Filter by site, confirm rule listed
2. Check rule is enabled (not disabled)
3. Verify suppression window not active
4. Check notification channel configuration
5. Test with manual service stop

### Too Many Alerts

**Symptom:** Alert fatigue, high false-positive rate

**Resolution:**
1. Review alert frequency by type
2. Increase trigger thresholds or duration
3. Add time-based suppression (e.g., overnight)
4. Filter out non-critical device types
5. Use digest emails instead of real-time for low-severity

### Alerts to Wrong Team

**Symptom:** Escalation going to incorrect NOC team or tier

**Resolution:**
1. Review tag assignments on sites
2. Verify alert rule scoping (tag-based vs. site-based)
3. Check PagerDuty service mapping
4. Update escalation policy in Auvik
5. Confirm client tier correctly set

### Missing Alert Context

**Symptom:** Alerts lack sufficient information for triage

**Resolution:**
1. Update alert message template
2. Include variables: `{{collector_name}}`, `{{client_name}}`, `{{site_name}}`
3. Add runbook links in alert description
4. Ensure naming conventions followed (for easy identification)

### Delayed Alerts

**Symptom:** Alerts arrive significantly after event

**Possible Causes:**
- Email server delays
- Slack API rate limiting
- PagerDuty integration issue
- Auvik platform latency

**Resolution:**
1. Test alert latency with manual triggers
2. Check integration status in Auvik
3. Verify notification service (Slack, PagerDuty) operational
4. Consider redundant notification channels

## Alert Metrics and Reporting

Track alert effectiveness across multi-site deployment:

### Key Metrics

| Metric | Target | Purpose |
|--------|--------|---------|
| Mean Time to Detect (MTTD) | &lt;5 minutes | Alert triggers promptly |
| Mean Time to Acknowledge (MTTA) | &lt;15 minutes | Team responsive |
| Mean Time to Resolve (MTTR) | &lt;4 hours (critical) | Efficient resolution |
| False Positive Rate | &lt;10% | Alert quality |
| Alert Volume | &lt;5 per site per day | Avoid fatigue |

### Monthly Alert Review

Schedule monthly review of alert data:

1. **Export alert history** from Auvik
2. **Categorize alerts:**
   - True positives (legitimate issues)
   - False positives (noise)
   - Escalations required
   - Auto-resolved
3. **Identify tuning opportunities**
4. **Update templates** based on trends
5. **Share findings** with team

### Client-Specific Reporting

Provide clients with alert summary:

- Total alerts per month
- Critical vs. warning vs. info
- Mean time to resolution
- Top alerting devices
- Proactive actions taken

Demonstrates value of monitoring service.

## Scaling Alert Management

### When You Reach 50+ Sites

Alert management becomes complex at scale:

#### Automation Requirements

- **Auto-tuning** — Use ML/statistics to adjust thresholds
- **Anomaly detection** — Alert on unusual patterns, not just thresholds
- **Alert correlation** — Group related alerts (single root cause)
- **Automated remediation** — Auto-restart services, open tickets

#### Tooling Considerations

| Challenge | Solution |
|-----------|----------|
| Alert volume overwhelming | Event correlation platform (e.g., BigPanda) |
| Complex escalation | Dedicated on-call platform (PagerDuty, Opsgenie) |
| Alert tuning effort | Automated threshold learning |
| Reporting overhead | Centralized dashboards (Grafana, Datadog) |

#### Team Structure

- **Alert platform admin** — Manages templates, policies
- **Regional NOC leads** — Tune thresholds per region
- **Client success team** — Review alert reports with clients
- **Automation engineer** — Build alert integrations

### Template Versioning

As you refine templates over time:

1. **Version templates** — `[TEMPLATE] Collector Offline - v2`
2. **Document changes** — Change log for template updates
3. **Staged rollout** — Test on pilot sites before bulk deployment
4. **Deprecation plan** — Migrate sites from v1 → v2
5. **Audit compliance** — Ensure all sites on current templates

## Next Steps

1. **Start with templates** → Create 3-5 core alert templates
2. **Pilot deployment** → Apply to 5-10 test sites
3. **Tune and validate** → Adjust based on alert volume
4. **Bulk rollout** → Deploy to all sites
5. **Monitor and optimize** → Ongoing threshold tuning

## Related Documentation

- [Auvik Offline Alerts](/docs/remote-access/auvik-alerts) — Single-site alert configuration
- [Fleet Management](/docs/multi-site/fleet-management) — Managing collectors at scale
- [Naming Conventions](/docs/multi-site/naming-conventions) — Consistent naming for easy identification
- [Troubleshooting](/docs/troubleshooting/common-issues) — Resolving common alert issues

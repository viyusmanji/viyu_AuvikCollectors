---
sidebar_position: 5
---

# Complex Network Scenarios

Enterprise and security-conscious networks require specialized collector placement, routing, and credential management. This guide covers advanced deployment scenarios.

## Scenario 1: Multi-VLAN Segmented Networks

### Challenge

Client has strict VLAN segmentation with limited inter-VLAN routing:
- Management VLAN (infrastructure only)
- Server VLAN (Windows/Linux servers)
- IoT/OT VLAN (network devices, cameras, sensors)
- Guest/DMZ VLAN (isolated from internal)

### Solution: Strategic Collector Placement

Place the collector on the **management VLAN** with selective firewall rules:

```
┌──────────────────────────────────────────────────────────┐
│                   Core Firewall/Router                    │
│                                                           │
│  VLAN 10 - Management (10.10.10.0/24)                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [Pi Collector]     [Switches]     [Firewall Mgmt] │  │
│  │    10.10.10.50      10.10.10.x     10.10.10.1      │  │
│  └────────────────────────────────────────────────────┘  │
│                         ▲                                 │
│                         │ Firewall Rules                  │
│         ┌───────────────┼───────────────┐                 │
│         │               │               │                 │
│  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐         │
│  │ VLAN 20     │ │ VLAN 30     │ │ VLAN 40     │         │
│  │ Servers     │ │ IoT/OT      │ │ Guest/DMZ   │         │
│  │ 10.10.20./24│ │ 10.10.30./24│ │ 10.10.40./24│         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Required Firewall Rules

Create explicit rules allowing collector access to each segment:

**From Management VLAN (10.10.10.50) to Server VLAN:**

| Source | Destination | Protocol | Port | Purpose |
|--------|-------------|----------|------|---------|
| 10.10.10.50 | 10.10.20.0/24 | UDP | 161 | SNMP |
| 10.10.10.50 | 10.10.20.0/24 | TCP | 135, 445 | WMI (Windows) |
| 10.10.10.50 | 10.10.20.0/24 | TCP | 22 | SSH (Linux) |
| 10.10.10.50 | 10.10.20.0/24 | ICMP | — | Ping monitoring |

**From Management VLAN to IoT/OT VLAN:**

| Source | Destination | Protocol | Port | Purpose |
|--------|-------------|----------|------|---------|
| 10.10.10.50 | 10.10.30.0/24 | UDP | 161 | SNMP (sensors, cameras) |
| 10.10.10.50 | 10.10.30.0/24 | ICMP | — | Ping monitoring |

:::tip Security Recommendation
**Do not** monitor the Guest/DMZ VLAN from the collector. Guest networks should remain isolated. Monitor DMZ infrastructure devices (firewall, edge router) via their management interfaces on the management VLAN instead.
:::

### Testing Segmented Access

From the Pi collector:

```bash
# Test SNMP to each VLAN
snmpwalk -v2c -c viyu-readonly 10.10.20.5 sysDescr  # Server VLAN
snmpwalk -v2c -c viyu-readonly 10.10.30.10 sysDescr # IoT VLAN

# Verify routing and latency
traceroute 10.10.20.5
ping -c 4 10.10.30.10

# Check if WMI ports are reachable (Windows)
nc -zv 10.10.20.5 135
nc -zv 10.10.20.5 445
```

### Common Issues

**Issue:** Collector discovers devices on management VLAN only

**Cause:** Firewall blocking SNMP/ICMP to other VLANs

**Resolution:**
1. Verify firewall rules are in place and active
2. Check rule order — deny rules may precede allow rules
3. Test with `tcpdump` on collector to see if packets are being sent:
   ```bash
   sudo tcpdump -i eth0 host 10.10.20.5 and port 161
   ```
4. Check device logs on firewall for blocked traffic

---

## Scenario 2: Router-on-a-Stick (Single-NIC Inter-VLAN Routing)

### Challenge

Small sites use a single router/firewall with one physical interface handling multiple VLANs via subinterfaces (802.1Q trunking). This router-on-a-stick configuration is common in small to medium deployments where cost and simplicity are priorities.

### Architecture Example

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │  pfSense/Router │
              │   (em0 trunk)   │
              └────────┬────────┘
                       │ 802.1Q Trunk
                       │ (VLANs 10, 20, 30)
                       ▼
              ┌────────────────┐
              │  Managed Switch │
              │                │
         ┌────┼────┬────┬──────┼─────┐
         │    │    │    │      │     │
       VLAN  VLAN VLAN VLAN   VLAN  VLAN
        10    10   20   20     30    30
         │    │    │    │      │     │
     [Collector] [Switch] [Server] [AP]
```

### Configuration Requirements

**On the Managed Switch:**

Ensure the uplink to the router is configured as a **trunk port** carrying all VLANs:

#### Cisco IOS

```
interface GigabitEthernet0/1
 description Trunk to Router
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30
```

#### Ubiquiti UniFi

In UniFi Controller:
- Select the uplink port
- Set as "Trunk"
- Add allowed VLANs: 10, 20, 30

**On the Router (pfSense Example):**

Create VLAN interfaces and assign IPs:

1. **Interfaces → Assignments → VLANs**
   - VLAN 10 on em0 → Management (10.10.10.1/24)
   - VLAN 20 on em0 → Servers (10.10.20.1/24)
   - VLAN 30 on em0 → IoT (10.10.30.1/24)

2. **Firewall → Rules**
   - Allow SNMP from Management_VLAN to other VLANs
   - Allow ICMP from Management_VLAN to other VLANs

### Collector Placement

Place the collector on **VLAN 10 (Management)**, connected to an access port on the switch.

**Switch port config (Cisco IOS):**
```
interface GigabitEthernet0/5
 description Pi Collector
 switchport mode access
 switchport access vlan 10
```

**Switch port config (UniFi):**
- Port Profile: Management
- VLAN: 10
- Native VLAN only

### Verification

From the collector, verify inter-VLAN routing:

```bash
# Ping the router gateway on each VLAN
ping 10.10.10.1  # Management gateway
ping 10.10.20.1  # Server gateway
ping 10.10.30.1  # IoT gateway

# Verify routing table
ip route show

# Expected default route via management gateway
# default via 10.10.10.1 dev eth0
```

---

## Scenario 3: DMZ Collector Deployment

### Challenge

Client requires monitoring of DMZ-hosted services (web servers, email gateways) but security policy prohibits DMZ-to-internal traffic.

### Solution: Dual Collector Setup

Deploy **two collectors**:

1. **Internal Collector** (Management VLAN) — Monitors internal infrastructure
2. **DMZ Collector** (DMZ VLAN) — Monitors DMZ devices only

```
                        Internet
                           │
                           ▼
                   ┌───────────────┐
                   │   Firewall    │
                   └───┬───────┬───┘
                       │       │
            ┌──────────┘       └──────────┐
            │                             │
      ┌─────▼──────┐              ┌───────▼─────┐
      │    DMZ     │              │   Internal  │
      │  VLAN 99   │              │  VLANs      │
      │            │              │             │
      │ [Collector]│              │ [Collector] │
      │ [Web Srv]  │              │ [Switches]  │
      │ [Mail Gw]  │              │ [Servers]   │
      └────────────┘              └─────────────┘
```

### DMZ Collector Configuration

**Firewall Rules:**

| Source | Destination | Protocol | Port | Purpose |
|--------|-------------|----------|------|---------|
| DMZ Collector | DMZ devices | UDP | 161 | SNMP |
| DMZ Collector | DMZ devices | ICMP | — | Ping |
| DMZ Collector | Auvik Cloud | TCP | 443 | Data upload |
| DMZ Collector | Internal | ANY | ANY | **DENY** |

**Auvik Multi-Site Setup:**

1. In Auvik, create **two sites** for this client:
   - Site 1: `ClientName-Internal`
   - Site 2: `ClientName-DMZ`
2. Add internal collector to Site 1
3. Add DMZ collector to Site 2
4. Configure separate credentials if needed

:::tip Alternative: Firewall Exception
If dual collectors are not feasible, create a **limited exception** allowing the internal collector to reach the DMZ:
- Allow only SNMP (UDP 161) and ICMP
- Use a dedicated service account with read-only SNMP
- Log all connections for audit purposes
:::

---

## Scenario 4: SNMPv3 Strict Security Networks

### Challenge

Client security policy mandates encrypted monitoring traffic (no SNMPv2c). Enterprise environments often require:
- **Compliance** — HIPAA, PCI-DSS, SOC 2 mandate encrypted management protocols
- **Zero Trust** — Eliminate plaintext credentials traversing the network
- **Audit Trails** — Per-user authentication for accountability
- **Defense in Depth** — Encrypted monitoring traffic prevents credential sniffing

### Solution: SNMPv3 with authPriv

See the [SNMP Configuration](./snmp-configuration.md#snmpv3-configuration) guide for detailed setup. This section focuses on **enterprise-scale deployment patterns**.

:::tip Why authPriv?
SNMPv3 has three security levels. For enterprise deployments, **only authPriv should be used**:

- **noAuthNoPriv** — No authentication, no encryption (equivalent to SNMPv2c)
- **authNoPriv** — Authenticates sender but data travels in plaintext
- **authPriv** — ✅ Authenticates sender AND encrypts all data (recommended)
:::

### Multi-Vendor SNMPv3 Deployment

When dealing with mixed vendor environments, configure SNMPv3 consistently across all devices:

**Enterprise Standard Configuration Template:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Security Level | authPriv | Mandatory for compliance |
| Auth Protocol | SHA-256 (preferred), SHA | Avoid MD5 (deprecated) |
| Privacy Protocol | AES-256 (preferred), AES-128 | Avoid DES (insecure) |
| Username | `viyumonitor` | Consistent across all devices |
| Auth Password | 16+ characters, mixed case/numbers/symbols | Rotate quarterly |
| Privacy Password | 16+ characters, different from auth password | Rotate quarterly |

### Per-Vendor Configuration

#### Cisco IOS/IOS-XE

```
snmp-server group VIYUGROUP v3 priv
snmp-server user viyumonitor VIYUGROUP v3 auth sha AuthPass123! priv aes 128 PrivPass456!
snmp-server host 10.10.10.50 version 3 priv viyumonitor
```

#### Cisco Meraki

Dashboard → Network-wide → General → Reporting:
- SNMP version: V3
- Auth: SHA
- Encryption: AES-128
- User: `viyumonitor`

#### Juniper JunOS

```
set snmp v3 usm local-engine user viyumonitor authentication-sha authentication-password AuthPass123!
set snmp v3 usm local-engine user viyumonitor privacy-aes128 privacy-password PrivPass456!
set snmp v3 vacm security-to-group security-model usm security-name viyumonitor group VIYUGROUP
set snmp v3 vacm access group VIYUGROUP default-context-prefix security-model usm security-level privacy read-view ALL
```

#### FortiGate

```
config system snmp user
    edit "viyumonitor"
        set security-level auth-priv
        set auth-proto sha
        set auth-pwd AuthPass123!
        set priv-proto aes
        set priv-pwd PrivPass456!
    next
end
```

### Testing SNMPv3

From the collector:

```bash
# Test with full credentials
snmpwalk -v3 -l authPriv -u viyumonitor \
  -a SHA -A AuthPass123! \
  -x AES -X PrivPass456! \
  10.10.10.1 sysDescr

# Expected output
SNMPv2-MIB::sysDescr.0 = STRING: Cisco IOS Software...
```

### Troubleshooting SNMPv3

| Error Message | Cause | Resolution |
|---------------|-------|------------|
| Timeout (no response) | Wrong username or device doesn't support v3 | Verify user exists on device, check v3 support |
| Authentication failure | Wrong auth password or protocol mismatch | Verify auth password and protocol (SHA vs MD5) |
| Decryption error | Wrong privacy password or protocol | Verify privacy password and protocol (AES vs DES) |
| Unknown user name | User not configured on device | Create SNMPv3 user on device |

### Enterprise Credential Management at Scale

Deploying SNMPv3 across hundreds of devices requires a systematic approach:

#### Standardized Credential Strategy

**Option 1: Single Service Account (Simpler)**

Use one SNMPv3 credential across all devices:
- **Pros:** Easy to deploy, single credential in Auvik
- **Cons:** Password rotation requires updating all devices
- **Best for:** Small to medium enterprises (<200 devices)

**Option 2: Role-Based Accounts (More Secure)**

Create different SNMPv3 users per device role:
- `viyu-switch` — All switches
- `viyu-router` — All routers
- `viyu-firewall` — All firewalls
- `viyu-wireless` — All access points

**Pros:** Credential compromise is limited to device type
**Cons:** More complex to manage
**Best for:** Large enterprises (200+ devices) or high-security environments

#### Credential Deployment Workflow

1. **Document** — Create a credential inventory spreadsheet:
   - Device hostname
   - IP address
   - Vendor/model
   - SNMPv3 username
   - Last password rotation date

2. **Automate** — Use configuration management for bulk deployment:
   - Ansible playbooks
   - Cisco Prime Infrastructure
   - SolarWinds NCM
   - Custom scripts via SSH/API

3. **Validate** — Test each device after configuration:
   ```bash
   # Create a test script
   #!/bin/bash
   for ip in $(cat device-ips.txt); do
     echo "Testing $ip..."
     snmpwalk -v3 -l authPriv -u viyumonitor \
       -a SHA -A "$AUTH_PASS" \
       -x AES -X "$PRIV_PASS" \
       $ip sysDescr
   done
   ```

4. **Store Securely** — Use a password manager or secrets vault:
   - 1Password
   - LastPass Enterprise
   - HashiCorp Vault
   - Azure Key Vault

#### Password Rotation Strategy

Enterprise security policies often require quarterly or annual password rotation.

**Rotation Workflow:**

1. **Schedule Maintenance Window** — Coordinate with client
2. **Generate New Passwords** — Use strong password generator
3. **Update Devices** — Use automation to push new credentials
   - For Cisco: `snmp-server user viyumonitor VIYUGROUP v3 auth sha <NEW_AUTH> priv aes 128 <NEW_PRIV>`
4. **Update Auvik** — Change credentials in Auvik credential store
5. **Verify** — Test discovery on subset of devices
6. **Document** — Update credential inventory with rotation date

:::warning Password Rotation Pitfall
**Do not** delete the old SNMPv3 user before verifying the new one works in Auvik. Always create the new user alongside the old one, test, then remove the old user after confirmation.
:::

### Compliance and Audit Requirements

Many regulated industries require specific SNMPv3 configurations:

#### PCI-DSS Requirements

For networks handling credit card data:
- ✅ authPriv security level (required)
- ✅ AES encryption (required)
- ✅ Strong passwords (12+ characters, complexity requirements)
- ✅ Quarterly password rotation (recommended)
- ✅ Audit logging of SNMP access (if device supports)

#### HIPAA Compliance

For healthcare networks:
- ✅ Encrypted management protocols (SNMPv3 authPriv)
- ✅ Unique user accounts (avoid shared credentials if possible)
- ✅ Access logs retained for 6+ years
- ✅ Document who has access to SNMP credentials

#### SOC 2 Type II

Service providers and SaaS companies:
- ✅ Strong authentication (authPriv)
- ✅ Regular password rotation (quarterly minimum)
- ✅ Credential access audit trail (who configured, when)
- ✅ Segregation of duties (different credentials per admin if possible)

**Documentation Template for Auditors:**

Create a document that includes:
```
SNMP Monitoring Access Control

System: [Client Name] Network Infrastructure
Protocol: SNMPv3 with authPriv
Encryption: AES-256
Authentication: SHA-256

Authorized Users:
- viyumonitor (service account) - read-only access

Access Restrictions:
- Source IP: 10.10.10.50 (Auvik Collector)
- Destination: Management interfaces only
- Firewall: ACL permits collector IP only

Last Password Rotation: [Date]
Next Scheduled Rotation: [Date]
Password Complexity: 16+ characters, mixed case, numbers, symbols
```

### Enterprise-Scale Testing

When deploying SNMPv3 across large networks, use these testing strategies:

#### Pre-Deployment Testing

Test a **pilot group** of devices first:
- 1-2 devices per vendor type
- Verify SNMPv3 configuration works
- Confirm Auvik discovers correctly
- Document any vendor-specific quirks

#### Bulk Verification Script

After deploying SNMPv3 to all devices, validate with automation:

```bash
#!/bin/bash
# snmpv3-validation.sh

# Load credentials from environment variables
AUTH_PASS="${SNMPV3_AUTH_PASS}"
PRIV_PASS="${SNMPV3_PRIV_PASS}"

# Read device list
while IFS=',' read -r hostname ip; do
  echo -n "Testing $hostname ($ip)... "

  result=$(timeout 5 snmpget -v3 -l authPriv -u viyumonitor \
    -a SHA -A "$AUTH_PASS" \
    -x AES -X "$PRIV_PASS" \
    "$ip" sysName.0 2>&1)

  if [[ $? -eq 0 ]]; then
    echo "✅ SUCCESS"
  else
    echo "❌ FAILED - $result"
    echo "$hostname,$ip,FAILED" >> failed-devices.txt
  fi
done < devices.csv

echo ""
echo "Validation complete. Check failed-devices.txt for issues."
```

**devices.csv format:**
```
hostname,ip
core-switch-01,10.10.10.1
edge-router-01,10.10.10.2
firewall-01,10.10.10.3
```

#### Common Enterprise Deployment Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| Works on some devices, not others | Mixed vendor SNMPv3 implementations | Check vendor documentation for exact syntax (SHA vs SHA1, AES vs AES128) |
| Authentication works but no data | SNMPv3 view/group permissions wrong | Verify VACM (View-based Access Control Model) grants read access |
| Timeout on all devices | Firewall blocking SNMPv3 | SNMPv3 still uses UDP 161 — verify firewall rules |
| "Unknown engine ID" error | SNMP engine not initialized | Some devices require SNMP to be enabled before SNMPv3 users can be created |
| Credentials work in snmpwalk but not Auvik | Typo in Auvik credential entry | Re-enter credentials carefully, watch for trailing spaces |

### Integration with Network Access Control (NAC)

Some enterprises integrate SNMPv3 with centralized authentication systems:

#### RADIUS/TACACS+ Integration

Certain enterprise devices support authenticating SNMPv3 users via RADIUS or TACACS+:

**Cisco IOS Example (RADIUS-based SNMPv3):**
```
aaa new-model
aaa group server radius SNMPRADIUS
 server name RADIUS-SERVER-1

snmp-server group VIYUGROUP v3 priv
snmp-server user viyumonitor VIYUGROUP remote 10.10.10.50
```

**Benefits:**
- Centralized credential management
- Integration with existing AAA infrastructure
- Automatic password expiration enforcement

**Drawbacks:**
- More complex setup
- RADIUS/TACACS server becomes a dependency
- Not all device vendors support it

:::caution Enterprise Reality Check
While RADIUS/TACACS+ integration is ideal in theory, **most Viyu deployments use local SNMPv3 accounts** due to:
- Client AAA servers not configured for SNMP
- Complexity of per-device AAA integration
- Service account model (one credential for monitoring)

Reserve AAA integration for clients with existing robust AAA infrastructure and strong requirements.
:::

---

## Scenario 5: Multi-Site WAN with MPLS or VPN

### Challenge

Client has multiple locations connected via MPLS or site-to-site VPN. Decide whether to deploy one collector per site or centralize.

### Decision Matrix

| Factor | Centralized (Single Collector) | Distributed (Per-Site Collectors) |
|--------|-------------------------------|----------------------------------|
| **WAN Bandwidth** | Requires stable, low-latency WAN | Minimal WAN usage (only Auvik cloud sync) |
| **Device Count** | Works if total devices <500 | Scales better for large multi-site |
| **WAN Reliability** | If WAN fails, remote sites lose monitoring | Each site independent |
| **Management** | Simpler (one collector) | More complex (multiple collectors) |
| **Cost** | Lower (one Pi) | Higher (Pi per site) |

### Recommended Approach

**Small sites (<50 devices/site), reliable WAN:**
- Deploy **one collector at headquarters**
- Configure routing to allow collector access to all sites

**Large sites (>50 devices/site), or unreliable WAN:**
- Deploy **one collector per site**
- Configure as separate Auvik sites or use multi-collector setup

### Configuration: Centralized Collector

**Headquarters Firewall/Router:**

Ensure routing and firewall rules allow HQ collector to reach remote sites:

```
Site A: 10.10.0.0/16 (HQ)
Site B: 10.20.0.0/16 (Remote 1)
Site C: 10.30.0.0/16 (Remote 2)

Collector: 10.10.10.50 (HQ Management VLAN)
```

**Firewall Rules (from HQ to Remote Sites):**

| Source | Destination | Protocol | Port |
|--------|-------------|----------|------|
| 10.10.10.50 | 10.20.0.0/16 | UDP | 161 |
| 10.10.10.50 | 10.20.0.0/16 | ICMP | — |
| 10.10.10.50 | 10.30.0.0/16 | UDP | 161 |
| 10.10.10.50 | 10.30.0.0/16 | ICMP | — |

**Test Reachability:**

```bash
# From HQ collector, ping remote site gateways
ping 10.20.0.1  # Site B gateway
ping 10.30.0.1  # Site C gateway

# Test SNMP to remote site devices
snmpwalk -v2c -c viyu-readonly 10.20.1.1 sysDescr
```

### Configuration: Distributed Collectors

1. Deploy a Pi at each site
2. Place each on the local management VLAN
3. In Auvik, create separate sites:
   - `ClientName-HQ`
   - `ClientName-SiteB`
   - `ClientName-SiteC`
4. Add each collector to its respective Auvik site

---

## Quick Reference: Complex Scenario Checklist

Before deployment, verify:

- [ ] **Network diagram** — Document VLANs, subnets, routing
- [ ] **Firewall rules** — Allow SNMP (161/UDP), ICMP, WMI if needed
- [ ] **Collector placement** — Management VLAN preferred
- [ ] **Credentials** — SNMPv2c or SNMPv3 configured on all devices
- [ ] **Routing** — Test ping/traceroute to all monitored subnets
- [ ] **SNMP testing** — Verify snmpwalk from collector to each subnet
- [ ] **Auvik configuration** — Credentials added, discovery run
- [ ] **Documentation** — Record firewall rules, credentials, site details

---

## Additional Resources

- [VLAN Placement Guide](./vlan-placement.md) — Basics of collector placement
- [SNMP Configuration](./snmp-configuration.md) — Detailed SNMP setup
- [Firewall Rules](./firewall-rules.md) — Required firewall configuration

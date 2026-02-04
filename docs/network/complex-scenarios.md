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

Client requires monitoring of DMZ-hosted services (web servers, email gateways, public-facing infrastructure) but security policy prohibits DMZ-to-internal traffic. DMZ networks are designed for defense-in-depth, isolating public-facing services from internal networks.

**Common DMZ Use Cases:**
- Public web servers and application servers
- Email gateways (SMTP relays, spam filters)
- VPN concentrators and remote access gateways
- DNS servers (external resolvers)
- Load balancers and reverse proxies
- FTP/SFTP servers

### Placement Strategies

There are three approaches to monitoring DMZ infrastructure, each with different security and operational trade-offs:

#### Strategy 1: Dual Collector Setup (Most Secure)

Deploy **two separate collectors**:

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
      │ 172.16.1./24│             │  10.10.x./24│
      │            │              │             │
      │ [Collector]│              │ [Collector] │
      │ 172.16.1.50│              │ 10.10.10.50 │
      │ [Web Srv]  │              │ [Switches]  │
      │ [Mail Gw]  │              │ [Servers]   │
      │ [VPN]      │              │ [Firewall]  │
      └────────────┘              └─────────────┘
```

**Pros:**
- ✅ Complete network isolation maintained
- ✅ No DMZ-to-internal or internal-to-DMZ firewall rules needed
- ✅ Meets strictest security policies (PCI-DSS, HIPAA, SOC 2)
- ✅ DMZ breach does not compromise internal monitoring

**Cons:**
- ❌ Additional hardware cost (second Pi)
- ❌ Two collectors to manage and maintain
- ❌ Separate Auvik sites or multi-collector configuration

**Best for:** High-security environments, compliance-driven networks, clients with strict DMZ isolation policies

#### Strategy 2: Internal Collector with Limited DMZ Access (Common)

Place the collector on the **internal management VLAN** and create a **firewall exception** allowing read-only monitoring access to the DMZ.

```
                        Internet
                           │
                           ▼
                   ┌───────────────┐
                   │   Firewall    │
                   │               │
                   │  Rule: Allow  │
                   │  10.10.10.50  │
                   │  → DMZ:161    │
                   └───┬───────┬───┘
                       │       │
                       │       │ Limited Access
            ┌──────────┘       └──────────┐
            │                             │
      ┌─────▼──────┐              ┌───────▼─────┐
      │    DMZ     │              │   Internal  │
      │  VLAN 99   │◄─────────────│  Management │
      │ 172.16.1./24│   SNMP only │ 10.10.10./24│
      │            │              │             │
      │ [Web Srv]  │              │ [Collector] │
      │ [Mail Gw]  │              │ 10.10.10.50 │
      │ [VPN]      │              │ [Switches]  │
      └────────────┘              └─────────────┘
```

**Pros:**
- ✅ Single collector (lower cost)
- ✅ Unified monitoring view in Auvik
- ✅ Easier to manage

**Cons:**
- ❌ Creates firewall exception between security zones
- ❌ May not satisfy strictest security policies
- ❌ Requires careful rule scoping and logging

**Best for:** Moderate security environments, small to medium businesses, clients with pragmatic security posture

#### Strategy 3: Firewall Management Interface Monitoring Only (Least Invasive)

Monitor the **DMZ through the firewall's management interface** without direct DMZ access.

```
                        Internet
                           │
                           ▼
                   ┌───────────────┐
                   │   Firewall    │
                   │               │
                   │  Mgmt: 10.10.10.1 (Internal)
                   │  DMZ:  172.16.1.1  (DMZ Interface)
                   └───┬───────┬───┘
                       │       │
            ┌──────────┘       └──────────┐
            │                             │
      ┌─────▼──────┐              ┌───────▼─────┐
      │    DMZ     │              │   Internal  │
      │  VLAN 99   │              │  Management │
      │            │              │             │
      │ [Web Srv]  │              │ [Collector] │
      │ [Mail Gw]  │              │ 10.10.10.50 │
      │ (Not       │              │             │
      │  directly  │              │ Monitors    │
      │  monitored)│              │ firewall    │
      └────────────┘              └─────────────┘
```

**Approach:**
- Monitor the firewall via its internal management interface
- Firewall reports on DMZ zone health, bandwidth, and security events
- No direct monitoring of DMZ devices

**Pros:**
- ✅ Zero DMZ access required
- ✅ No security zone compromise
- ✅ Firewall provides aggregated DMZ metrics

**Cons:**
- ❌ No visibility into individual DMZ devices
- ❌ Cannot discover device details, uptime, or configuration
- ❌ Limited to what firewall exposes via SNMP

**Best for:** Very restrictive environments, clients who only need firewall-level DMZ visibility

### Security Considerations

When implementing any DMZ monitoring strategy, follow these security best practices:

#### Principle of Least Privilege

**Allow only essential protocols:**

| Protocol | Port | Direction | Justification |
|----------|------|-----------|---------------|
| UDP | 161 | Collector → DMZ | SNMP read-only polling |
| ICMP | — | Collector → DMZ | Connectivity monitoring |
| TCP | 443 | Collector → Internet | Auvik cloud sync |

**Explicitly deny everything else:**
- No SSH/RDP from collector to DMZ (use jump host if admin access needed)
- No database access (MySQL, PostgreSQL, MSSQL)
- No file sharing (SMB, NFS)

#### Firewall Rule Hardening

Create **specific, logged rules** for collector access:

**Example: Palo Alto Firewall**

```
Rule Name: Auvik-Collector-to-DMZ-SNMP
Source Zone: Internal
Source Address: 10.10.10.50 (collector IP)
Destination Zone: DMZ
Destination Address: 172.16.1.0/24 (DMZ subnet)
Application: snmp
Service: application-default
Action: allow
Log at Session End: Yes
Profile Type: Security Profiles → Apply strict profile
```

**Example: pfSense/OPNsense**

Navigate to **Firewall → Rules → Internal**

| Source | Destination | Port | Protocol | Action | Log |
|--------|-------------|------|----------|--------|-----|
| 10.10.10.50 (Collector) | DMZ_Net alias | 161 | UDP | Allow | ✅ Yes |
| 10.10.10.50 (Collector) | DMZ_Net alias | * | ICMP | Allow | ✅ Yes |
| 10.10.10.50 (Collector) | DMZ_Net alias | * | Any | Reject | ✅ Yes |

**Example: Fortinet FortiGate**

```
config firewall policy
    edit 100
        set name "Auvik-Collector-DMZ-SNMP"
        set srcintf "Internal"
        set dstintf "DMZ"
        set srcaddr "Collector-10.10.10.50"
        set dstaddr "DMZ-Subnet"
        set action accept
        set schedule "always"
        set service "SNMP" "PING"
        set logtraffic all
        set comments "Auvik monitoring - approved [Date]"
    next
end
```

#### Read-Only SNMP Credentials

**Create DMZ-specific SNMP community or SNMPv3 user:**

**SNMPv2c Example:**
- Internal devices: `viyu-readonly-internal`
- DMZ devices: `viyu-readonly-dmz`

If DMZ credentials are compromised, internal network remains protected.

**SNMPv3 Example (Preferred):**

On DMZ devices, configure a separate SNMPv3 user:

```
snmp-server group DMZ-MONITOR v3 priv read READONLY-VIEW
snmp-server user viyu-dmz DMZ-MONITOR v3 auth sha DmzAuth123! priv aes 128 DmzPriv456!
snmp-server view READONLY-VIEW iso included
```

**Benefits:**
- Separate credentials for DMZ vs. internal
- Credential compromise contained to DMZ
- Different password rotation schedules if needed

#### Network Segmentation Verification

After configuration, validate isolation:

**From DMZ Collector (if using Strategy 1):**

```bash
# Should SUCCEED - DMZ device access
ping 172.16.1.10
snmpwalk -v2c -c viyu-readonly-dmz 172.16.1.10 sysDescr

# Should FAIL - Internal network should be unreachable
ping 10.10.10.1
ping 10.10.20.5
ssh 10.10.10.1

# Should SUCCEED - Internet access for Auvik cloud
curl -I https://auvik.com
```

**From Internal Collector (if using Strategy 2):**

```bash
# Should SUCCEED - Internal device access
ping 10.10.10.1
snmpwalk -v2c -c viyu-readonly-internal 10.10.10.1 sysDescr

# Should SUCCEED (if firewall rule in place) - DMZ read-only access
ping 172.16.1.10
snmpwalk -v2c -c viyu-readonly-dmz 172.16.1.10 sysDescr

# Should FAIL - No SSH/RDP to DMZ
ssh 172.16.1.10
nc -zv 172.16.1.10 3389
```

#### Logging and Alerting

Enable comprehensive logging for security audits:

1. **Firewall Logs** — Log all collector-to-DMZ traffic
2. **SNMP Access Logs** — Enable SNMP logging on DMZ devices (if supported)
3. **Auvik Activity Logs** — Review which devices are being polled
4. **Anomaly Detection** — Alert on unusual patterns (e.g., collector accessing SSH/RDP ports)

**Example: Firewall Log Review**

Regularly audit logs for:
- ✅ Expected: UDP 161 from collector to DMZ devices
- ✅ Expected: ICMP echo from collector to DMZ devices
- ⚠️ Unexpected: TCP 22, 3389, 445, 135 from collector to DMZ → Investigate
- ⚠️ Unexpected: Traffic from DMZ to internal network → **Critical - Possible breach**

### DMZ Collector Configuration (Strategy 1)

**Physical Setup:**

1. Deploy a separate Pi 5 in the DMZ network
2. Connect to a switch port on DMZ VLAN (access port, not trunk)
3. Assign static IP in DMZ subnet (e.g., 172.16.1.50)

**Network Configuration on Pi:**

```bash
# Edit /etc/dhcpcd.conf
sudo nano /etc/dhcpcd.conf

# Add static IP configuration
interface eth0
static ip_address=172.16.1.50/24
static routers=172.16.1.1
static domain_name_servers=8.8.8.8 8.8.4.4
```

**Firewall Rules (DMZ Collector → Internet):**

| Source | Destination | Protocol | Port | Purpose |
|--------|-------------|----------|------|---------|
| 172.16.1.50 | DMZ devices | UDP | 161 | SNMP polling |
| 172.16.1.50 | DMZ devices | ICMP | — | Ping monitoring |
| 172.16.1.50 | auvik.com, *.auvik.com | TCP | 443 | Auvik cloud sync |
| 172.16.1.50 | tailscale.com | TCP | 443 | Remote access (if used) |
| 172.16.1.50 | Internal network | ANY | ANY | **DENY** |

**Auvik Multi-Site Setup:**

1. In Auvik portal, create **two sites** for this client:
   - Site 1: `ClientName-Internal`
   - Site 2: `ClientName-DMZ`
2. During collector installation on DMZ Pi, assign to `ClientName-DMZ` site
3. Add DMZ-specific SNMP credentials to `ClientName-DMZ` site
4. Configure discovery to target DMZ subnet only (172.16.1.0/24)

### Internal Collector with DMZ Access (Strategy 2)

**Firewall Rules (Internal Collector → DMZ):**

Create a **tightly scoped rule** allowing only monitoring protocols:

| Source | Destination | Protocol | Port | Purpose | Log |
|--------|-------------|----------|------|---------|-----|
| 10.10.10.50 | 172.16.1.0/24 | UDP | 161 | SNMP | ✅ |
| 10.10.10.50 | 172.16.1.0/24 | ICMP | — | Ping | ✅ |

**Deny rule below the allow rule:**

| Source | Destination | Protocol | Port | Action | Log |
|--------|-------------|----------|------|--------|-----|
| 10.10.10.50 | 172.16.1.0/24 | ANY | ANY | **DENY** | ✅ |

This ensures the collector cannot access DMZ via SSH, RDP, HTTP, or any other management protocol.

**Auvik Configuration:**

1. Use **single site** for this client: `ClientName-Network`
2. Add both internal and DMZ credentials to the same Auvik site
3. Configure discovery to include both internal subnets and DMZ subnet
4. Auvik will use appropriate credentials per device automatically

### Testing and Verification

After implementing DMZ monitoring, validate the configuration:

#### Connectivity Testing

**From the collector (regardless of strategy):**

```bash
# Test SNMP to DMZ device
snmpwalk -v2c -c viyu-readonly-dmz 172.16.1.10 sysDescr

# Expected output
SNMPv2-MIB::sysDescr.0 = STRING: [Device description]

# Test ICMP
ping -c 4 172.16.1.10

# Expected: 0% packet loss
```

#### Security Testing (Strategy 2 - Internal Collector with DMZ Access)

Verify that **only** SNMP and ICMP are allowed:

```bash
# These should FAIL (timeout or connection refused)
ssh 172.16.1.10
telnet 172.16.1.10 22
nc -zv 172.16.1.10 3389  # RDP
nc -zv 172.16.1.10 80    # HTTP
nc -zv 172.16.1.10 443   # HTTPS

# These should SUCCEED
snmpget -v2c -c viyu-readonly-dmz 172.16.1.10 sysUpTime.0
ping 172.16.1.10
```

#### Firewall Log Verification

After running tests, check firewall logs:

**Expected Logs:**
```
ALLOW: 10.10.10.50:56789 → 172.16.1.10:161 (UDP) - SNMP
ALLOW: 10.10.10.50 → 172.16.1.10 (ICMP) - Echo Request
DENY:  10.10.10.50:54321 → 172.16.1.10:22 (TCP) - SSH
```

If you see unexpected ALLOW entries for SSH/RDP/other protocols, **review and tighten firewall rules immediately**.

### Common Issues

#### Issue: DMZ devices not discovered in Auvik

**Cause 1:** Firewall blocking SNMP from collector to DMZ

**Resolution:**
1. Verify firewall rule is in place and active
2. Check rule order (deny rules may precede allow rule)
3. Test SNMP manually from collector:
   ```bash
   snmpwalk -v2c -c viyu-readonly-dmz 172.16.1.10 sysDescr
   ```
4. Check firewall logs for blocked traffic

**Cause 2:** Wrong SNMP credentials for DMZ devices

**Resolution:**
1. Verify SNMP community/SNMPv3 credentials on DMZ devices
2. Test with snmpwalk using exact credentials configured in Auvik
3. Ensure DMZ devices are configured to accept SNMP from collector IP

**Cause 3:** DMZ devices not configured with SNMP

**Resolution:**
1. Enable SNMP on each DMZ device
2. Configure read-only community or SNMPv3 user
3. Add collector IP to SNMP allowed hosts (if device requires it)

#### Issue: DMZ collector cannot reach Auvik cloud

**Cause:** Outbound HTTPS blocked from DMZ

**Resolution:**
1. Add firewall rule allowing DMZ collector to reach *.auvik.com:443
2. Verify DNS resolution works from DMZ:
   ```bash
   nslookup auvik.com
   ```
3. Test HTTPS connectivity:
   ```bash
   curl -I https://auvik.com
   ```

#### Issue: Security team flags collector-to-DMZ access as violation

**Cause:** Strategy 2 (internal-to-DMZ exception) conflicts with security policy

**Resolution:**
1. Discuss with security team:
   - Show read-only nature of SNMP
   - Demonstrate logging of all access
   - Explain monitoring requirement
2. If rejected, switch to **Strategy 1 (Dual Collector Setup)**
3. Document security approval for audit purposes

### Compliance Considerations

Different compliance frameworks have specific requirements for DMZ monitoring:

#### PCI-DSS (Payment Card Industry)

If DMZ hosts payment processing infrastructure:
- ✅ **Requirement 1.3.6** — Monitoring systems must not compromise DMZ isolation
- ✅ **Recommendation:** Use Strategy 1 (Dual Collector) to maintain segmentation
- ✅ Ensure all collector-to-DMZ traffic is logged
- ✅ Quarterly review of firewall rules and access logs

#### HIPAA (Healthcare)

If DMZ hosts patient data systems:
- ✅ **§164.312(a)(1)** — Monitoring access must be logged and auditable
- ✅ Use SNMPv3 with authPriv for encrypted polling
- ✅ Document monitoring access in security risk assessment
- ✅ Limit collector access to minimum necessary (SNMP + ICMP only)

#### SOC 2 Type II

Service providers with DMZ infrastructure:
- ✅ Document DMZ monitoring architecture in system description
- ✅ Include firewall rules and access controls in audit evidence
- ✅ Demonstrate least-privilege access (read-only SNMP)
- ✅ Provide logs showing no unauthorized DMZ access attempts

### Documentation Template

Create a document for the client (and for auditors) detailing the DMZ monitoring setup:

```
DMZ Monitoring Architecture - [Client Name]

Deployment Strategy: [Dual Collector / Internal with Exception / Firewall-only]

Network Details:
- DMZ Subnet: 172.16.1.0/24
- DMZ Collector IP: 172.16.1.50 (if applicable)
- Internal Collector IP: 10.10.10.50
- Firewall: [Vendor/Model]

Firewall Rules:
- Rule ID: [ID]
- Source: [Collector IP]
- Destination: [DMZ Subnet]
- Allowed Protocols: UDP 161 (SNMP), ICMP
- Denied Protocols: All others
- Logging: Enabled

Credentials:
- SNMP Version: [v2c / v3]
- Community/Username: viyu-readonly-dmz
- Access Level: Read-only
- Allowed Source: [Collector IP only]

Security Controls:
- DMZ-to-Internal traffic: Blocked
- Collector-to-DMZ management protocols: Blocked
- All access logged: Yes
- Log retention: [Period]

Last Reviewed: [Date]
Next Review: [Date]

Approved By:
- IT Manager: [Name, Date]
- Security Team: [Name, Date]
```

---

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
- **Best for:** Small to medium enterprises (&lt;200 devices)

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
| **Device Count** | Works if total devices &lt;500 | Scales better for large multi-site |
| **WAN Reliability** | If WAN fails, remote sites lose monitoring | Each site independent |
| **Management** | Simpler (one collector) | More complex (multiple collectors) |
| **Cost** | Lower (one Pi) | Higher (Pi per site) |

### Recommended Approach

**Small sites (&lt;50 devices/site), reliable WAN:**
- Deploy **one collector at headquarters**
- Configure routing to allow collector access to all sites

**Large sites (>50 devices/site), or unreliable WAN:**
- Deploy **one collector per site**
- Configure as separate Auvik sites or use multi-collector setup

### Configuration: Centralized Collector

**Headquarters Firewall/Router:**

Ensure routing and firewall rules allow HQ collector to reach remote sites:

```
                         Internet
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        │               MPLS/VPN                │
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼─────────┐
│   Site A (HQ)  │  │  Site B (Rmt1) │  │  Site C (Rmt2) │
│  10.10.0.0/16  │  │  10.20.0.0/16  │  │  10.30.0.0/16  │
│                │  │                │  │                │
│ Management VLAN│  │ Management VLAN│  │ Management VLAN│
│ 10.10.10.0/24  │  │ 10.20.10.0/24  │  │ 10.30.10.0/24  │
│                │  │                │  │                │
│ [Pi Collector] │  │  [Core Switch] │  │  [Core Switch] │
│  10.10.10.50   │  │   10.20.10.1   │  │   10.30.10.1   │
│       │        │  │       │        │  │       │        │
│ [Core Switch]  │  │  [Edge Router] │  │  [Edge Router] │
│  10.10.10.1    │  │   10.20.0.1    │  │   10.30.0.1    │
│       │        │  │                │  │                │
│ [Edge Router]  │  │  [Switches]    │  │  [Switches]    │
│  10.10.0.1     │  │  [Servers]     │  │  [Servers]     │
│       │        │  │  [APs]         │  │  [APs]         │
└───────┼────────┘  └────────────────┘  └────────────────┘
        │
        └──────────► Single collector monitors all sites
                     via WAN routing
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

Deploy independent collectors at each location:

```
                           Internet
                              │
                      Auvik Cloud API
                         ↑    ↑    ↑
                         │    │    │
        ┌────────────────┘    │    └────────────────┐
        │                     │                     │
        │                 MPLS/VPN                  │
        │              (Minimal Usage)              │
        │                     │                     │
┌───────▼────────┐    ┌───────▼────────┐    ┌──────▼─────────┐
│   Site A (HQ)  │    │  Site B (Rmt1) │    │  Site C (Rmt2) │
│  10.10.0.0/16  │    │  10.20.0.0/16  │    │  10.30.0.0/16  │
│                │    │                │    │                │
│ [Pi Collector] │    │ [Pi Collector] │    │ [Pi Collector] │
│  10.10.10.50   │    │  10.20.10.50   │    │  10.30.10.50   │
│       │        │    │       │        │    │       │        │
│       ▼        │    │       ▼        │    │       ▼        │
│  Local devices │    │  Local devices │    │  Local devices │
│  only (L2/L3)  │    │  only (L2/L3)  │    │  only (L2/L3)  │
│                │    │                │    │                │
│ [Switches]     │    │ [Switches]     │    │ [Switches]     │
│ [Servers]      │    │ [Servers]      │    │ [Servers]      │
│ [APs]          │    │ [APs]          │    │ [APs]          │
│ [Firewall]     │    │ [Firewall]     │    │ [Firewall]     │
└────────────────┘    └────────────────┘    └────────────────┘

  Auvik Site:           Auvik Site:          Auvik Site:
  ClientName-HQ         ClientName-SiteB     ClientName-SiteC
```

**Setup Steps:**

1. Deploy a Pi at each site
2. Place each on the local management VLAN
3. In Auvik, create separate sites:
   - `ClientName-HQ`
   - `ClientName-SiteB`
   - `ClientName-SiteC`
4. Add each collector to its respective Auvik site

---

## Troubleshooting

### Devices discovered in one VLAN but not others

**Cause:** Inter-VLAN routing or firewall rules blocking SNMP traffic

**Resolution:**
1. Verify the collector can ping devices in the missing VLAN:
   ```bash
   ping 10.10.20.5  # Replace with device IP from missing VLAN
   ```
2. Test SNMP access manually:
   ```bash
   snmpwalk -v2c -c viyu-readonly 10.10.20.5 sysDescr
   ```
3. Check firewall rules allow UDP 161 and ICMP from collector to all VLANs
4. Verify rule order — deny rules may precede allow rules
5. Use tcpdump to see if packets are being sent:
   ```bash
   sudo tcpdump -i eth0 host 10.10.20.5 and port 161
   ```
6. Check firewall logs for blocked traffic

### High latency or timeouts to remote sites

**Cause:** WAN congestion, routing issues, or unstable connectivity

**Resolution:**
1. Test WAN latency from collector to remote site:
   ```bash
   ping -c 100 10.20.0.1  # Remote site gateway
   # Look for packet loss and average latency
   ```
2. Run traceroute to identify where delays occur:
   ```bash
   traceroute 10.20.0.1
   ```
3. If latency consistently >100ms or packet loss >5%, consider distributed collectors
4. Check WAN bandwidth utilization — SNMP polling is minimal but sustained
5. Verify QoS policies aren't deprioritizing SNMP traffic
6. Consider deploying a local collector at the remote site

### Collector cannot reach DMZ devices despite firewall rules

**Cause 1:** Firewall rule order incorrect

**Resolution:**
1. Verify allow rule is above deny rules in firewall policy
2. Check rule hit counts — if rule has 0 hits, traffic not matching
3. Temporarily enable logging on deny rules to see what's being blocked
4. Review source/destination addresses — ensure exact match

**Cause 2:** Asymmetric routing or return path filtering

**Resolution:**
1. Verify return packets can reach collector:
   ```bash
   sudo tcpdump -i eth0 host 172.16.1.10
   ```
2. Check if return path uses different firewall interface
3. Verify NAT rules aren't interfering
4. Disable reverse path filtering temporarily for testing:
   ```bash
   # Temporarily disable RPF (test only)
   sudo sysctl -w net.ipv4.conf.all.rp_filter=0
   ```

**Cause 3:** DMZ devices have SNMP ACLs restricting source IPs

**Resolution:**
1. Check device SNMP configuration for allowed hosts
2. Add collector IP to device SNMP ACL:
   ```
   # Cisco IOS example
   access-list 10 permit 10.10.10.50
   snmp-server community viyu-readonly RO 10
   ```

### SNMPv3 works on some devices but not others

**Cause:** Vendor-specific SNMPv3 implementation differences

**Resolution:**
1. Check exact auth/priv protocol names — some vendors use "SHA" vs "SHA1", "AES" vs "AES128"
2. For Cisco devices, verify the group and view are configured:
   ```
   show snmp user
   show snmp group
   ```
3. For devices with no response, verify SNMPv3 is enabled (some require explicit enable)
4. Check VACM (View-based Access Control Model) permissions:
   ```
   # Ensure read-view grants access to full MIB tree
   snmp-server view READONLY-VIEW iso included
   ```
5. Test with verbose snmpwalk to see exact error:
   ```bash
   snmpwalk -v3 -l authPriv -u viyumonitor \
     -a SHA -A AuthPass123! \
     -x AES -X PrivPass456! \
     -Le -d 10.10.10.1 sysDescr 2>&1 | head -50
   ```

### Trunk port configuration causing VLAN issues

**Cause:** Native VLAN mismatch, incorrect allowed VLANs, or switchport mode wrong

**Resolution:**
1. Verify trunk port configuration on both ends (switch and router):
   ```
   # Cisco IOS
   show interface GigabitEthernet0/1 switchport
   show interface GigabitEthernet0/1 trunk
   ```
2. Ensure both ends have matching:
   - Native VLAN
   - Allowed VLANs
   - Encapsulation type (dot1q)
3. Check for VLAN pruning — ensure required VLANs not pruned
4. Verify STP isn't blocking the trunk port:
   ```
   show spanning-tree interface GigabitEthernet0/1
   ```
5. For UniFi, verify trunk profile includes all needed VLANs

### Collector shows online but not discovering devices

**Cause 1:** Discovery not initiated or limited to wrong subnet

**Resolution:**
1. In Auvik, navigate to the site and click "Discover"
2. Verify discovery subnets include all target networks
3. Check that credentials are added to the site (not just client level)
4. Review Auvik logs for credential failures

**Cause 2:** SNMP credentials incorrect or not applied

**Resolution:**
1. Verify credentials in Auvik match device configuration exactly
2. Test credentials manually from collector:
   ```bash
   snmpwalk -v2c -c viyu-readonly 10.10.10.1 sysDescr
   ```
3. Check for trailing spaces in Auvik credential entry
4. Ensure credentials are assigned to correct scope (site vs client)
5. Re-run discovery after fixing credentials

**Cause 3:** Firewall or ACL blocking SNMP from collector

**Resolution:**
1. Verify firewall rules allow UDP 161 from collector IP
2. Check device-level SNMP ACLs permit collector IP
3. Test with tcpdump to confirm packets are leaving collector:
   ```bash
   sudo tcpdump -i eth0 port 161 -n
   ```
4. Review firewall logs for blocked traffic

### WMI discovery failing for Windows servers

**Cause:** Windows Firewall blocking WMI or credentials insufficient

**Resolution:**
1. Verify Windows Firewall allows WMI from collector IP
2. Ensure WMI credentials have administrator privileges
3. Test WMI access from collector (requires wmi client):
   ```bash
   wmic -U DOMAIN\\username%password //10.10.20.5 "SELECT * FROM Win32_ComputerSystem"
   ```
4. Check that Remote Registry and WMI services are running on target server
5. Verify domain credentials (if domain-joined) or local admin account

### Multi-site setup showing incorrect device locations

**Cause:** Devices discovered by wrong collector or site mapping incorrect

**Resolution:**
1. If using multiple collectors, verify each discovers only its local subnet
2. In Auvik, check site assignments for misplaced devices
3. Manually reassign devices to correct site if needed
4. Use site-specific credentials to prevent cross-site discovery
5. Configure discovery ranges explicitly per site to avoid overlap

### Router-on-a-stick inter-VLAN routing not working

**Cause:** Subinterfaces not configured correctly or VLAN tagging issues

**Resolution:**
1. Verify router has subinterface for each VLAN:
   ```
   # pfSense: Check Interfaces → Assignments → VLANs
   # Cisco: show ip interface brief | grep Dot
   ```
2. Ensure each subinterface has correct VLAN tag and IP
3. Verify switch trunk port includes all VLANs:
   ```
   show interface trunk
   ```
4. Test routing from collector:
   ```bash
   ping 10.10.10.1  # Management VLAN gateway
   ping 10.10.20.1  # Server VLAN gateway
   traceroute 10.10.20.5  # Should show single hop via gateway
   ```
5. Check router firewall rules allow inter-VLAN traffic

### SNMP working manually but failing in Auvik

**Cause:** Credential entry mismatch or Auvik-specific configuration issue

**Resolution:**
1. Re-enter credentials in Auvik, ensuring:
   - No trailing spaces
   - Exact case match (especially for SNMPv3)
   - Correct protocol selection (v2c vs v3)
2. Delete and re-add the credential rather than editing
3. Test with a single device first before applying to all
4. Check Auvik device logs for specific error messages
5. Verify collector time is synchronized (SNMPv3 time-sensitive):
   ```bash
   timedatectl status
   ```

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

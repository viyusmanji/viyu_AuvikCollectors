---
sidebar_position: 4
---

# Network Connectivity

Advanced troubleshooting for network-level connectivity issues affecting the Auvik collector.

## Overview

This guide covers network-layer problems that prevent the collector from communicating with the Auvik cloud or discovering managed devices. Use this when basic connectivity tests fail or device discovery is incomplete.

## Symptoms

- Collector online but no device discovery
- Intermittent connection to Auvik cloud
- Certificate or SSL/TLS errors in logs
- SNMP polling failures
- Devices on specific VLANs not discovered

## DNS Troubleshooting Flowchart

```
DNS Issue Detected
       │
       ▼
Can you ping 8.8.8.8?
       │
  ┌────┴────┐
 Yes       No
  │         │
  │         ▼
  │    Basic internet
  │    connectivity failed
  │    → Check routing/gateway
  │
  ▼
Can you resolve auvik.com?
       │
  ┌────┴────┐
 Yes       No
  │         │
  │         ▼
  │    DNS resolution failed
  │         │
  │         ▼
  │    Check /etc/resolv.conf
  │    Try alternate DNS (8.8.8.8)
  │
  ▼
Can you curl https://auvik.com?
       │
  ┌────┴────┐
 Yes       No
  │         │
  │         ▼
  │    HTTPS blocked or
  │    SSL inspection issue
  │    → Check firewall/SSL
  │
  ▼
DNS working correctly
Check application layer
```

## DNS Resolution Issues

### Diagnostic Steps

#### 1. Test Basic DNS Resolution

```bash
# Check current DNS servers
cat /etc/resolv.conf

# Test DNS resolution
nslookup auvik.com

# Try with specific DNS server
nslookup auvik.com 8.8.8.8

# Detailed DNS query
dig auvik.com
dig auvik.com @8.8.8.8
```

#### 2. Common DNS Problems

| Symptom | Cause | Resolution |
|---------|-------|------------|
| `SERVFAIL` response | DNS server unreachable or misconfigured | Change to public DNS (8.8.8.8, 1.1.1.1) |
| `NXDOMAIN` response | Domain blocked by DNS filter | Whitelist `*.auvik.com` in DNS filter |
| Timeout | DNS port 53 blocked or DNS server down | Verify UDP/TCP 53 allowed, test alternate DNS |
| Wrong IP returned | DNS poisoning or stale cache | Flush DNS cache, verify with authoritative DNS |

#### 3. Fix DNS Configuration

**Temporary (for testing):**

```bash
# Edit resolv.conf
sudo nano /etc/resolv.conf

# Add Google DNS
nameserver 8.8.8.8
nameserver 8.8.4.4
```

**Permanent (systemd-resolved):**

```bash
# Edit systemd-resolved config
sudo nano /etc/systemd/resolved.conf

# Add under [Resolve] section:
# DNS=8.8.8.8 8.8.4.4
# FallbackDNS=1.1.1.1

# Restart resolver
sudo systemctl restart systemd-resolved

# Verify
resolvectl status
```

**Permanent (static network config):**

```bash
# Edit netplan config
sudo nano /etc/netplan/01-netcfg.yaml

# Add DNS servers:
# network:
#   version: 2
#   ethernets:
#     eth0:
#       dhcp4: true
#       nameservers:
#         addresses: [8.8.8.8, 8.8.4.4]

# Apply changes
sudo netplan apply
```

### DNS Verification Checklist

After DNS changes:

```bash
# Verify resolv.conf
cat /etc/resolv.conf

# Test resolution
nslookup auvik.com
dig auvik.com

# Test HTTPS
curl -I https://auvik.com

# Restart Auvik collector
sudo systemctl restart auvik-collector
```

## SSL/TLS Inspection Issues

SSL inspection (also called SSL decryption or MITM) breaks end-to-end TLS encryption, causing certificate validation failures.

### Detecting SSL Inspection

```bash
# Check certificate chain
openssl s_client -connect auvik.com:443 -servername auvik.com </dev/null 2>/dev/null | openssl x509 -noout -issuer -subject

# Expected issuer: DigiCert, Let's Encrypt, or similar public CA
# If you see: Palo Alto, Fortinet, Sophos, Zscaler → SSL inspection active

# Verbose curl test
curl -v https://auvik.com 2>&1 | grep -i "issuer\|certificate"

# Check full chain
openssl s_client -connect auvik.com:443 -showcerts </dev/null 2>/dev/null
```

### Signs of SSL Inspection

- Certificate issuer is firewall/security vendor
- `SSL certificate problem: unable to get local issuer certificate`
- `Certificate verification failed`
- Auvik collector logs show TLS/certificate errors

### SSL Inspection Bypass Procedures

#### Option 1: Bypass by IP Address

Add collector's IP to SSL inspection bypass list.

**Palo Alto Networks:**

```
Objects → Decryption Exclusions → Add
Source IP: <collector-ip>
Destination: *.auvik.com
Action: No Decrypt
```

**Fortinet FortiGate:**

```
Security Profiles → SSL/SSH Inspection
Edit profile → Exemptions → Add
Type: Address
Source: <collector-ip>
Destination: auvik.com
```

**Sophos XG/XGS:**

```
Web → SSL/TLS Inspection Policy
Add Exception
Source: <collector-ip>
Domain: *.auvik.com
Action: Do not decrypt
```

#### Option 2: Bypass by Domain/Category

Exclude Auvik domains from SSL inspection globally.

**Domains to bypass:**
- `*.auvik.com`
- `api.auvik.com`
- `collector.auvik.com`

**Zscaler:**

```
Policy → SSL Inspection
Edit policy → Add to bypass list
Domain: .auvik.com
Reason: Collector certificate pinning
```

**Cisco Umbrella:**

```
Policies → Destination Lists
Create destination list: Auvik
Add: *.auvik.com
SSL Decryption → Bypass for destination list
```

#### Option 3: Install Custom CA Certificate (Not Recommended)

If bypassing is not possible, install the firewall's CA certificate on the collector.

:::caution
Installing a third-party CA certificate reduces security. Only use if bypass is impossible.
:::

```bash
# Download CA cert from firewall (usually available via web UI)
# Save as firewall-ca.crt

# Install certificate
sudo cp firewall-ca.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# Verify
openssl s_client -connect auvik.com:443 -CApath /etc/ssl/certs </dev/null 2>/dev/null | grep -i "verify return"

# Should show: Verify return code: 0 (ok)
```

### SSL Verification Tests

```bash
# Test without inspection
curl -v https://auvik.com 2>&1 | grep "SSL certificate"

# Test with verbose OpenSSL
openssl s_client -connect auvik.com:443 -servername auvik.com -showcerts </dev/null

# Check Auvik collector logs for errors
journalctl -u auvik-collector --since "10 minutes ago" | grep -i "ssl\|tls\|certificate"

# Test from collector
curl -I https://api.auvik.com
```

## Proxy Configuration

Configure the collector to use a web proxy for internet access.

### Detect Proxy Requirement

```bash
# Try direct connection
curl -I https://auvik.com

# If fails, test with known proxy
curl -x http://proxy.client.local:8080 -I https://auvik.com
```

### Configure System-Wide Proxy

#### Method 1: Environment Variables

```bash
# Set for current session
export http_proxy="http://proxy.client.local:8080"
export https_proxy="http://proxy.client.local:8080"
export no_proxy="localhost,127.0.0.1,10.0.0.0/8,192.168.0.0/16"

# Make persistent
sudo nano /etc/environment

# Add:
# http_proxy="http://proxy.client.local:8080"
# https_proxy="http://proxy.client.local:8080"
# no_proxy="localhost,127.0.0.1,10.0.0.0/8,192.168.0.0/16"

# Apply changes (re-login or reboot)
```

#### Method 2: Systemd Service Override

For Auvik collector specifically:

```bash
# Create override directory
sudo mkdir -p /etc/systemd/system/auvik-collector.service.d/

# Create proxy configuration
sudo nano /etc/systemd/system/auvik-collector.service.d/proxy.conf

# Add:
# [Service]
# Environment="HTTP_PROXY=http://proxy.client.local:8080"
# Environment="HTTPS_PROXY=http://proxy.client.local:8080"
# Environment="NO_PROXY=localhost,127.0.0.1"

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart auvik-collector
```

### Proxy with Authentication

```bash
# Format: http://username:password@proxy:port
export http_proxy="http://user:pass@proxy.client.local:8080"
export https_proxy="http://user:pass@proxy.client.local:8080"

# If password contains special characters, URL-encode them
# Example: p@ssw0rd! becomes p%40ssw0rd%21
```

### Proxy Verification

```bash
# Test with environment variables
curl -I https://auvik.com

# Verify environment
echo $http_proxy
echo $https_proxy

# Check Auvik service environment
sudo systemctl show auvik-collector | grep -i proxy

# Test HTTPS through proxy
curl -v -x http://proxy.client.local:8080 https://auvik.com 2>&1 | head -40
```

### Common Proxy Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `407 Proxy Authentication Required` | Credentials missing/wrong | Add username:password to proxy URL |
| `Connection refused` | Proxy unreachable or wrong port | Verify proxy IP/port, check firewall |
| `SSL connect error` | Proxy doing SSL inspection | Bypass SSL inspection for collector IP |
| `Timeout` | Proxy requires auth or blocking traffic | Check proxy logs, verify allowlist |

## VLAN Isolation Debugging

When devices on specific VLANs aren't discovered by the collector.

### Network Topology Check

```
┌─────────────────┐
│ Auvik Collector │ (VLAN 10 - Management)
│  10.1.10.50     │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Core   │
    │ Switch  │
    └────┬────┘
         │
    ┌────┼────────────┐
    │    │            │
VLAN 10  VLAN 20   VLAN 30
(Mgmt)   (Users)   (Servers)
```

Can the collector reach devices on other VLANs?

### Diagnostic Steps

#### 1. Test Basic Connectivity

```bash
# From collector, test devices on different VLANs
ping 10.1.10.1  # Same VLAN (should work)
ping 10.1.20.1  # Different VLAN (may fail)
ping 10.1.30.1  # Different VLAN (may fail)

# Check routing table
ip route show

# Should see routes to all VLANs or a default gateway
```

#### 2. Verify Inter-VLAN Routing

```bash
# Traceroute to device on different VLAN
traceroute 10.1.20.10

# Should show:
# 1. Gateway (10.1.10.1)
# 2. Destination (10.1.20.10)

# If traceroute stops at gateway:
# → Inter-VLAN routing not configured
```

#### 3. Check VLAN Configuration

From the switch/router:

**Cisco IOS:**
```
show vlan brief
show ip route
show interface vlan 10
show interface vlan 20
```

**Dell/Force10:**
```
show vlan
show ip route
show running-config interface vlan 10
```

#### 4. Test SNMP Across VLANs

```bash
# Install SNMP tools
sudo apt install snmp -y

# Test SNMP to same VLAN
snmpwalk -v2c -c public 10.1.10.1 sysDescr

# Test SNMP to different VLAN
snmpwalk -v2c -c public 10.1.20.10 sysDescr

# If same VLAN works but different VLAN fails:
# → ACL blocking SNMP between VLANs
```

### Common VLAN Isolation Issues

| Problem | Diagnosis | Solution |
|---------|-----------|----------|
| No inter-VLAN routing | `ping` fails to other VLANs | Configure L3 switch or router with SVI/IRB |
| ACL blocking SNMP | `ping` works but `snmpwalk` fails | Add ACL permit for UDP 161 from collector VLAN |
| Private VLANs | Some devices reachable, others not | Verify PVLAN config, place collector on promiscuous port |
| Firewall between VLANs | Initial ping works, then fails | Check stateful firewall rules, allow ICMP/SNMP |

### Resolution: Enable Inter-VLAN SNMP

**Cisco IOS (ACL):**
```
! Create ACL to permit SNMP from collector
ip access-list extended ALLOW_SNMP
 permit udp host 10.1.10.50 any eq 161
 permit icmp host 10.1.10.50 any

! Apply to VLAN interfaces
interface vlan 20
 ip access-group ALLOW_SNMP in
```

**Fortinet FortiGate (VLAN Firewall):**
```
config firewall policy
    edit 0
        set name "Collector-to-VLANs"
        set srcintf "vlan10"
        set dstintf "vlan20" "vlan30"
        set srcaddr "Collector-IP"
        set dstaddr "all"
        set service "SNMP" "PING"
        set action accept
    next
end
```

### VLAN Troubleshooting Checklist

- [ ] Collector can ping its own gateway
- [ ] Collector can ping devices on same VLAN
- [ ] Collector can ping devices on different VLANs
- [ ] SNMP works to same VLAN devices
- [ ] SNMP works to different VLAN devices
- [ ] No ACLs blocking UDP 161 from collector
- [ ] Inter-VLAN routing configured on core switch

## Firewall Rule Verification

Systematic approach to verifying firewall rules for the collector.

### Required Firewall Rules

#### Outbound (Collector → Internet)

| Protocol | Port | Destination | Priority |
|----------|------|-------------|----------|
| TCP | 443 | `*.auvik.com` | Critical |
| TCP | 443 | `*.tailscale.com` | High (if using) |
| UDP | 53 | DNS servers | Critical |
| ICMP | — | Any | Medium |

#### Internal (Collector → Managed Devices)

| Protocol | Port | Destination | Priority |
|----------|------|-------------|----------|
| UDP | 161 | All managed devices | Critical |
| ICMP | — | All managed devices | High |
| TCP | 22 | Managed devices | Medium (SSH) |
| TCP | 443 | Managed devices | Medium (HTTPS) |

### Verification Commands

#### From Collector to Internet

```bash
# HTTPS to Auvik
curl -I https://auvik.com
curl -I https://api.auvik.com
curl -I https://collector.auvik.com

# DNS
nslookup auvik.com
dig auvik.com @8.8.8.8

# Ping (outbound ICMP)
ping -c 4 8.8.8.8
ping -c 4 auvik.com

# Tailscale (if configured)
curl -I https://controlplane.tailscale.com
tailscale netcheck
```

#### From Collector to Managed Devices

```bash
# ICMP
ping -c 4 <device-ip>

# SNMP
snmpwalk -v2c -c public <device-ip> sysDescr

# TCP port check (if device has web interface)
nc -zv <device-ip> 443
nc -zv <device-ip> 22

# Traceroute (shows firewall hops)
traceroute <device-ip>
```

### Firewall Log Analysis

When connectivity fails, check firewall logs:

**What to look for:**
- Denied/dropped packets from collector IP
- Blocks to `*.auvik.com` domains
- SSL inspection events
- Rate limiting or flood protection triggers

**Palo Alto:**
```
( addr.src in <collector-ip> ) and ( action eq deny )
```

**Fortinet FortiGate:**
```
# CLI:
execute log filter field srcip <collector-ip>
execute log filter field action deny
execute log display
```

**Check Point:**
```
# SmartLog:
src:<collector-ip> AND action:drop
```

### Common Firewall Blocks

| Symptom | Likely Cause | Verification | Fix |
|---------|--------------|--------------|-----|
| Collector offline | HTTPS (443) blocked | `curl https://auvik.com` fails | Allow TCP 443 to `*.auvik.com` |
| No device discovery | SNMP blocked | `snmpwalk` fails | Allow UDP 161 outbound to LAN |
| DNS errors | DNS (53) blocked | `nslookup` fails | Allow UDP/TCP 53 to DNS servers |
| Geo-blocking | Auvik IPs flagged | Firewall logs show geo-block | Whitelist Auvik IP ranges |

## Packet Capture Analysis

Use packet captures to diagnose complex connectivity issues.

### Capture Tools

#### tcpdump (Command-Line)

```bash
# Capture all traffic on eth0
sudo tcpdump -i eth0 -w /tmp/capture.pcap

# Capture only HTTPS traffic to Auvik
sudo tcpdump -i eth0 -w /tmp/auvik.pcap 'host auvik.com and port 443'

# Capture SNMP traffic
sudo tcpdump -i eth0 -w /tmp/snmp.pcap 'udp port 161'

# Capture DNS queries
sudo tcpdump -i eth0 -w /tmp/dns.pcap 'port 53'

# Capture for 60 seconds then stop
sudo timeout 60 tcpdump -i eth0 -w /tmp/capture.pcap

# Capture with packet details (no file)
sudo tcpdump -i eth0 -v -n host auvik.com
```

#### Wireshark (GUI Analysis)

Transfer capture file to workstation for analysis:

```bash
# From collector, copy to local machine
scp viyu@<collector-ip>:/tmp/capture.pcap ~/Desktop/

# Or use Tailscale
scp viyu@<collector-hostname>:/tmp/capture.pcap ~/Desktop/
```

### Common Capture Scenarios

#### Scenario 1: Collector Can't Reach Auvik Cloud

```bash
# Capture HTTPS to Auvik
sudo tcpdump -i eth0 -w /tmp/auvik-https.pcap 'host auvik.com and port 443' &

# Trigger connection attempt
curl -v https://auvik.com

# Stop capture (wait 30 seconds)
sudo pkill tcpdump

# Quick analysis (command-line)
tcpdump -r /tmp/auvik-https.pcap -n
```

**What to look for:**
- **SYN sent, no SYN-ACK:** Firewall blocking outbound
- **SYN-ACK received, then RST:** Connection rejected
- **TLS handshake fails:** SSL inspection or certificate issue
- **No packets at all:** Routing problem

#### Scenario 2: SNMP Not Working

```bash
# Capture SNMP to specific device
sudo tcpdump -i eth0 -w /tmp/snmp-device.pcap "udp port 161 and host <device-ip>" &

# Trigger SNMP query
snmpwalk -v2c -c public <device-ip> sysDescr

# Stop capture
sudo pkill tcpdump

# Analyze
tcpdump -r /tmp/snmp-device.pcap -n -v
```

**What to look for:**
- **SNMP request sent, no response:** Device not responding or wrong community
- **ICMP port unreachable:** SNMP not enabled on device
- **No packets sent:** Routing issue from collector

#### Scenario 3: DNS Resolution Failing

```bash
# Capture DNS traffic
sudo tcpdump -i eth0 -w /tmp/dns.pcap 'port 53' &

# Trigger DNS lookup
nslookup auvik.com

# Stop capture
sudo pkill tcpdump

# Analyze
tcpdump -r /tmp/dns.pcap -n -v
```

**What to look for:**
- **Query sent, no response:** DNS server unreachable or port 53 blocked
- **SERVFAIL response:** DNS server error
- **NXDOMAIN response:** Domain blocked or doesn't exist
- **Wrong IP returned:** DNS hijacking or filtering

### Reading tcpdump Output

#### Successful HTTPS Connection

```
10:23:45.123456 IP collector.54321 > auvik.com.443: Flags [S], seq 123456
10:23:45.234567 IP auvik.com.443 > collector.54321: Flags [S.], seq 789012, ack 123457
10:23:45.234890 IP collector.54321 > auvik.com.443: Flags [.], ack 1
10:23:45.345678 IP collector.54321 > auvik.com.443: Flags [P.], TLS handshake
```
✅ **Good:** Three-way handshake (SYN, SYN-ACK, ACK), then TLS

#### Blocked Connection

```
10:23:45.123456 IP collector.54321 > auvik.com.443: Flags [S], seq 123456
10:23:45.123456 IP collector.54321 > auvik.com.443: Flags [S], seq 123456
10:23:45.123456 IP collector.54321 > auvik.com.443: Flags [S], seq 123456
```
❌ **Bad:** Multiple SYN retransmits, no SYN-ACK (firewall blocking)

#### SSL Inspection Detected

```
10:23:45.345678 IP collector.54321 > auvik.com.443: TLSv1.2 Client Hello
10:23:45.456789 IP auvik.com.443 > collector.54321: TLSv1.2 Server Hello
  Cipher: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
  Issuer: CN=Fortinet-CA, O=Fortinet
```
⚠️ **Warning:** Certificate issuer is Fortinet (SSL inspection active)

### Wireshark Filters

Common filters for analyzing captures in Wireshark:

| Filter | Purpose |
|--------|---------|
| `ip.addr == <collector-ip>` | All traffic to/from collector |
| `tcp.port == 443 && ssl` | HTTPS/TLS traffic |
| `dns` | DNS queries and responses |
| `snmp` | SNMP traffic |
| `icmp` | Ping and ICMP messages |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | Connection attempts (SYN) |
| `tcp.flags.reset == 1` | Connection resets |
| `ssl.handshake.certificate` | View certificates in TLS handshake |

### Capture Best Practices

- **Limit capture scope:** Use filters to avoid huge files
- **Capture bidirectional:** Ensure you see both request and response
- **Time-limit captures:** Use `timeout` command to auto-stop
- **Document conditions:** Note what you were testing when capture was taken
- **Privacy:** Captures may contain sensitive data — handle appropriately

### Packet Capture Checklist

- [ ] Identified which protocol to capture (HTTPS, SNMP, DNS, etc.)
- [ ] Used appropriate tcpdump filter
- [ ] Triggered the event being diagnosed
- [ ] Stopped capture after sufficient data collected
- [ ] Analyzed for expected vs. actual behavior
- [ ] Documented findings and next steps

## Troubleshooting Decision Tree

```
Network Issue
       │
       ▼
Can ping 8.8.8.8?
       │
  ┌────┴────┐
 No        Yes
  │         │
  │         ▼
  │    Can resolve auvik.com?
  │         │
  │    ┌────┴────┐
  │   No        Yes
  │    │         │
  │    │         ▼
  │    │    Can curl https://auvik.com?
  │    │         │
  │    │    ┌────┴────┐
  │    │   No        Yes
  │    │    │         │
  │    │    │         ▼
  │    │    │    Can SNMP devices?
  │    │    │         │
  │    │    │    ┌────┴────┐
  │    │    │   No        Yes
  │    │    │    │         │
  │    │    │    │         ▼
  │    │    │    │    Network OK
  │    │    │    │    Check app layer
  │    │    │    │
  │    │    │    ▼
  │    │    │   VLAN/ACL issue
  │    │    │   → Check routing
  │    │    │
  │    │    ▼
  │    │   SSL inspection or
  │    │   firewall blocking HTTPS
  │    │   → Check certificate/bypass
  │    │
  │    ▼
  │   DNS failure
  │   → Fix resolv.conf
  │
  ▼
Routing/gateway issue
→ Check ip route, default gateway
```

## Quick Reference

### First Steps (Always Do This)

```bash
# Basic connectivity
ping -c 4 8.8.8.8

# DNS
nslookup auvik.com

# HTTPS
curl -I https://auvik.com

# Check routes
ip route show

# Check DNS config
cat /etc/resolv.conf
```

### When Collector is Offline

```bash
# Test Auvik endpoints
curl -v https://api.auvik.com
curl -v https://collector.auvik.com

# Check for SSL inspection
openssl s_client -connect auvik.com:443 -servername auvik.com </dev/null 2>&1 | grep issuer

# Check collector logs
journalctl -u auvik-collector --since "1 hour ago" | grep -i "error\|fail\|certificate"
```

### When Device Discovery Fails

```bash
# Test SNMP to device
snmpwalk -v2c -c public <device-ip> sysDescr

# Check VLAN routing
ping <device-on-different-vlan>
traceroute <device-on-different-vlan>

# Verify inter-VLAN connectivity
ip route show
```

## Related Documentation

- [Collector Offline](/docs/troubleshooting/collector-offline) — When collector shows offline in portal
- [Firewall Rules](/docs/network/firewall-rules) — Required firewall configuration
- [Common Issues](/docs/troubleshooting/common-issues) — Quick reference for frequent problems

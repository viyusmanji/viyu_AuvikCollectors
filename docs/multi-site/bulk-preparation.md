---
sidebar_position: 2
---

# Bulk Golden Image Preparation

Efficient workflows for preparing multiple Raspberry Pi collectors simultaneously for large-scale deployments.

## Overview

When deploying to 5+ sites at once, bulk preparation saves significant time by parallelizing imaging, testing, and customization tasks. This guide covers batch imaging, parallel preparation workflows, and efficiency strategies.

## Bulk Preparation Workflow

### Phase 1: Batch Hardware Assembly

Assemble all Pis in production-line fashion:

| Task | Batch Size | Time per Unit | Total Time (10 units) |
|------|------------|---------------|----------------------|
| PoE HAT installation | 10 | 2 min | 20 min |
| Case assembly | 10 | 1 min | 10 min |
| Quality check | 10 | 30 sec | 5 min |
| **Total** | | | **35 min** |

**Tips:**
- Clear workspace with organized component bins
- Assembly jig or foam pad to prevent scratches
- Label cases immediately after assembly with sequential numbers

### Phase 2: Parallel Golden Image Cloning

Clone golden image to multiple microSD cards simultaneously.

#### Equipment Needed

| Item | Quantity | Purpose |
|------|----------|---------|
| USB SD card readers | 4-8 | Simultaneous imaging |
| High-speed microSD cards (A2) | Per deployment | Target media |
| Golden image file | 1 | Source image |
| USB hub (powered) | 1 | Connect multiple readers |

#### Multi-Card Imaging

**Method 1: Raspberry Pi Imager (Sequential)**

Best for 1-4 cards with user oversight:

1. Insert first card
2. Select golden image
3. Write and verify
4. Remove and insert next card
5. Repeat

Time: ~8 minutes per card

**Method 2: balenaEtcher (Parallel)**

Best for 5+ cards:

1. Connect 4-8 USB card readers to powered hub
2. Insert microSD cards into all readers
3. Launch balenaEtcher
4. Select golden image
5. Select **all target drives** (verify carefully!)
6. Flash

Time: ~8 minutes total (regardless of card count)

**Method 3: `dd` with GNU Parallel (Advanced)**

For experienced users with Linux/macOS:

```bash
# List all SD card devices
lsblk

# Create a list of target devices (VERIFY CAREFULLY!)
echo "/dev/sdb /dev/sdc /dev/sdd /dev/sde" | tr ' ' '\n' > targets.txt

# Parallel imaging
parallel -j 4 'sudo dd if=golden-image.img of={} bs=4M status=progress && sync' :::: targets.txt
```

⚠️ **WARNING**: Double-check device names. Wrong target = data loss!

Time: ~8 minutes total for up to 4 cards

### Phase 3: Parallel Boot Testing

Test all imaged cards simultaneously:

#### Test Setup

1. **Power**: Use multi-port USB-C charger (65W+ with PD)
2. **Network**: Connect all Pis to test switch
3. **Access**: SSH via local network or use monitor/keyboard rotation

#### Boot Test Procedure

```bash
# From management machine, test SSH access to all Pis
for i in {1..10}; do
  echo "Testing Pi $i..."
  ssh -o ConnectTimeout=5 viyuadmin@10.1.1.5$i "hostname" &
done
wait
```

**Pass Criteria:**
- Pi boots to login prompt (or SSH accessible)
- Green LED solid (power good)
- Amber LED flashing (network activity)
- Responds to ping within 60 seconds

### Phase 4: Batch Customization

Customize multiple Pis efficiently using automation.

#### Customization Data Preparation

Create a CSV with deployment details:

```csv
hostname,ip,gateway,subnet,timezone,auvik_token,client,site
auvik-acme-hq,10.1.1.50,10.1.1.1,24,America/Chicago,abc123xyz,Acme Corp,Headquarters
auvik-acme-branch1,10.2.1.50,10.2.1.1,24,America/Chicago,def456uvw,Acme Corp,Branch 1
auvik-globex-dc,10.10.1.50,10.10.1.1,24,America/New_York,ghi789rst,Globex,Data Center
```

Save as `deployments.csv`

#### Parallel Customization Script

```bash
#!/bin/bash
# bulk-customize.sh - Customize multiple Pis from CSV

CSV_FILE="deployments.csv"

# Skip header, read each line
tail -n +2 "$CSV_FILE" | while IFS=, read -r hostname ip gateway subnet timezone auvik_token client site; do
  echo "Customizing $hostname..."

  # SSH to auvik-TEMPLATE (assumes all are on test network with sequential IPs)
  ssh viyuadmin@auvik-TEMPLATE << EOF
    # Set hostname
    sudo hostnamectl set-hostname "$hostname"
    sudo sed -i 's/auvik-TEMPLATE/$hostname/' /etc/hosts

    # Configure IP
    sudo nmcli con mod "Wired connection 1" \
      ipv4.method manual \
      ipv4.addresses "$ip/$subnet" \
      ipv4.gateway "$gateway" \
      ipv4.dns "$gateway 8.8.8.8"

    # Set timezone
    sudo timedatectl set-timezone "$timezone"

    # Apply network changes
    sudo nmcli con down "Wired connection 1"
    sudo nmcli con up "Wired connection 1"

    # Install Auvik collector
    curl -sSL https://install.auvik.com | sudo bash -s -- --token "$auvik_token"
EOF

  echo "$hostname customized. Waiting for reboot..."
  sleep 120

done

echo "Bulk customization complete!"
```

Make executable:
```bash
chmod +x bulk-customize.sh
```

#### Parallel Execution Strategy

**Option 1: Sequential (Safest)**
Run script as-is. Each Pi completes before next starts.
- Time: ~5 min × number of Pis
- Pros: Easy to monitor, debug issues immediately
- Cons: Slower for large batches

**Option 2: Parallel (Faster)**
Use GNU Parallel or background jobs:

```bash
#!/bin/bash
# bulk-customize-parallel.sh

CSV_FILE="deployments.csv"

customize_pi() {
  local hostname=$1
  local ip=$2
  local gateway=$3
  local subnet=$4
  local timezone=$5
  local auvik_token=$6

  echo "[$hostname] Starting customization..."

  ssh viyuadmin@auvik-TEMPLATE << EOF
    sudo hostnamectl set-hostname "$hostname"
    sudo sed -i 's/auvik-TEMPLATE/$hostname/' /etc/hosts
    sudo nmcli con mod "Wired connection 1" ipv4.method manual ipv4.addresses "$ip/$subnet" ipv4.gateway "$gateway" ipv4.dns "$gateway 8.8.8.8"
    sudo timedatectl set-timezone "$timezone"
    sudo nmcli con down "Wired connection 1" && sudo nmcli con up "Wired connection 1"
    curl -sSL https://install.auvik.com | sudo bash -s -- --token "$auvik_token"
EOF

  echo "[$hostname] Complete!"
}

export -f customize_pi

# Parallel execution (4 at a time)
tail -n +2 "$CSV_FILE" | parallel -j 4 --colsep ',' customize_pi {1} {2} {3} {4} {5} {6}
```

- Time: ~5 min total (for batches of 4)
- Pros: Much faster for large deployments
- Cons: Harder to debug if issues occur

### Phase 5: Batch Quality Control

Verify all Pis before packaging:

```bash
#!/bin/bash
# verify-batch.sh

HOSTNAMES=(
  "auvik-acme-hq"
  "auvik-acme-branch1"
  "auvik-globex-dc"
)

echo "Batch Verification Report"
echo "========================="
echo ""

for hostname in "${HOSTNAMES[@]}"; do
  echo "Testing: $hostname"

  # Test SSH
  if ssh -o ConnectTimeout=5 viyuadmin@$hostname "echo 'SSH OK'" &> /dev/null; then
    echo "  ✓ SSH accessible"
  else
    echo "  ✗ SSH FAILED"
    continue
  fi

  # Verify hostname
  actual_hostname=$(ssh viyuadmin@$hostname "hostname")
  if [ "$actual_hostname" == "$hostname" ]; then
    echo "  ✓ Hostname correct"
  else
    echo "  ✗ Hostname mismatch: $actual_hostname"
  fi

  # Check Auvik
  if ssh viyuadmin@$hostname "systemctl is-active auvik-collector" | grep -q "active"; then
    echo "  ✓ Auvik collector running"
  else
    echo "  ✗ Auvik collector not running"
  fi

  # Check Tailscale
  if ssh viyuadmin@$hostname "tailscale status" | grep -q "$hostname"; then
    echo "  ✓ Tailscale connected"
  else
    echo "  ✗ Tailscale not connected"
  fi

  echo ""
done

echo "Verification complete!"
```

### Phase 6: Documentation and Labeling

Batch generate asset labels:

```bash
#!/bin/bash
# generate-labels.sh - Create label text files for printing

CSV_FILE="deployments.csv"
OUTPUT_DIR="labels"

mkdir -p "$OUTPUT_DIR"

tail -n +2 "$CSV_FILE" | while IFS=, read -r hostname ip gateway subnet timezone auvik_token client site; do
  cat > "$OUTPUT_DIR/$hostname.txt" << EOF
viyu.net - Auvik Collector
═══════════════════════════
Hostname: $hostname
IP: $ip/$subnet
Client: $client
Site: $site
Deployed: $(date +%Y-%m-%d)
EOF

  echo "Label created: $OUTPUT_DIR/$hostname.txt"
done

echo ""
echo "Print labels from $OUTPUT_DIR/ and apply to devices"
```

Print all labels at once, then apply during final packaging.

## Efficiency Tips

### Time-Saving Strategies

| Task | Traditional (10 Pis) | Bulk Method (10 Pis) | Time Saved |
|------|----------------------|----------------------|------------|
| Image cloning | 80 min (serial) | 8 min (parallel) | **72 min** |
| Boot testing | 20 min (serial) | 5 min (parallel) | **15 min** |
| Customization | 50 min (serial) | 12 min (parallel) | **38 min** |
| QA verification | 30 min (manual) | 5 min (script) | **25 min** |
| **Total** | **180 min** | **30 min** | **150 min** |

**6× faster** for bulk deployments!

### Workspace Organization

**Station Layout:**

```
┌─────────────────────────────────────────────┐
│  [Imaging Station]                          │
│  - Laptop with balenaEtcher                 │
│  - 8× USB card readers                      │
│  - Powered USB hub                          │
│  - Golden image file                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  [Test Station]                             │
│  - Network switch (16-port)                 │
│  - Multi-port USB-C charger                 │
│  - SSH terminal for batch commands          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  [Packaging Station]                        │
│  - Printed labels                           │
│  - Shipping boxes                           │
│  - Patch cables                             │
│  - Backup USB-C PSUs                        │
└─────────────────────────────────────────────┘
```

### Quality Control Checklist

Create a physical checklist for each batch:

```
Batch #: _______    Date: ___________    Qty: _______

Hardware Assembly
[ ] All PoE HATs installed correctly
[ ] Cases assembled and closed
[ ] No physical damage
[ ] Sequential labels applied (1-10)

Imaging
[ ] Golden image verified (checksum)
[ ] All cards imaged successfully
[ ] Spot-check boot test passed (3 random units)

Customization
[ ] CSV data file reviewed and correct
[ ] All hostnames unique and follow convention
[ ] All IPs within correct subnets
[ ] Auvik tokens valid and site-specific
[ ] Customization script completed without errors

Quality Verification
[ ] All units respond to SSH
[ ] All units have correct hostnames
[ ] All Auvik collectors online in portal
[ ] All Tailscale connections active
[ ] Random spot-check: full functionality test (2 units)

Documentation
[ ] Asset labels printed
[ ] Asset labels applied to all units
[ ] Client documentation updated with all deployment details
[ ] CSV file archived for records

Packaging
[ ] All units shut down cleanly
[ ] Patch cables included (1 per unit)
[ ] Backup PSUs packed (1 per tech)
[ ] Shipping labels applied
[ ] Batch tracking number: __________

Sign-off
Tech: _______________    Date: ___________
QA: _________________    Date: ___________
```

## Scaling Considerations

### Small Batch (2-4 units)

- **Method**: Sequential with manual oversight
- **Time**: ~15 min per unit
- **Approach**: Raspberry Pi Imager, manual customization
- **Best for**: Testing new procedures, one-off projects

### Medium Batch (5-15 units)

- **Method**: Parallel imaging, scripted customization
- **Time**: ~3-5 min per unit
- **Approach**: balenaEtcher, bash scripts, batch QA
- **Best for**: Multi-site clients, monthly deployments

### Large Batch (16+ units)

- **Method**: Full automation pipeline
- **Time**: ~2 min per unit
- **Approach**: Advanced tooling (Ansible, parallel `dd`), automated testing
- **Best for**: MSP-wide rollouts, annual refreshes
- **Consider**: Dedicated imaging station, inventory management system

## Advanced: Automated Testing Framework

For large-scale operations, implement automated testing:

```bash
#!/bin/bash
# automated-qa.sh - Comprehensive automated testing

test_pi() {
  local hostname=$1
  local expected_ip=$2
  local result="PASS"

  echo "Testing $hostname..."

  # SSH connectivity
  timeout 10 ssh -o ConnectTimeout=5 viyuadmin@$hostname "exit" || result="FAIL: SSH"

  # Hostname verification
  actual_hostname=$(ssh viyuadmin@$hostname "hostname" 2>/dev/null)
  [ "$actual_hostname" != "$hostname" ] && result="FAIL: Hostname"

  # IP verification
  actual_ip=$(ssh viyuadmin@$hostname "ip -4 addr show eth0 | grep inet | awk '{print \$2}' | cut -d/ -f1" 2>/dev/null)
  [ "$actual_ip" != "$expected_ip" ] && result="FAIL: IP"

  # Auvik collector
  ssh viyuadmin@$hostname "systemctl is-active auvik-collector" | grep -q "active" || result="FAIL: Auvik"

  # Tailscale
  ssh viyuadmin@$hostname "tailscale status" | grep -q "100\." || result="FAIL: Tailscale"

  # Internet connectivity
  ssh viyuadmin@$hostname "ping -c 2 8.8.8.8 &> /dev/null" || result="FAIL: Internet"

  echo "$hostname,$result" >> qa-results.csv
}

export -f test_pi

# Run tests in parallel
echo "hostname,result" > qa-results.csv
parallel -j 4 --colsep ',' test_pi {1} {2} :::: deployments.csv

# Report
echo ""
echo "QA Results:"
column -t -s ',' qa-results.csv
```

## Troubleshooting Bulk Operations

### Issue: Imaging fails on multiple cards

**Causes:**
- Bad USB hub (insufficient power)
- Counterfeit/low-quality microSD cards
- Corrupted golden image

**Solutions:**
1. Use powered USB hub (check power LED)
2. Test cards individually to isolate bad units
3. Verify golden image checksum
4. Try different USB ports or hub

### Issue: Some Pis won't boot after imaging

**Causes:**
- Incomplete image write
- Defective microSD card
- Hardware issue

**Solutions:**
1. Re-image affected cards with verification enabled
2. Swap microSD card to different Pi to isolate hardware vs. card issue
3. Check for physical damage to card or Pi

### Issue: Auvik collector installation fails on multiple units

**Causes:**
- Network connectivity issue
- Invalid Auvik token
- Rate limiting from Auvik servers

**Solutions:**
1. Verify internet access: `ping 8.8.8.8`
2. Check DNS: `nslookup auvik.com`
3. Verify token validity in Auvik portal
4. Stagger installations (wait 30 sec between units)

### Issue: Parallel customization script hangs

**Causes:**
- SSH key authentication not set up
- Network timeout
- Too many parallel jobs

**Solutions:**
1. Set up SSH key authentication beforehand
2. Increase timeout values in script
3. Reduce parallelism (`-j 2` instead of `-j 4`)
4. Check switch has enough capacity for all connections

## Best Practices

1. **Always verify golden image checksum** before batch imaging
2. **Label cards immediately** after imaging (before customization)
3. **Test in small batches first** (2-3 units) before full-scale
4. **Keep detailed logs** of all batch operations
5. **Maintain spare units** (10% extra) for replacements
6. **Document failures immediately** to improve process
7. **Version your automation scripts** in Git
8. **Archive CSV files** with deployment details for auditing

## Next Steps

After bulk preparation:
- [Pre-Deployment Checklist](../deployment/pre-deployment.md) — Final verification before shipping
- [On-Site Installation](../deployment/on-site.md) — Field deployment procedures
- [Multi-Site Coordination](./overview.md) — Project management for large deployments

---
sidebar_position: 5
---

# Batch Customization Scripts

Automate collector customization for multiple sites using CSV/spreadsheet data.

## Overview

When deploying collectors to many sites, manually customizing each one is time-consuming and error-prone. These batch scripts read site configuration from a CSV file and automate the customization process.

## CSV Configuration Format

Create a CSV file with site details. Each row represents one collector.

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| `hostname` | Full collector hostname | `auvik-acme-hq` |
| `ip_address` | Static IP address | `10.1.1.50` |
| `subnet` | Subnet mask in CIDR | `24` |
| `gateway` | Default gateway IP | `10.1.1.1` |
| `timezone` | Timezone identifier | `America/Chicago` |
| `auvik_token` | Auvik site install token | `abcd1234...` |
| `client` | Client name | `Acme Corp` |
| `site` | Site name | `Headquarters` |

### Optional Columns

| Column | Description | Example |
|--------|-------------|---------|
| `dns_primary` | Primary DNS server | `10.1.1.1` |
| `dns_secondary` | Secondary DNS server | `8.8.8.8` |
| `vlan` | VLAN ID | `100` |
| `deploy_date` | Deployment date | `2026-02-03` |
| `mac_address` | MAC address (for records) | `d8:3a:dd:xx:xx:xx` |
| `serial_number` | Pi serial number | `10000000a1b2c3d4` |

### Example CSV File

Save as `sites.csv`:

```csv
hostname,ip_address,subnet,gateway,timezone,auvik_token,client,site,dns_primary,dns_secondary,vlan
auvik-acme-hq,10.1.1.50,24,10.1.1.1,America/Chicago,tk_acme_hq_abc123,Acme Corp,Headquarters,10.1.1.1,8.8.8.8,100
auvik-acme-branch1,10.2.1.50,24,10.2.1.1,America/Chicago,tk_acme_br1_def456,Acme Corp,Branch 1,10.2.1.1,8.8.8.8,200
auvik-globex-dc,172.16.10.50,24,172.16.10.1,America/New_York,tk_globex_dc_ghi789,Globex Inc,Data Center,172.16.10.1,1.1.1.1,10
auvik-initech-main,192.168.1.50,24,192.168.1.1,America/Los_Angeles,tk_initech_mn_jkl012,Initech LLC,Main Office,192.168.1.1,8.8.4.4,1
```

## Batch Customization Script

### Main Script: `batch-customize.sh`

Save this script to your workstation (not on the Pis):

```bash
#!/bin/bash
# batch-customize.sh - Configure multiple collectors from CSV

set -e

CSV_FILE="${1:-sites.csv}"
CURRENT_ROW=0

if [[ ! -f "$CSV_FILE" ]]; then
    echo "Error: CSV file not found: $CSV_FILE"
    echo "Usage: $0 [sites.csv]"
    exit 1
fi

echo "Batch Collector Customization"
echo "=============================="
echo "CSV file: $CSV_FILE"
echo ""

# Read CSV header
IFS=',' read -r -a HEADERS < "$CSV_FILE"

# Process each site
tail -n +2 "$CSV_FILE" | while IFS=',' read -r -a VALUES; do
    CURRENT_ROW=$((CURRENT_ROW + 1))

    # Parse row into associative array
    declare -A SITE
    for i in "${!HEADERS[@]}"; do
        SITE[${HEADERS[$i]}]="${VALUES[$i]}"
    done

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Site $CURRENT_ROW: ${SITE[hostname]}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Client: ${SITE[client]}"
    echo "Site: ${SITE[site]}"
    echo "IP: ${SITE[ip_address]}/${SITE[subnet]}"
    echo "Gateway: ${SITE[gateway]}"
    echo "Timezone: ${SITE[timezone]}"
    echo ""

    # Prompt for confirmation
    read -p "Customize this site now? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipped."
        echo ""
        continue
    fi

    # Prompt for Pi IP (before customization)
    read -p "Enter current Pi IP address or hostname: " PI_HOST

    # Test connection
    if ! ssh -o ConnectTimeout=5 viyuadmin@"$PI_HOST" "echo Connected" &>/dev/null; then
        echo "Error: Cannot connect to $PI_HOST"
        echo "Skipping this site."
        echo ""
        continue
    fi

    echo "Applying customization..."

    # Generate and execute remote script
    ssh viyuadmin@"$PI_HOST" "bash -s" <<EOF
set -e

# Set hostname
sudo hostnamectl set-hostname "${SITE[hostname]}"
sudo sed -i 's/auvik-TEMPLATE/${SITE[hostname]}/' /etc/hosts

# Configure network
DNS_SERVERS="${SITE[dns_primary]:-${SITE[gateway]}} ${SITE[dns_secondary]:-8.8.8.8}"
sudo nmcli con mod "Wired connection 1" \\
  ipv4.method manual \\
  ipv4.addresses "${SITE[ip_address]}/${SITE[subnet]}" \\
  ipv4.gateway "${SITE[gateway]}" \\
  ipv4.dns "\$DNS_SERVERS"

# Set timezone
sudo timedatectl set-timezone "${SITE[timezone]}"

# Apply network changes
sudo nmcli con down "Wired connection 1" || true
sleep 2
sudo nmcli con up "Wired connection 1"

echo "Base customization complete!"
EOF

    echo "✓ Hostname, IP, and timezone configured"
    echo ""
    echo "Wait 10 seconds for network to stabilize..."
    sleep 10

    # Reconnect with new IP and install Auvik
    echo "Installing Auvik collector at ${SITE[ip_address]}..."
    if ssh -o ConnectTimeout=10 viyuadmin@"${SITE[ip_address]}" "bash -s" <<EOF
curl -sSL https://install.auvik.com | sudo bash -s -- --token "${SITE[auvik_token]}"
EOF
    then
        echo "✓ Auvik collector installed"
    else
        echo "⚠ Could not install Auvik collector (may need manual installation)"
    fi

    echo ""
    echo "✓ Site ${SITE[hostname]} customization complete!"
    echo ""

done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Batch customization finished!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

Make the script executable:

```bash
chmod +x batch-customize.sh
```

### Usage

1. **Prepare CSV file** with all site configurations
2. **Boot each Pi** from the golden image with DHCP
3. **Run the script:**

```bash
./batch-customize.sh sites.csv
```

4. **For each site:**
   - Review the details displayed
   - Confirm customization (y/n)
   - Enter the Pi's current IP/hostname
   - Script applies all settings
   - Moves to next site

## Advanced: Unattended Batch Customization

For fully automated deployment (no prompts), use this version:

### `batch-customize-auto.sh`

```bash
#!/bin/bash
# batch-customize-auto.sh - Fully automated batch customization

set -e

CSV_FILE="${1:-sites.csv}"
LOG_FILE="batch-customize-$(date +%Y%m%d-%H%M%S).log"

if [[ ! -f "$CSV_FILE" ]]; then
    echo "Error: CSV file not found: $CSV_FILE"
    exit 1
fi

exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo "Starting batch customization: $(date)"
echo "CSV: $CSV_FILE"
echo "Log: $LOG_FILE"
echo ""

# Read CSV header
IFS=',' read -r -a HEADERS < "$CSV_FILE"

SUCCESS_COUNT=0
FAIL_COUNT=0

# Process each site
tail -n +2 "$CSV_FILE" | while IFS=',' read -r -a VALUES; do
    declare -A SITE
    for i in "${!HEADERS[@]}"; do
        SITE[${HEADERS[$i]}]="${VALUES[$i]}"
    done

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[$(date +%H:%M:%S)] Processing: ${SITE[hostname]}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Detect Pi via mDNS (assumes booted with DHCP)
    PI_HOST="${SITE[hostname]}.local"

    # Wait for Pi to be reachable
    echo "Waiting for $PI_HOST to be reachable..."
    TIMEOUT=60
    while ! ping -c 1 -W 1 "$PI_HOST" &>/dev/null; do
        TIMEOUT=$((TIMEOUT - 1))
        if [[ $TIMEOUT -le 0 ]]; then
            echo "✗ ERROR: $PI_HOST not reachable"
            FAIL_COUNT=$((FAIL_COUNT + 1))
            continue 2
        fi
        sleep 1
    done

    echo "✓ $PI_HOST reachable"

    # Apply customization
    if ssh -o StrictHostKeyChecking=no viyuadmin@"$PI_HOST" "bash -s" <<EOF
set -e
sudo hostnamectl set-hostname "${SITE[hostname]}"
sudo sed -i 's/auvik-TEMPLATE/${SITE[hostname]}/' /etc/hosts
DNS_SERVERS="${SITE[dns_primary]:-${SITE[gateway]}} ${SITE[dns_secondary]:-8.8.8.8}"
sudo nmcli con mod "Wired connection 1" \\
  ipv4.method manual \\
  ipv4.addresses "${SITE[ip_address]}/${SITE[subnet]}" \\
  ipv4.gateway "${SITE[gateway]}" \\
  ipv4.dns "\$DNS_SERVERS"
sudo timedatectl set-timezone "${SITE[timezone]}"
sudo nmcli con down "Wired connection 1" || true
sleep 2
sudo nmcli con up "Wired connection 1"
EOF
    then
        echo "✓ Base customization applied"
    else
        echo "✗ ERROR: Base customization failed"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi

    # Wait for network
    sleep 10

    # Install Auvik
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 viyuadmin@"${SITE[ip_address]}" \
        "curl -sSL https://install.auvik.com | sudo bash -s -- --token '${SITE[auvik_token]}'"; then
        echo "✓ Auvik collector installed"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo "⚠ Auvik installation failed (may need manual intervention)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi

    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Batch customization complete: $(date)"
echo "Success: $SUCCESS_COUNT"
echo "Failed: $FAIL_COUNT"
echo "Log: $LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

This version:
- Runs without user prompts
- Auto-detects Pis via mDNS
- Logs all output to timestamped file
- Reports success/failure counts

## Label Generation Script

Generate asset labels from CSV data:

### `generate-labels.sh`

```bash
#!/bin/bash
# generate-labels.sh - Generate printable asset labels from CSV

CSV_FILE="${1:-sites.csv}"
OUTPUT_FILE="labels-$(date +%Y%m%d).txt"

if [[ ! -f "$CSV_FILE" ]]; then
    echo "Error: CSV file not found: $CSV_FILE"
    exit 1
fi

echo "Generating labels from $CSV_FILE..."
echo "Output: $OUTPUT_FILE"

# Read header
IFS=',' read -r -a HEADERS < "$CSV_FILE"

# Generate labels
{
    tail -n +2 "$CSV_FILE" | while IFS=',' read -r -a VALUES; do
        declare -A SITE
        for i in "${!HEADERS[@]}"; do
            SITE[${HEADERS[$i]}]="${VALUES[$i]}"
        done

        cat <<LABEL

════════════════════════════════════════
viyu.net - Auvik Collector
════════════════════════════════════════
Hostname: ${SITE[hostname]}
IP: ${SITE[ip_address]}/${SITE[subnet]}
Gateway: ${SITE[gateway]}
────────────────────────────────────────
Client: ${SITE[client]}
Site: ${SITE[site]}
VLAN: ${SITE[vlan]:-N/A}
────────────────────────────────────────
Deployed: ${SITE[deploy_date]:-TBD}
════════════════════════════════════════


LABEL
    done
} > "$OUTPUT_FILE"

echo "✓ Labels generated: $OUTPUT_FILE"
echo "Print this file and cut along the lines."
```

Usage:

```bash
./generate-labels.sh sites.csv
lp labels-20260203.txt  # Print to default printer
```

## Documentation Export Script

Export deployment details to documentation format:

### `export-documentation.sh`

```bash
#!/bin/bash
# export-documentation.sh - Export site details to markdown table

CSV_FILE="${1:-sites.csv}"
OUTPUT_FILE="deployment-inventory-$(date +%Y%m%d).md"

if [[ ! -f "$CSV_FILE" ]]; then
    echo "Error: CSV file not found: $CSV_FILE"
    exit 1
fi

{
    echo "# Auvik Collector Deployment Inventory"
    echo ""
    echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "| Hostname | Client | Site | IP Address | Gateway | Timezone | VLAN | Deploy Date |"
    echo "|----------|--------|------|------------|---------|----------|------|-------------|"

    # Read header
    IFS=',' read -r -a HEADERS < "$CSV_FILE"

    # Export rows
    tail -n +2 "$CSV_FILE" | while IFS=',' read -r -a VALUES; do
        declare -A SITE
        for i in "${!HEADERS[@]}"; do
            SITE[${HEADERS[$i]}]="${VALUES[$i]}"
        done

        echo "| \`${SITE[hostname]}\` | ${SITE[client]} | ${SITE[site]} | ${SITE[ip_address]}/${SITE[subnet]} | ${SITE[gateway]} | ${SITE[timezone]} | ${SITE[vlan]:-N/A} | ${SITE[deploy_date]:-TBD} |"
    done

    echo ""
    echo "## Quick Stats"
    echo ""
    TOTAL=$(tail -n +2 "$CSV_FILE" | wc -l | tr -d ' ')
    echo "- Total collectors: $TOTAL"
    echo "- Clients: $(tail -n +2 "$CSV_FILE" | cut -d',' -f7 | sort -u | wc -l | tr -d ' ')"
    echo ""

} > "$OUTPUT_FILE"

echo "✓ Documentation exported: $OUTPUT_FILE"
```

Output can be pasted into your documentation platform.

## Spreadsheet Tips

### Excel/Google Sheets Template

Create a template spreadsheet with:

1. **Sheet 1: Sites** — Main site list (export to CSV)
2. **Sheet 2: Reference** — Dropdowns for timezones, naming conventions
3. **Sheet 3: Validation** — Data validation rules

**Pro tip:** Use Excel's "Export to CSV" to generate the sites.csv file.

### Data Validation

Add these Excel formulas for validation:

**Check IP format:**
```excel
=AND(LEN(B2)-LEN(SUBSTITUTE(B2,".",""))=3, ISNUMBER(VALUE(LEFT(B2,FIND(".",B2)-1))))
```

**Check hostname format:**
```excel
=AND(LEFT(A2,6)="auvik-", LEN(A2)>7, NOT(ISNUMBER(SEARCH(" ",A2))))
```

**Auto-generate hostname:**
```excel
=CONCATENATE("auvik-", LOWER(SUBSTITUTE(G2," ","")), "-", LOWER(SUBSTITUTE(H2," ","")))
```

## Workflow Summary

### Full Multi-Site Deployment Workflow

1. **Planning Phase:**
   - Gather site information from client
   - Fill out sites.csv spreadsheet
   - Validate all data

2. **Preparation Phase:**
   - Clone golden images to SD cards
   - Generate asset labels: `./generate-labels.sh sites.csv`
   - Print labels and prepare shipping

3. **Deployment Phase:**
   - Ship Pis to sites
   - Instruct on-site tech to connect to network
   - Run batch customization: `./batch-customize.sh sites.csv`
   - Or fully automated: `./batch-customize-auto.sh sites.csv`

4. **Documentation Phase:**
   - Export inventory: `./export-documentation.sh sites.csv`
   - Update documentation platform
   - Verify all collectors online in Auvik

## Troubleshooting

### Connection Issues

If script can't connect to a Pi:

```bash
# Test connectivity
ping auvik-TEMPLATE.local

# Test SSH
ssh viyuadmin@auvik-TEMPLATE.local

# Check SSH keys
ssh-copy-id viyuadmin@auvik-TEMPLATE.local
```

### CSV Parsing Errors

If script fails to parse CSV:

- Ensure no commas in data fields (use semicolons instead)
- Remove any blank lines
- Verify column count matches across all rows
- Check for proper UTF-8 encoding

### Network Timing Issues

If network changes don't apply:

- Increase sleep delays in script (line: `sleep 10`)
- Manually restart networking: `sudo systemctl restart NetworkManager`
- Check for DHCP conflicts on target network

## Best Practices

### Security

- **Never commit CSV files with tokens to git**
- Store `sites.csv` in encrypted vault
- Use `.gitignore` to exclude sensitive files:

```gitignore
sites.csv
sites-*.csv
*-tokens.csv
```

### CSV Management

- Keep a master spreadsheet with all sites
- Export CSV only when needed
- Use version control for template (without tokens)
- Back up completed CSVs after deployment

### Logging

All scripts log to files. Review logs for issues:

```bash
# View latest batch log
tail -f batch-customize-*.log

# Search for errors
grep -i error batch-customize-*.log
```

### Verification

After batch customization:

- [ ] All hostnames changed from `auvik-TEMPLATE`
- [ ] All Pis reachable at new static IPs
- [ ] All collectors online in Auvik portal
- [ ] Tailscale connections established
- [ ] Documentation platform updated
- [ ] Asset labels applied

## Next Steps

After batch customization:

1. **Verify fleet status** — See [Fleet Management](fleet-management.md)
2. **Monitor deployments** — Check Auvik portal for all collectors
3. **Update documentation** — Import generated inventory
4. **Schedule follow-ups** — Plan first maintenance window

---

**Related Guides:**
- [Bulk Preparation](bulk-preparation.md) — Preparing many SD cards
- [Fleet Management](fleet-management.md) — Managing deployed collectors
- [Naming Conventions](naming-conventions.md) — Hostname standards

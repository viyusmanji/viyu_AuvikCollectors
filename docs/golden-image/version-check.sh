#!/bin/bash
# version-check.sh - Display golden image version and software information
#
# This script outputs the golden image version, build date, and installed
# software versions for troubleshooting and deployment verification.

echo "════════════════════════════════════════════════════════════"
echo "  Golden Image Version Information"
echo "════════════════════════════════════════════════════════════"
echo ""

# Golden Image Version (update this with each release)
GOLDEN_VERSION="1.0.0"
BUILD_DATE="2026-02-03"

echo "Golden Image Version: v${GOLDEN_VERSION}"
echo "Build Date: ${BUILD_DATE}"
echo ""

echo "────────────────────────────────────────────────────────────"
echo "  System Information"
echo "────────────────────────────────────────────────────────────"

# Hostname
echo "Hostname: $(hostname)"

# Operating System
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "OS: ${PRETTY_NAME}"
fi

# Kernel Version
echo "Kernel: $(uname -r)"

# Architecture
echo "Architecture: $(uname -m)"

# Raspberry Pi Model
if [ -f /proc/device-tree/model ]; then
    echo "Hardware: $(tr -d '\0' < /proc/device-tree/model)"
fi

echo ""

echo "────────────────────────────────────────────────────────────"
echo "  Software Versions"
echo "────────────────────────────────────────────────────────────"

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    echo "Python: ${PYTHON_VERSION}"
else
    echo "Python: Not installed"
fi

# Tailscale
if command -v tailscale &> /dev/null; then
    TAILSCALE_VERSION=$(tailscale version 2>&1 | head -n1 | awk '{print $1}')
    echo "Tailscale: ${TAILSCALE_VERSION}"

    # Tailscale status
    if tailscale status &> /dev/null; then
        echo "  Status: Connected"
    else
        echo "  Status: Not connected"
    fi
else
    echo "Tailscale: Not installed"
fi

# UFW (Uncomplicated Firewall)
if command -v ufw &> /dev/null; then
    UFW_VERSION=$(ufw version 2>&1 | grep -oP '\d+\.\d+\.\d+' | head -n1)
    echo "UFW: ${UFW_VERSION}"

    # UFW status
    UFW_STATUS=$(sudo ufw status 2>&1 | grep "Status:" | awk '{print $2}')
    echo "  Status: ${UFW_STATUS}"
else
    echo "UFW: Not installed"
fi

# unattended-upgrades
if command -v dpkg &> /dev/null; then
    if dpkg -l 2>/dev/null | grep -q unattended-upgrades; then
        UNATTENDED_VERSION=$(dpkg -l 2>/dev/null | grep unattended-upgrades | awk '{print $3}')
        echo "unattended-upgrades: ${UNATTENDED_VERSION}"
    else
        echo "unattended-upgrades: Not installed"
    fi
else
    echo "unattended-upgrades: N/A (non-Debian system)"
fi

# Docker (optional, may not be in golden image)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo "Docker: ${DOCKER_VERSION}"
else
    echo "Docker: Not included (install per-site if needed)"
fi

# Auvik Collector
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet auvik-collector 2>/dev/null; then
        echo "Auvik Collector: Installed and running"
    elif systemctl list-unit-files 2>/dev/null | grep -q auvik-collector; then
        echo "Auvik Collector: Installed but not running"
    else
        echo "Auvik Collector: Not installed (install during deployment)"
    fi
else
    echo "Auvik Collector: Not installed (install during deployment)"
fi

echo ""

echo "────────────────────────────────────────────────────────────"
echo "  Network Configuration"
echo "────────────────────────────────────────────────────────────"

# Primary IP Address
if hostname -I &> /dev/null; then
    PRIMARY_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    echo "Primary IP: ${PRIMARY_IP}"
else
    # Fallback for systems without hostname -I (like macOS)
    PRIMARY_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | head -n1 | awk '{print $2}')
    echo "Primary IP: ${PRIMARY_IP}"
fi

# Tailscale IP (if connected)
if command -v tailscale &> /dev/null && tailscale status &> /dev/null; then
    TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "N/A")
    echo "Tailscale IP: ${TAILSCALE_IP}"
fi

# Gateway
if command -v ip &> /dev/null; then
    GATEWAY=$(ip route 2>/dev/null | grep default | awk '{print $3}' | head -n1)
    if [ -n "${GATEWAY}" ]; then
        echo "Gateway: ${GATEWAY}"
    fi
else
    # Fallback for systems without ip command
    GATEWAY=$(netstat -rn 2>/dev/null | grep default | awk '{print $2}' | head -n1)
    if [ -n "${GATEWAY}" ]; then
        echo "Gateway: ${GATEWAY}"
    fi
fi

echo ""

echo "────────────────────────────────────────────────────────────"
echo "  System Status"
echo "────────────────────────────────────────────────────────────"

# Uptime
if uptime -p &> /dev/null 2>&1; then
    echo "Uptime: $(uptime -p)"
else
    # Fallback for systems without uptime -p
    UPTIME=$(uptime | sed 's/.*up *//; s/, *[0-9]* user.*//')
    echo "Uptime: ${UPTIME}"
fi

# Load Average
LOAD=$(uptime | sed 's/.*load average: //')
echo "Load Average: ${LOAD}"

# Memory Usage
if command -v free &> /dev/null; then
    MEMORY=$(free -h 2>/dev/null | awk '/^Mem:/ {print $3 " / " $2}')
    echo "Memory Usage: ${MEMORY}"
else
    # Fallback for systems without free command (like macOS)
    if command -v vm_stat &> /dev/null; then
        echo "Memory Usage: (use Activity Monitor on macOS)"
    fi
fi

# Disk Usage
DISK=$(df -h / | awk 'NR==2 {print $3 " / " $2 " (" $5 " used)"}')
echo "Disk Usage: ${DISK}"

# Temperature (Raspberry Pi specific)
if [ -f /sys/class/thermal/thermal_zone0/temp ]; then
    TEMP=$(awk '{printf "%.1f°C", $1/1000}' /sys/class/thermal/thermal_zone0/temp)
    echo "CPU Temperature: ${TEMP}"
fi

echo ""

echo "════════════════════════════════════════════════════════════"
echo ""
echo "For detailed changelog: See docs/golden-image/version-history.md"
echo "For customization: Run ~/customize-collector.sh"
echo ""

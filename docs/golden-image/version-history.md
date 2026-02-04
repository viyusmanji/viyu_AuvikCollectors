---
sidebar_position: 4
---

# Golden Image Version History

Track and manage golden image versions using semantic versioning to ensure consistent, auditable deployments.

:::info Version Control
Each golden image release is versioned and documented to track OS updates, software changes, and configuration modifications. This ensures technicians always deploy known-good configurations and can identify differences between collector generations.
:::

## Semantic Versioning

Golden images follow [Semantic Versioning](https://semver.org/) with the format `MAJOR.MINOR.PATCH`:

| Component | When to Increment | Example Changes |
|-----------|-------------------|-----------------|
| **MAJOR** | Breaking changes requiring site visits or manual intervention | Major OS upgrades (Bookworm → next), hardware platform changes, fundamental architecture changes |
| **MINOR** | New features or significant updates (backward compatible) | New monitoring tools, security hardening, configuration improvements, software version updates |
| **PATCH** | Bug fixes and minor updates | Security patches, documentation corrections, small config tweaks |

### Version Naming Convention

Images are named with version and build date:

```
auvik-golden-v{MAJOR}.{MINOR}.{PATCH}-{YYYY-MM-DD}.img
```

**Examples:**
- `auvik-golden-v1.0.0-2026-02-03.img` — Initial release
- `auvik-golden-v1.1.0-2026-03-15.img` — Added monitoring scripts
- `auvik-golden-v1.1.1-2026-03-20.img` — Fixed SSH key issue

## Version History

| Version | Release Date | Size | Status | Breaking Changes |
|---------|--------------|------|--------|------------------|
| **1.0.0** | 2026-02-03 | ~3.2 GB | Current | Initial Release |

## Detailed Changelog

### Version 1.0.0 (2026-02-03)

**Initial Release** — First production-ready golden image for Raspberry Pi 5 + Auvik deployments.

#### Software Versions

| Component | Version | Notes |
|-----------|---------|-------|
| OS | Raspberry Pi OS Lite (64-bit) Bookworm | Kernel 6.6.x |
| Tailscale | Latest (auto-update enabled) | Installed from official repo |
| UFW | 0.36.2 | Default Bookworm package |
| unattended-upgrades | 2.9.1 | Security patches only |
| watchdog | 5.16 | Default Bookworm package |
| Python | 3.11.2 | System default |
| Docker | Not included | Installed per-site if needed |

#### System Configuration

- **User Account:** `viyuadmin` with sudo privileges
- **SSH:** Key-based authentication only (password disabled)
- **Firewall:** UFW enabled (allow SSH, allow all outbound)
- **Auto-Updates:** Enabled for security patches
- **Watchdog:** Hardware watchdog configured
- **Hostname:** `auvik-TEMPLATE` (placeholder for cloning)
- **Version File:** `/etc/golden-image-version` contains "1.0.0"
- **Version Check Script:** `/usr/local/bin/version-check.sh` for remote version auditing

#### Included Services

- **Tailscale:** Mesh VPN for remote access (requires authentication per-site)
- **SSH Server:** Hardened configuration with key-based auth only
- **Hardware Watchdog:** Automatic recovery on system hang
- **UFW Firewall:** Deny incoming (except SSH), allow outgoing
- **Unattended Upgrades:** Automatic security patch installation
- **NTP:** Time synchronization (systemd-timesyncd)

#### Not Included (Per-Site Installation)

- Auvik collector binary (installed during deployment)
- Client-specific configurations
- Site-specific SSH keys
- Custom monitoring scripts

#### Known Issues

None at release.

#### Security Notes

- Password authentication disabled by default
- Only viyu.net deployment key authorized
- Firewall blocks all incoming except SSH
- Automatic security updates enabled

#### Build Artifacts

**Image File:** `auvik-golden-v1.0.0-2026-02-03.img`
**Size:** ~3.2 GB (compressed), ~32 GB (uncompressed)
**SHA256 Checksum:** Generated and stored with image file

**Storage Locations:**
- Primary NAS/file server (versioned)
- Technician laptop copies
- Cloud backup storage

#### Components Summary

All components from [image-contents.md](/docs/golden-image/image-contents) documentation:

✓ Raspberry Pi OS Lite (64-bit) Bookworm — fully updated
✓ SSH with authorized keys pre-loaded, password auth disabled
✓ Admin account `viyuadmin` with sudo privileges
✓ UFW firewall configured (allow SSH, allow all outbound)
✓ Unattended-upgrades for security patches
✓ Tailscale installed and authenticated
✓ Hardware watchdog enabled for auto-recovery
✓ Hostname set to `auvik-TEMPLATE`
✓ Version file at `/etc/golden-image-version`
✓ Version check script at `/usr/local/bin/version-check.sh`

---

## Migration Notes Template

Use this template when releasing new major or minor versions:

### Migrating from v{OLD} to v{NEW}

**Breaking Changes:** {List any breaking changes or None}

**Pre-Migration Checklist:**
- [ ] Back up existing configuration
- [ ] Document current software versions
- [ ] Test new image in lab environment
- [ ] Verify Auvik collector compatibility
- [ ] Check Tailscale authentication requirements

**Migration Process:**

1. **Lab Testing**
   - Flash new image to test SD card
   - Boot and verify all services start
   - Test Tailscale connectivity
   - Install Auvik collector
   - Run for 24-48 hours to verify stability

2. **Field Deployment**
   - Schedule maintenance window with client
   - Notify client of brief outage
   - Flash new image to SD card
   - Follow standard [per-client customization](/docs/golden-image/per-client-customization) process
   - Verify collector is reporting to Auvik
   - Monitor for 24 hours

3. **Rollback Procedure** (if issues occur)
   - Shut down device
   - Flash previous known-good image
   - Restore from backup if needed
   - Document issues for investigation

**Post-Migration Verification:**
- [ ] Device reachable via Tailscale
- [ ] Auvik collector running and reporting
- [ ] No firewall or connectivity issues
- [ ] SSH access working
- [ ] Automatic updates functioning

**Estimated Downtime:** {X minutes per site}

**Rollback Plan:** Flash previous image version if critical issues occur

---

## Version Release Process

Before releasing a new golden image version:

### 1. Pre-Release Testing

- [ ] Build image following [image contents](/docs/golden-image/image-contents) guide
- [ ] Flash to test device and boot successfully
- [ ] Verify all services start automatically
- [ ] Test cloning process
- [ ] Document all software versions
- [ ] Update this version history document

### 2. Documentation Updates

- [ ] Update version number in all relevant docs
- [ ] Document all changes in detailed changelog
- [ ] Update software version table
- [ ] Note any breaking changes or migration steps
- [ ] Update hardware compatibility if needed

### 3. Distribution

- [ ] Upload to NAS/file server with version in filename
- [ ] Update technician laptop copies
- [ ] Upload backup to cloud storage
- [ ] Generate and store SHA256 checksum
- [ ] Notify technician team of new release

### 4. Version Verification

Generate SHA256 checksum for integrity verification:

**On macOS/Linux:**
```bash
shasum -a 256 auvik-golden-v1.0.0-2026-02-03.img > auvik-golden-v1.0.0-2026-02-03.img.sha256
```

**On Windows (PowerShell):**
```powershell
Get-FileHash -Algorithm SHA256 auvik-golden-v1.0.0-2026-02-03.img | Format-List
```

**Verify before flashing:**
```bash
shasum -a 256 -c auvik-golden-v1.0.0-2026-02-03.img.sha256
```

---

## Maintenance Schedule

| Task | Frequency | Version Impact |
|------|-----------|----------------|
| Security patches | Automatic (unattended-upgrades) | None (automatic) |
| OS package updates | Quarterly | PATCH or MINOR |
| Major OS updates | Annually or on major release | MAJOR |
| Tailscale updates | Automatic | None (automatic) |
| Full image rebuild | Annually or when needed | MINOR or MAJOR |
| Documentation review | With each release | None |

## Archive Policy

| Version Status | Retention Period | Storage Location |
|----------------|------------------|------------------|
| Current | Indefinite | Primary NAS + technician laptops + cloud |
| Previous (N-1) | 6 months after superseded | Primary NAS + cloud |
| Older versions | 1 year after superseded | Cloud backup only |
| EOL versions | Until no devices in field | Cloud archive |

## Support Matrix

| Golden Image Version | Raspberry Pi OS | Auvik Collector | Support Status |
|---------------------|-----------------|-----------------|----------------|
| 1.0.0 | Bookworm (64-bit) | 2.x+ | Fully Supported |

---

## Related Documentation

- [Image Contents](/docs/golden-image/image-contents) — What's included in the golden image
- [Cloning Process](/docs/golden-image/cloning-process) — How to flash golden images to SD cards
- [Per-Client Customization](/docs/golden-image/per-client-customization) — Site-specific configuration steps

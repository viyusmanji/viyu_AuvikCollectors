# Auvik Collector Deployment Guide

![Link Checker](https://github.com/viyu-net/viyu_AuvikCollectors/actions/workflows/link-checker.yml/badge.svg)

> Raspberry Pi 5 Deployment Playbook for viyu.net

This repository contains comprehensive documentation for deploying Auvik network monitoring collectors on Raspberry Pi 5 hardware. The documentation is built with [Docusaurus](https://docusaurus.io/) and provides step-by-step guidance for hardware selection, deployment, configuration, and troubleshooting.

## 📚 Documentation

Visit the live documentation site: **[https://viyu-net.github.io/viyu_AuvikCollectors/](https://viyu-net.github.io/viyu_AuvikCollectors/)**

## 🚀 Quick Start

### Prerequisites

- Node.js 20.0 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/viyu-net/viyu_AuvikCollectors.git
cd viyu_AuvikCollectors

# Install dependencies
npm install

# Start the development server
npm run start
```

The documentation site will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

The static files will be generated in the `build/` directory.

## 📖 What's Included

- **Hardware Guides** - Bill of materials, component selection, and assembly instructions
- **Deployment Playbooks** - Step-by-step deployment procedures
- **Configuration Guides** - Network setup, Auvik collector configuration, and optimization
- **Troubleshooting** - Common issues, advanced diagnostics, and solutions
- **Checklists** - Comprehensive deployment and verification checklists
- **Reference Materials** - Cost analysis, external resources, and technical specifications

## 🔗 Link Checking

This repository uses an automated link checker to ensure all external documentation references remain valid and accessible. The workflow runs weekly and can be triggered manually.

- **Status Badge**: The badge at the top of this README shows the current link validation status
- **Workflow**: `.github/workflows/link-checker.yml`
- **Schedule**: Weekly on Mondays at 9:00 AM UTC
- **Coverage**: All external links in documentation files (`docs/**/*.md`)

For information on maintaining and fixing broken links, see the [Link Maintenance Guide](docs/contributing.md#link-maintenance).

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](docs/contributing.md) for details on:

- How to contribute to the documentation
- Link maintenance procedures
- Documentation standards and best practices
- How to report issues

### Link Maintenance

Our automated link checker validates all external documentation references weekly. If you receive a notification about broken links:

1. Review the workflow logs to identify broken links
2. Update the affected documentation files with corrected URLs
3. Submit a pull request with your fixes

See the [Link Maintenance section](docs/contributing.md#link-maintenance) in our Contributing Guide for detailed instructions.

## 📝 License

This documentation is maintained by viyu.net for internal deployment guidance.

## 🔗 External Resources

- [Auvik Support Documentation](https://support.auvik.com)
- [Raspberry Pi Official Site](https://www.raspberrypi.com)
- [Docusaurus Documentation](https://docusaurus.io/)

## 📧 Support

For questions or issues related to this documentation:

- Open an issue in this repository
- Check the [Troubleshooting Guide](https://viyu-net.github.io/viyu_AuvikCollectors/docs/troubleshooting/common-issues)
- Review the [Complete Deployment Checklist](https://viyu-net.github.io/viyu_AuvikCollectors/docs/checklists/complete-deployment)

---

*Last updated: 2026* | Built with ❤️ using [Docusaurus](https://docusaurus.io/)

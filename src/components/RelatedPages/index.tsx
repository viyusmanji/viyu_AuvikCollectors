/**
 * RelatedPages component
 * Displays contextually related pages based on the current page's category
 */
import React, {useMemo} from 'react';
import Link from '@docusaurus/Link';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {useSidebarBreadcrumbs} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

interface RelatedPage {
  label: string;
  href: string;
}

interface RelatedCategory {
  label: string;
  pages: RelatedPage[];
}

// Related pages logic - maps category slugs to related category slugs
const RELATED_CATEGORIES: Record<string, string[]> = {
  'hardware': ['getting-started', 'software', 'deployment'],
  'software': ['hardware', 'network', 'deployment'],
  'network': ['software', 'remote-access', 'troubleshooting'],
  'deployment': ['hardware', 'software', 'golden-image', 'checklists'],
  'troubleshooting': ['network', 'hardware', 'reference'],
  'checklists': ['deployment', 'troubleshooting'],
  'getting-started': ['hardware', 'software', 'deployment'],
  'remote-access': ['network', 'troubleshooting'],
  'golden-image': ['deployment', 'software'],
  'reference': ['troubleshooting'],
};

// Sidebar structure - maps category labels to their pages
const SIDEBAR_CATEGORIES: Record<string, RelatedPage[]> = {
  'Getting Started': [
    {label: 'Overview', href: '/docs/getting-started/overview'},
    {label: 'Prerequisites', href: '/docs/getting-started/prerequisites'},
  ],
  'Hardware': [
    {label: 'Bill of Materials', href: '/docs/hardware/bill-of-materials'},
    {label: 'PoE Compatibility', href: '/docs/hardware/poe-compatibility'},
    {label: 'Optional Upgrades', href: '/docs/hardware/optional-upgrades'},
  ],
  'Software': [
    {label: 'Operating System', href: '/docs/software/operating-system'},
    {label: 'Auvik Installation', href: '/docs/software/auvik-installation'},
    {label: 'System Requirements', href: '/docs/software/system-requirements'},
  ],
  'Network': [
    {label: 'IP Addressing', href: '/docs/network/ip-addressing'},
    {label: 'VLAN Placement', href: '/docs/network/vlan-placement'},
    {label: 'Firewall Rules', href: '/docs/network/firewall-rules'},
    {label: 'SNMP Configuration', href: '/docs/network/snmp-configuration'},
  ],
  'Remote Access': [
    {label: 'Tailscale Setup', href: '/docs/remote-access/tailscale-setup'},
    {label: 'SSH Jump Host', href: '/docs/remote-access/ssh-jump-host'},
    {label: 'Auvik Alerts', href: '/docs/remote-access/auvik-alerts'},
  ],
  'Golden Image': [
    {label: 'Image Contents', href: '/docs/golden-image/image-contents'},
    {label: 'Per-Client Customization', href: '/docs/golden-image/per-client-customization'},
    {label: 'Cloning Process', href: '/docs/golden-image/cloning-process'},
  ],
  'Deployment': [
    {label: 'Pre-Deployment', href: '/docs/deployment/pre-deployment'},
    {label: 'On-Site', href: '/docs/deployment/on-site'},
    {label: 'Post-Deployment', href: '/docs/deployment/post-deployment'},
  ],
  'Troubleshooting': [
    {label: 'Common Issues', href: '/docs/troubleshooting/common-issues'},
    {label: 'Pi Not Powering', href: '/docs/troubleshooting/pi-not-powering'},
    {label: 'Collector Offline', href: '/docs/troubleshooting/collector-offline'},
    {label: 'SD Card Failure', href: '/docs/troubleshooting/sd-card-failure'},
  ],
  'Reference': [
    {label: 'Cost Analysis', href: '/docs/reference/cost-analysis'},
    {label: 'Auvik Documentation', href: '/docs/reference/auvik-documentation'},
    {label: 'Glossary', href: '/docs/reference/glossary'},
  ],
  'Checklists': [
    {label: 'Complete Deployment', href: '/docs/checklists/complete-deployment'},
    {label: 'Quick Reference', href: '/docs/checklists/quick-reference'},
  ],
};

// Helper: Convert category label to slug
function categoryLabelToSlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-');
}

// Helper: Convert category slug to label
function categorySlugToLabel(slug: string): string {
  const labelMap: Record<string, string> = {
    'getting-started': 'Getting Started',
    'hardware': 'Hardware',
    'software': 'Software',
    'network': 'Network',
    'remote-access': 'Remote Access',
    'golden-image': 'Golden Image',
    'deployment': 'Deployment',
    'troubleshooting': 'Troubleshooting',
    'reference': 'Reference',
    'checklists': 'Checklists',
  };
  return labelMap[slug] || slug;
}

export interface RelatedPagesProps {
  maxCategories?: number;
  maxPagesPerCategory?: number;
}

export default function RelatedPages({
  maxCategories = 3,
  maxPagesPerCategory = 3,
}: RelatedPagesProps): React.ReactElement | null {
  const doc = useDoc();
  const breadcrumbs = useSidebarBreadcrumbs();

  const relatedCategories = useMemo((): RelatedCategory[] => {
    // Extract current category from breadcrumbs
    // Breadcrumbs typically look like: [Category, SubPage]
    if (!breadcrumbs || breadcrumbs.length === 0) {
      return [];
    }

    // The first breadcrumb is usually the category
    const currentCategoryLabel = breadcrumbs[0]?.label;
    if (!currentCategoryLabel) {
      return [];
    }

    const currentCategorySlug = categoryLabelToSlug(currentCategoryLabel);

    // Get related category slugs
    const relatedSlugs = RELATED_CATEGORIES[currentCategorySlug] || [];

    // Build related categories with their pages
    const categories: RelatedCategory[] = [];

    for (const slug of relatedSlugs.slice(0, maxCategories)) {
      const label = categorySlugToLabel(slug);
      const pages = SIDEBAR_CATEGORIES[label] || [];

      if (pages.length > 0) {
        categories.push({
          label,
          pages: pages.slice(0, maxPagesPerCategory),
        });
      }
    }

    return categories;
  }, [breadcrumbs, maxCategories, maxPagesPerCategory]);

  // Don't render if no related pages found
  if (relatedCategories.length === 0) {
    return null;
  }

  return (
    <aside className={styles.relatedPages} role="complementary" aria-label="Related pages">
      <div className={styles.header}>
        <h3 className={styles.title}>Related Pages</h3>
      </div>

      <div className={styles.categories}>
        {relatedCategories.map((category) => (
          <div key={category.label} className={styles.category}>
            <h4 className={styles.categoryTitle}>{category.label}</h4>
            <ul className={styles.pageList} role="list">
              {category.pages.map((page) => (
                <li key={page.href} className={styles.pageItem}>
                  <Link
                    to={page.href}
                    className={styles.pageLink}
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

# Contributing to Documentation

Thank you for contributing to the Raspberry Pi 5 + Auvik Collector documentation! This guide will help you maintain high-quality documentation and keep all external references up to date.

## Link Maintenance

### Overview

This documentation site includes an automated link checker that validates all external links to ensure they remain accessible. The link checker runs weekly and can also be triggered manually when needed.

**Key Features:**
- Automated weekly validation every Monday at 9:00 AM UTC
- Checks all external links in markdown files
- Creates GitHub Issues when broken links are detected
- Includes retry logic to avoid false positives from temporary outages

### How the Link Checker Works

The link checker is implemented as a GitHub Action workflow (`.github/workflows/link-checker.yml`) that:

1. Scans all documentation files in the `docs/` directory
2. Validates external URLs (links starting with `http://` or `https://`)
3. Follows redirects and retries failed requests (up to 3 times with 5-second intervals)
4. Reports any broken links that return error codes (4xx, 5xx) or timeout after 30 seconds
5. Automatically creates a GitHub Issue labeled `documentation` and `broken-links` when failures are detected

### Finding Broken Links

When the link checker detects broken links, you'll be notified through:

**1. GitHub Issues**
- Look for issues labeled `documentation` and `broken-links`
- The issue will contain a link to the workflow run with detailed logs

**2. GitHub Actions Tab**
- Navigate to the **Actions** tab in the repository
- Click on the failed **Link Checker** workflow run
- Review the logs to see which links failed and why

**3. Email Notifications**
- If you're watching the repository, you'll receive email notifications for new issues

### How to Fix Broken Links

When you find a broken link, follow these steps:

#### Step 1: Identify the Broken Link

From the GitHub Issue or workflow logs, note:
- The file path (e.g., `docs/hardware/bill-of-materials.md`)
- The broken URL
- The error code or reason (e.g., 404 Not Found, timeout, DNS failure)

#### Step 2: Determine the Fix

**Option A: Update the Link**
- If the resource has moved, find the new URL and update the link
- Search for the new location using web search or the site's documentation

**Option B: Remove the Link**
- If the resource no longer exists and there's no replacement, remove the reference
- Consider adding a note about why it was removed if relevant

**Option C: Replace with Alternative**
- Find an equivalent resource from a reliable source
- Update the link text if the source has changed

#### Step 3: Update the Documentation

1. Locate the file containing the broken link
2. Open the file and find the broken link
3. Update, remove, or replace the link as determined in Step 2
4. Save the file

#### Step 4: Verify the Fix

Before committing your changes, verify the new link works:

```bash
# Test a single URL
curl -I "https://example.com/new-url"

# Or manually visit the URL in your browser
```

#### Step 5: Commit Your Changes

```bash
git add docs/path/to/file.md
git commit -m "Fix broken link in [file description]

- Updated [old URL] to [new URL]
- Reason: [why the link was broken and how you fixed it]"
git push
```

#### Step 6: Manually Trigger Link Checker (Optional)

To verify your fix immediately:

1. Go to the **Actions** tab in the repository
2. Click on **Link Checker** workflow
3. Click **Run workflow** dropdown
4. Select the branch with your fix
5. Click **Run workflow** button
6. Wait for the workflow to complete and verify no errors

#### Step 7: Close the Issue

Once the fix is merged and verified:
- Comment on the GitHub Issue with the fix details
- Close the issue with the `Completed` reason

### Common Link Issues and Solutions

#### Issue: Auvik Documentation Links Return 404

**Cause:** Auvik may have reorganized their documentation structure

**Solution:**
1. Visit [https://support.auvik.com/](https://support.auvik.com/)
2. Use the search function to find the updated location
3. Update the link in the documentation
4. Consider noting in the commit message that Auvik's docs were restructured

#### Issue: Product Links No Longer Available

**Cause:** Product is discontinued or vendor changed URLs

**Solution:**
1. Search for the current product page or equivalent model
2. If the exact product is discontinued, find the successor model
3. Update the link and add a note if the product has changed
4. Update any specifications if the replacement differs

#### Issue: Temporary Timeouts or Server Errors

**Cause:** Target server temporarily unavailable

**Solution:**
1. Wait for the next scheduled link check run (weekly)
2. The retry logic (3 attempts with 5-second intervals) handles most temporary issues
3. If the issue persists for multiple weeks, investigate further
4. Check if the site has permanent issues or if they've implemented rate limiting

#### Issue: Link Works in Browser But Fails in Checker

**Cause:** Some sites block automated tools or require specific headers

**Solution:**
1. Verify the link works manually
2. If it consistently fails in the checker but works in browsers:
   - Document this in a comment near the link
   - Consider if the link can be replaced with one that doesn't block automation
   - Open an issue to discuss excluding the link from automated checks

### Best Practices for Adding New Links

When adding new external links to documentation:

1. **Prefer Stable URLs**
   - Use official documentation sites over blog posts
   - Use permanent links (permalinks) when available
   - Avoid URLs with session IDs or temporary parameters

2. **Link to Authoritative Sources**
   - Link directly to official vendor documentation
   - For Auvik links, use `support.auvik.com` URLs
   - For hardware, link to manufacturer sites or reputable retailers

3. **Test Links Before Committing**
   - Verify the link works in your browser
   - Check that it points to the correct content
   - Ensure the page is not behind authentication

4. **Use Descriptive Link Text**
   - Good: `[Raspberry Pi 5 specifications](https://www.raspberrypi.com/products/raspberry-pi-5/)`
   - Bad: `Click [here](https://www.raspberrypi.com/products/raspberry-pi-5/) for specs`

5. **Document External Dependencies**
   - If a link is critical to following a procedure, mention it in the text
   - Consider adding alternative sources if available

### Manual Link Checker Triggers

You can manually trigger the link checker workflow at any time:

**When to Manually Trigger:**
- After fixing broken links (to verify the fix)
- Before major documentation updates (to ensure all links work)
- When Auvik announces documentation changes
- After adding many new external references

**How to Trigger:**
1. Navigate to the repository on GitHub
2. Click the **Actions** tab
3. Select **Link Checker** from the workflows list
4. Click the **Run workflow** dropdown button
5. Select the branch you want to check (usually `main` or your feature branch)
6. Click the green **Run workflow** button
7. Refresh the page to see the workflow start
8. Click on the workflow run to view progress and results

### Workflow Configuration

The link checker is configured in `.github/workflows/link-checker.yml` with the following settings:

- **Schedule:** Every Monday at 9:00 AM UTC
- **Timeout:** 30 seconds per link
- **Retries:** Up to 3 attempts per link
- **Retry Wait:** 5 seconds between retries
- **Accepted Status Codes:** 200 (OK), 204 (No Content), 429 (Rate Limited - will retry)
- **Target Files:** `docs/**/*.md` and `docs/**/*.mdx`
- **Link Types:** External links only (internal documentation links are not checked)

### Questions or Issues?

If you encounter problems with the link checker or need help fixing broken links:

1. Check existing GitHub Issues for similar problems
2. Review the workflow logs for detailed error information
3. Open a new issue with:
   - The file and line number
   - The problematic URL
   - The error message from the workflow
   - What you've tried so far

## General Documentation Guidelines

### Formatting

- Use clear, concise language
- Include code examples where helpful
- Use tables for structured information
- Add screenshots for UI-related steps

### Structure

- Use descriptive headings
- Keep sections focused on a single topic
- Link to related documentation pages
- Include a table of contents for long pages

### Testing

Before submitting documentation changes:
- Review your changes in the Docusaurus preview (run `npm run start`)
- Check that all links work (internal and external)
- Verify code examples are accurate
- Ensure images load correctly

Thank you for helping maintain high-quality, reliable documentation!

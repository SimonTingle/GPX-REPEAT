#!/usr/bin/env node

/**
 * Semantic Version Bumping Script
 *
 * Parses conventional commits since last git tag and automatically bumps version.
 * Updates: package.json, README.md badge, CHANGELOG.md, and creates git tags.
 *
 * Commit Format:
 *   feat: ... → bumps minor version (0.5.0 → 0.6.0)
 *   fix: ...  → bumps patch version (0.5.0 → 0.5.1)
 *   BREAKING CHANGE: footer → bumps major version (0.5.0 → 1.0.0)
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Helper: Execute shell command and return output
function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    throw error;
  }
}

// Helper: Get all commits since last tag, or all if no tags exist
function getCommitsSinceLastTag() {
  try {
    // Get the latest tag
    const lastTag = exec('git describe --tags --abbrev=0 2>/dev/null || echo ""');

    if (!lastTag) {
      // No tags exist, get all commits
      console.log('No previous tags found. Analyzing all commits...');
      return exec('git log --pretty=format:"%H %s"');
    }

    // Get commits since last tag
    console.log(`Found last tag: ${lastTag}`);
    return exec(`git log ${lastTag}..HEAD --pretty=format:"%H %s"`);
  } catch (error) {
    console.error('Error getting commits:', error.message);
    process.exit(1);
  }
}

// Helper: Get commit body to check for BREAKING CHANGE
function getCommitBody(hash) {
  try {
    return exec(`git show --format="%b" ${hash} --no-patch 2>/dev/null || echo ""`);
  } catch {
    return '';
  }
}

// Parse commits and determine version bump type
function analyzeCommits(commits) {
  let hasMajor = false;    // BREAKING CHANGE
  let hasMinor = false;    // feat:
  let hasPatches = 0;      // fix:
  const commitList = [];

  const lines = commits.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const [hash, ...messageParts] = line.split(' ');
    const message = messageParts.join(' ');

    if (message.startsWith('feat:')) {
      hasMinor = true;
      commitList.push({ type: 'feat', hash, message });
    } else if (message.startsWith('fix:')) {
      hasPatches++;
      commitList.push({ type: 'fix', hash, message });
    } else if (message.toLowerCase().includes('breaking change')) {
      hasMajor = true;
      commitList.push({ type: 'breaking', hash, message });
    }

    // Also check commit body for BREAKING CHANGE
    if (!hasMajor) {
      const body = getCommitBody(hash);
      if (body.includes('BREAKING CHANGE')) {
        hasMajor = true;
        commitList.push({ type: 'breaking', hash, message });
      }
    }
  }

  return { hasMajor, hasMinor, hasPatches, commitList };
}

// Parse semantic version string
function parseVersion(versionStr) {
  const match = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Invalid version format: ${versionStr}`);
  return { major: parseInt(match[1]), minor: parseInt(match[2]), patch: parseInt(match[3]) };
}

// Format semantic version
function formatVersion(major, minor, patch) {
  return `${major}.${minor}.${patch}`;
}

// Bump version based on commit analysis
function bumpVersion(currentVersion, analysis) {
  const { major, minor, patch } = parseVersion(currentVersion);

  if (analysis.hasMajor) {
    return formatVersion(major + 1, 0, 0);
  } else if (analysis.hasMinor) {
    return formatVersion(major, minor + 1, 0);
  } else if (analysis.hasPatches > 0) {
    return formatVersion(major, minor, patch + analysis.hasPatches);
  }

  // No version-bump commits, return current version
  return currentVersion;
}

// Read current version from package.json
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  return packageJson.version;
}

// Update package.json with new version
function updatePackageJson(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✓ Updated package.json to version ${newVersion}`);
}

// Update README.md version badge
function updateReadmeBadge(newVersion) {
  let content = fs.readFileSync('README.md', 'utf-8');
  content = content.replace(
    /\[\!\[Version\]\(.*?\)\]\(.*?\)/,
    `[![Version](https://img.shields.io/badge/Version-${newVersion}-informational?style=flat-square)](CHANGELOG.md)`
  );
  fs.writeFileSync('README.md', content);
  console.log(`✓ Updated README.md badge to version ${newVersion}`);
}

// Format changelog entry
function formatChangelogEntry(newVersion, analysis) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  let entry = `## [${newVersion}] - ${dateStr}\n\n`;

  if (analysis.commitList.length > 0) {
    const features = analysis.commitList.filter(c => c.type === 'feat');
    const fixes = analysis.commitList.filter(c => c.type === 'fix');
    const breaking = analysis.commitList.filter(c => c.type === 'breaking');

    if (breaking.length > 0) {
      entry += '### ⚠️ BREAKING CHANGES\n';
      breaking.forEach(c => {
        entry += `- ${c.message.replace(/^(feat|fix|breaking change):\s*/i, '')}\n`;
      });
      entry += '\n';
    }

    if (features.length > 0) {
      entry += '### Added\n';
      features.forEach(c => {
        entry += `- ${c.message.replace(/^feat:\s*/, '')}\n`;
      });
      entry += '\n';
    }

    if (fixes.length > 0) {
      entry += '### Fixed\n';
      fixes.forEach(c => {
        entry += `- ${c.message.replace(/^fix:\s*/, '')}\n`;
      });
      entry += '\n';
    }
  }

  return entry;
}

// Update CHANGELOG.md with new version entry
function updateChangelog(newVersion, analysis) {
  const changelogPath = 'CHANGELOG.md';
  let content = fs.readFileSync(changelogPath, 'utf-8');

  // Find the insertion point (after header)
  const headerMatch = content.match(/^(# Changelog\n\n.*?\n\n)/s);
  if (!headerMatch) {
    console.warn('⚠️  Could not find changelog header. Skipping changelog update.');
    return;
  }

  const header = headerMatch[1];
  const newEntry = formatChangelogEntry(newVersion, analysis);
  content = header + newEntry + content.slice(header.length);

  fs.writeFileSync(changelogPath, content);
  console.log(`✓ Updated CHANGELOG.md with version ${newVersion}`);
}

// Create git tag for new version
function createGitTag(version) {
  const tag = `v${version}`;
  try {
    exec(`git tag -a ${tag} -m "Release version ${version}"`);
    console.log(`✓ Created git tag: ${tag}`);
  } catch (error) {
    console.warn(`⚠️  Could not create git tag (may already exist): ${tag}`);
  }
}

// Main execution
function main() {
  console.log('🔧 Semantic Version Bump Script\n');

  // Check if we're in a git repo
  try {
    exec('git status > /dev/null 2>&1');
  } catch {
    console.error('❌ Not in a git repository.');
    process.exit(1);
  }

  // Get current version
  const currentVersion = getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);

  // Get commits since last tag
  const commits = getCommitsSinceLastTag();

  if (!commits) {
    console.log('No new commits. No version bump needed.');
    process.exit(0);
  }

  // Analyze commits
  const analysis = analyzeCommits(commits);
  console.log(`\nCommit analysis:`);
  console.log(`  - Features (feat:): ${analysis.commitList.filter(c => c.type === 'feat').length}`);
  console.log(`  - Fixes (fix:): ${analysis.hasPatches}`);
  console.log(`  - Breaking changes: ${analysis.hasMajor ? 'YES' : 'NO'}`);

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, analysis);

  if (newVersion === currentVersion) {
    console.log(`\n✓ No version bump needed (no feat:/fix:/BREAKING commits)`);
    process.exit(0);
  }

  console.log(`\n📈 Version bump: ${currentVersion} → ${newVersion}`);

  // Update files
  updatePackageJson(newVersion);
  updateReadmeBadge(newVersion);
  updateChangelog(newVersion, analysis);
  createGitTag(newVersion);

  console.log(`\n✅ Version bump complete! Run 'git status' to review changes.`);
}

// Execute
main();

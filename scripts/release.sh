#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# release.sh — Bump versions, tag, and push to trigger release
# ============================================================
#
# Usage:
#   ./scripts/release.sh patch    # 0.1.0 → 0.1.1
#   ./scripts/release.sh minor    # 0.1.0 → 0.2.0
#   ./scripts/release.sh major    # 0.1.0 → 1.0.0
#   ./scripts/release.sh 1.2.3    # explicit version

BUMP="${1:-}"

if [ -z "$BUMP" ]; then
  echo "Usage: ./scripts/release.sh <patch|minor|major|x.y.z>"
  exit 1
fi

# Ensure we're on main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "Error: Must be on 'main' branch (currently on '$BRANCH')"
  exit 1
fi

# Ensure working tree is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Read current version from core package
CURRENT=$(node -p "require('./packages/core/package.json').version")
echo "Current version: $CURRENT"

# Calculate new version
if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEW_VERSION="$BUMP"
else
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  case "$BUMP" in
    patch) NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
    minor) NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
    major) NEW_VERSION="$((MAJOR + 1)).0.0" ;;
    *) echo "Error: Invalid bump type '$BUMP'. Use patch, minor, major, or x.y.z"; exit 1 ;;
  esac
fi

echo "New version:     $NEW_VERSION"
echo ""

# Run checks
echo "Running checks..."
npm run lint
npm run format:check
npm run build
npm test
echo "All checks passed."
echo ""

# Bump version in both packages
echo "Bumping versions..."
npm version "$NEW_VERSION" --no-git-tag-version --workspace=packages/core
npm version "$NEW_VERSION" --no-git-tag-version --workspace=packages/nuxt

# Update cross-dependency (nuxt depends on core)
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('./packages/nuxt/package.json', 'utf8'));
  pkg.dependencies['vue-excalidraw'] = '^$NEW_VERSION';
  fs.writeFileSync('./packages/nuxt/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Commit and tag
git add packages/core/package.json packages/nuxt/package.json
git commit -m "release: v$NEW_VERSION"
git tag "v$NEW_VERSION"

echo ""
echo "Created commit and tag v$NEW_VERSION"
echo ""
echo "To publish, push the commit and tag:"
echo "  git push origin main --tags"

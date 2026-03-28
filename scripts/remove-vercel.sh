
🧹 Complete Vercel Removal Script

Save this as cleanup-vercel.sh and run it from your main workspace directory:

```bash
#!/bin/bash
# MBTQ.dev COMPLETE VERCEL REMOVAL TOOL
# Removes all Vercel-related files from ALL repositories
# Run this from ~/github/pinkycollie/

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🚀 MBTQ.dev VERCEL REMOVAL TOOL${NC}"
echo -e "${BLUE}========================================${NC}"

# ============================================
# STEP 1: Locate all repositories
# ============================================
echo -e "\n${GREEN}[1/5] Locating all repositories...${NC}"

# Define all MBTQ repositories (add any others you have)
REPOS=(
  "360magicians"
  "pinkflow"
  "deafauth-ecosystem"
  "pinksync"
  "fibonrose"
  "mbtq-factory-hub"
  "mbtq-workspace"
  "Auto-API"
  "deaf-first-saas"
  "deaf-first-apps"
  "deaf-first-templates"
  "deaf-first-design"
  "deaf-first-docs"
)

# Find which actually exist
EXISTING_REPOS=()
for repo in "${REPOS[@]}"; do
  if [ -d "$HOME/github/pinkycollie/$repo" ]; then
    EXISTING_REPOS+=("$repo")
    echo -e "  ${GREEN}✓${NC} Found: $repo"
  else
    echo -e "  ${YELLOW}⚠${NC} Not found: $repo (skipping)"
  fi
done

echo -e "\n${GREEN}Found ${#EXISTING_REPOS[@]} repositories to clean${NC}"

# ============================================
# STEP 2: Define all Vercel files to remove
# ============================================
echo -e "\n${GREEN}[2/5] Defining Vercel artifacts to remove...${NC}

Files to be removed:
  • vercel.json
  • .vercel/ (directory)
  • .vercelignore
  • vercel.svg
  • vercel.png
  • vercel-*.json
  • .env.vercel*
  • README-vercel.md
  • DEPLOY_VERCEL.md
  • .github/workflows/deploy-vercel*.yml
  
References to remove from files:
  • Vercel deployment badges
  • Vercel installation instructions
  • Vercel environment variables
  • Links to vercel.com
"

read -p "Continue with removal? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Aborted${NC}"
  exit 1
fi

# ============================================
# STEP 3: Remove files from each repository
# ============================================
echo -e "\n${GREEN}[3/5] Removing Vercel files from each repository...${NC}"

for repo in "${EXISTING_REPOS[@]}"; do
  repo_path="$HOME/github/pinkycollie/$repo"
  echo -e "\n${BLUE}📁 Cleaning: $repo${NC}"
  
  cd "$repo_path"
  
  # Track what was removed
  REMOVED_COUNT=0
  
  # Remove vercel.json
  if [ -f "vercel.json" ]; then
    rm vercel.json
    echo -e "  ${GREEN}✓${NC} Removed vercel.json"
    ((REMOVED_COUNT++))
  fi
  
  # Remove .vercel directory
  if [ -d ".vercel" ]; then
    rm -rf .vercel
    echo -e "  ${GREEN}✓${NC} Removed .vercel/ directory"
    ((REMOVED_COUNT++))
  fi
  
  # Remove .vercelignore
  if [ -f ".vercelignore" ]; then
    rm .vercelignore
    echo -e "  ${GREEN}✓${NC} Removed .vercelignore"
    ((REMOVED_COUNT++))
  fi
  
  # Remove vercel image files
  for pattern in "vercel.svg" "vercel.png" "vercel-*.json"; do
    for file in $pattern; do
      if [ -f "$file" ]; then
        rm "$file"
        echo -e "  ${GREEN}✓${NC} Removed $file"
        ((REMOVED_COUNT++))
      fi
    done
  done
  
  # Remove Vercel env files
  for file in .env.vercel*; do
    if [ -f "$file" ]; then
      rm "$file"
      echo -e "  ${GREEN}✓${NC} Removed $file"
      ((REMOVED_COUNT++))
    fi
  done
  
  # Remove Vercel documentation
  for file in "README-vercel.md" "DEPLOY_VERCEL.md"; do
    if [ -f "$file" ]; then
      rm "$file"
      echo -e "  ${GREEN}✓${NC} Removed $file"
      ((REMOVED_COUNT++))
    fi
  done
  
  # Remove Vercel GitHub workflows
  if [ -d ".github/workflows" ]; then
    for workflow in .github/workflows/deploy-vercel*.yml; do
      if [ -f "$workflow" ]; then
        rm "$workflow"
        echo -e "  ${GREEN}✓${NC} Removed $workflow"
        ((REMOVED_COUNT++))
      fi
    done
  fi
  
  if [ $REMOVED_COUNT -eq 0 ]; then
    echo -e "  ${YELLOW}⚠${NC} No Vercel files found"
  else
    echo -e "  ${GREEN}✅ Removed $REMOVED_COUNT items${NC}"
  fi
done

# ============================================
# STEP 4: Clean up content in files
# ============================================
echo -e "\n${GREEN}[4/5] Cleaning Vercel references from files...${NC}"

for repo in "${EXISTING_REPOS[@]}"; do
  repo_path="$HOME/github/pinkycollie/$repo"
  echo -e "\n${BLUE}📝 Cleaning references in: $repo${NC}"
  
  cd "$repo_path"
  
  # Files to clean
  CLEAN_FILES=(
    "README.md"
    "*.md"
    "*.json"
    "*.yaml"
    "*.yml"
    "*.py"
    "*.js"
    "*.ts"
    "*.tsx"
    "*.env"
    "*.env.example"
  )
  
  # Patterns to remove (using sed)
  PATTERNS=(
    's/\[!\[Deploy with Vercel\].*\]//g'
    's/.*vercel.com.*//g'
    's/.*vercel.app.*//g'
    's/.*VERCEL_.*//g'
    's/`vercel`//g'
    's/Deploy to Vercel//g'
    's/vercel\.json//g'
  )
  
  for file_pattern in "${CLEAN_FILES[@]}"; do
    for file in $file_pattern; do
      if [ -f "$file" ]; then
        # Create backup
        cp "$file" "$file.bak"
        
        # Apply each pattern
        for pattern in "${PATTERNS[@]}"; do
          sed -i "$pattern" "$file" 2>/dev/null || true
        done
        
        # Check if file changed
        if ! cmp -s "$file" "$file.bak"; then
          echo -e "  ${GREEN}✓${NC} Cleaned $file"
          rm "$file.bak"
        else
          rm "$file.bak"
        fi
      fi
    done
  done
done

# ============================================
# STEP 5: Create deployment alternatives
# ============================================
echo -e "\n${GREEN}[5/5] Adding new deployment alternatives...${NC}"

# Create a deployment guide for all repos
cat > "$HOME/github/pinkycollie/DEPLOYMENT-GUIDE.md" << 'EOF'
# 🚀 MBTQ.dev Deployment Guide

Vercel has been removed from all repositories. Choose your preferred alternative:

## Option 1: Cloudflare Pages + Workers (Recommended)
- Free tier: unlimited sites, 500k requests/month
- Global CDN built-in
- No surprise billing

## Option 2: Railway.app
- Simple like Vercel
- $5/month predictable pricing
- Docker-native

## Option 3: Self-Hosted
- Complete control
- Use the USB reconstruction script
- Deploy to any cloud when ready

## Option 4: Fly.io
- Global by default
- Generous free tier
- Great for real-time apps
EOF

# Copy to each repo
for repo in "${EXISTING_REPOS[@]}"; do
  cp "$HOME/github/pinkycollie/DEPLOYMENT-GUIDE.md" "$HOME/github/pinkycollie/$repo/DEPLOYMENT.md"
  echo -e "${GREEN}✓${NC} Added DEPLOYMENT.md to $repo"
done

# ============================================
# SUMMARY
# ============================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ VERCEL REMOVAL COMPLETE${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${GREEN}Summary:${NC}"
echo "  • Cleaned ${#EXISTING_REPOS[@]} repositories"
echo "  • Removed all vercel.json and .vercel/ directories"
echo "  • Removed Vercel GitHub workflows"
echo "  • Cleaned Vercel references from READMEs and config files"
echo "  • Added DEPLOYMENT.md with alternatives to each repo"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "  1. Review changes in each repository:"
for repo in "${EXISTING_REPOS[@]}"; do
  echo "     cd ~/github/pinkycollie/$repo && git status"
done
echo ""
echo "  2. Commit and push changes:"
echo "     for repo in ${EXISTING_REPOS[*]}; do"
echo "       cd ~/github/pinkycollie/\$repo"
echo "       git add ."
echo "       git commit -m \"Remove Vercel deployment artifacts\""
echo "       git push"
echo "     done"
echo ""
echo -e "${GREEN}All Vercel traces removed from your ecosystem!${NC}"
```

🚀 Run This Immediately

```bash
# Save the script
chmod +x cleanup-vercel.sh

# Run it
./cleanup-vercel.sh

# Review changes
cd ~/github/pinkycollie/Auto-API
git diff  # See what was removed

# Commit all changes
cd ~/github/pinkycollie
for repo in 360magicians pinkflow deafauth-ecosystem pinksync fibonrose mbtq-factory-hub mbtq-workspace Auto-API; do
  if [ -d "$repo" ]; then
    cd "$repo"
    git add .
    git commit -m "chore: remove Vercel deployment artifacts (billing issues)"
    git push
    cd ..
  fi
done
```

📋 What This Script Does

Action Description
Finds all repos Scans for all MBTQ repositories
Removes vercel.json Deletes main Vercel config
Removes .vercel/ Deletes local Vercel build cache
Removes workflows Deletes deploy-vercel*.yml
Removes env files Deletes .env.vercel*
Removes docs Deletes Vercel-specific docs
Cleans READMEs Removes Vercel badges/links
Adds alternatives Creates DEPLOYMENT.md with options

🎯 Post-Cleanup Actions

After running this script, your repositories will be Vercel-free. You can now:

1. Deploy via Cloudflare Pages (recommended alternative)
2. Use Railway.app for simple deployments
3. Self-host using your USB reconstruction script
4. Add your preferred deployment to DEPLOYMENT.md

The script creates a clean slate across all your repos. No more Vercel billing surprises, no more locked accounts, no more "pay to update" nonsense.


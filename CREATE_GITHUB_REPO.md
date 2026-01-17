# Create GitHub Repository - Step by Step

## Option 1: Using GitHub Website (Recommended)

1. **Go to GitHub**: https://github.com/new
   - Or click the "+" icon in top right → "New repository"

2. **Fill in the details**:
   - **Repository name**: `data-job-portal`
   - **Description**: `A modern job portal for data-related roles`
   - **Visibility**: Choose Public or Private
   - **IMPORTANT**: Do NOT check:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - (We already have these files)

3. **Click "Create repository"**

4. **After creating**, GitHub will show you commands. Use these:

```bash
# The repository is already initialized, so skip "git init"
# Just add the remote and push:

git remote add origin https://github.com/sumanth2525/data-job-portal.git
git branch -M main
git push -u origin main
```

## Option 2: Using GitHub CLI (if installed)

```bash
# Install GitHub CLI first: https://cli.github.com
gh auth login
gh repo create data-job-portal --public --description "A modern job portal for data-related roles"
git remote add origin https://github.com/sumanth2525/data-job-portal.git
git branch -M main
git push -u origin main
```

## Troubleshooting

### If repository already exists with different name:
```bash
# Remove current remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/sumanth2525/YOUR-REPO-NAME.git
git push -u origin main
```

### If you get authentication errors:
- Use Personal Access Token (Settings → Developer settings → Personal access tokens)
- Or set up SSH keys
- Or use GitHub CLI: `gh auth login`

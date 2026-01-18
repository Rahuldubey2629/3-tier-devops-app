# Git Branching Strategy

## Branch Structure

This project follows a **three-tier branching strategy** to support development, staging, and production environments.

```
dev (development) → prod (staging/pre-production) → main (production)
```

### Branches

#### 🟢 **dev** (Development Branch)
- **Purpose**: Active development and feature integration
- **Environment**: Development
- **Stability**: Unstable - frequent changes
- **Deployment**: Auto-deploy to dev environment
- **Protection**: None - developers can push directly

**Workflow:**
```bash
# Switch to dev branch
git checkout dev

# Pull latest changes
git pull origin dev

# Create feature branch (optional)
git checkout -b feature/your-feature-name

# After completing work
git add .
git commit -m "feat: your feature description"
git push origin dev
```

#### 🟡 **prod** (Production-Ready/Staging Branch)
- **Purpose**: Pre-production testing and validation
- **Environment**: Staging/Pre-production
- **Stability**: Stable - thoroughly tested features only
- **Deployment**: Auto-deploy to staging environment
- **Protection**: Requires pull request review

**Workflow:**
```bash
# Merge dev into prod (after testing in dev)
git checkout prod
git pull origin prod
git merge dev
git push origin prod
```

#### 🔴 **main** (Production Branch)
- **Purpose**: Production releases
- **Environment**: Production
- **Stability**: Most stable - battle-tested code only
- **Deployment**: Auto-deploy to production
- **Protection**: Requires pull request review + approvals

**Workflow:**
```bash
# Merge prod into main (after validation in staging)
git checkout main
git pull origin main
git merge prod
git push origin main
```

## Development Workflow

### For New Features

1. **Start in dev branch**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create feature branch** (optional but recommended)
   ```bash
   git checkout -b feature/user-authentication
   ```

3. **Develop and commit**
   ```bash
   git add .
   git commit -m "feat: add user authentication"
   ```

4. **Push to dev**
   ```bash
   git checkout dev
   git merge feature/user-authentication
   git push origin dev
   ```

5. **Test in dev environment**
   - Run automated tests
   - Manual testing
   - Verify functionality

6. **Promote to prod**
   ```bash
   git checkout prod
   git pull origin prod
   git merge dev
   git push origin prod
   ```

7. **Validate in staging**
   - Integration testing
   - Performance testing
   - UAT (User Acceptance Testing)

8. **Release to main**
   ```bash
   git checkout main
   git pull origin main
   git merge prod
   git push origin main
   ```

### For Hotfixes

1. **Create hotfix branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug-fix
   ```

2. **Fix and test**
   ```bash
   git add .
   git commit -m "fix: resolve critical production bug"
   ```

3. **Merge to main**
   ```bash
   git checkout main
   git merge hotfix/critical-bug-fix
   git push origin main
   ```

4. **Backport to prod and dev**
   ```bash
   git checkout prod
   git merge main
   git push origin prod
   
   git checkout dev
   git merge prod
   git push origin dev
   ```

## Branch Rules

### ✅ DO:
- Always pull before pushing
- Write meaningful commit messages
- Test in dev before promoting to prod
- Validate in prod before releasing to main
- Keep branches in sync regularly
- Use semantic commit messages (feat:, fix:, chore:, docs:)

### ❌ DON'T:
- Never force push to prod or main
- Don't skip testing in dev/prod environments
- Don't merge broken code to prod/main
- Don't delete these permanent branches
- Don't commit directly to main (use prod → main flow)

## Commit Message Convention

Use semantic commit messages:

```
feat: Add new feature
fix: Bug fix
chore: Maintenance task
docs: Documentation update
test: Add or update tests
refactor: Code refactoring
style: Code style changes
perf: Performance improvement
```

Examples:
```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve login authentication issue"
git commit -m "chore: update dependencies"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for auth controller"
```

## CI/CD Integration

### Automated Workflows

**dev branch:**
- ✅ Run unit tests
- ✅ Run linting
- ✅ Build Docker images
- ✅ Deploy to dev environment

**prod branch:**
- ✅ Run all tests (unit + integration)
- ✅ Security scanning
- ✅ Build and tag Docker images
- ✅ Deploy to staging environment
- ✅ Run smoke tests

**main branch:**
- ✅ Run full test suite
- ✅ Security and compliance checks
- ✅ Build production images
- ✅ Deploy to production
- ✅ Health checks
- ✅ Create GitHub release

## Environment Mapping

| Branch | Environment | URL | Purpose |
|--------|-------------|-----|---------|
| `dev` | Development | `dev.yourapp.com` | Feature development & testing |
| `prod` | Staging | `staging.yourapp.com` | Pre-production validation |
| `main` | Production | `yourapp.com` | Live production system |

## Quick Reference

```bash
# Check current branch
git branch

# Switch branches
git checkout dev
git checkout prod
git checkout main

# View branch status
git status

# See commit history
git log --oneline --graph --all

# Sync all branches
git checkout dev && git pull origin dev
git checkout prod && git pull origin prod
git checkout main && git pull origin main
```

## Additional Resources

- [Git Flow Guide](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Remember:** The goal is to maintain code quality and stability while enabling rapid development. Always test thoroughly at each stage!

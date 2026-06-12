# SaaS Frontend Configuration Files

This folder contains all the files needed to enable CI/CD for the saas-frontend Next.js application.

## How to Use These Files

Copy these files to your `saas-frontend` GitHub repository:

```bash
# Clone the saas-frontend repo
git clone https://github.com/samyas/saas-frontend.git
cd saas-frontend

# Copy the Dockerfile
cp /path/to/devops-super/saas-frontend-config/Dockerfile .

# Copy GitHub Actions workflow
mkdir -p .github/workflows
cp /path/to/devops-super/saas-frontend-config/.github/workflows/build-and-push.yml .github/workflows/

# Copy Kubernetes manifests
mkdir -p k8s
cp /path/to/devops-super/saas-frontend-config/k8s/* k8s/

# Commit and push
git add .
git commit -m "feat: add CI/CD pipeline with Docker and K8s manifests"
git push
```

## Required Changes to next.config.ts

You MUST update your `next.config.ts` to enable standalone output:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',  // <-- ADD THIS LINE
  // ... your other config
};

export default nextConfig;
```

## Files Included

| File | Description |
|------|-------------|
| `Dockerfile` | Multi-stage build for Next.js with standalone output |
| `next.config.ts.example` | Example config showing required settings |
| `.github/workflows/build-and-push.yml` | GitHub Actions workflow for building and pushing to GHCR |
| `k8s/configmap.yaml` | Runtime configuration (API URL, feature flags) |
| `k8s/deployment.yaml` | Kubernetes deployment with health checks |
| `k8s/service.yaml` | ClusterIP service |
| `k8s/ingress.yaml` | NGINX ingress for saas.local domain |
| `k8s/kustomization.yaml` | Kustomize configuration |

## After Pushing

1. The GitHub Actions workflow will automatically build and push images to GHCR
2. ArgoCD will detect the changes in the `k8s/` folder and deploy automatically
3. Access the app at `http://saas.local` (or `http://localhost:3001` via port-forward)

## Customization

### Change API URL
Edit `k8s/configmap.yaml`:
```yaml
data:
  NEXT_PUBLIC_API_URL: "http://your-api-url.local"
```

### Change Replica Count
Edit `k8s/deployment.yaml`:
```yaml
spec:
  replicas: 3  # Change from 2 to desired count
```

### Change Domain
Edit `k8s/ingress.yaml`:
```yaml
spec:
  rules:
    - host: your-domain.com  # Change from saas.local
```

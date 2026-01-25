# Frontend Deployment Guide - Vercel

This guide covers deploying the Next.js frontend to Vercel.

## Prerequisites

1. **GitHub Account** - Code must be pushed to GitHub
2. **Vercel Account** - Sign up at https://vercel.com
3. **Backend Deployed** - You need the backend URL from Railway (see `../backend/DEPLOYMENT.md`)

## Step 1: Push Code to GitHub

Ensure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare frontend for deployment"
git push origin main
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Authorize Vercel to access your GitHub account if needed

## Step 3: Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)
6. **Node.js Version**: 18.x or higher (default)

## Step 4: Set Environment Variables

Click on **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

**Important**: Replace `your-backend.up.railway.app` with your actual Railway backend URL.

### Environment Options
- **Production**: Used for production deployments
- **Preview**: Used for preview deployments (PR branches)
- **Development**: Used for local development

Set the variable for **all environments** or just **Production** depending on your needs.

## Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build the Next.js application
   - Deploy to production
3. Wait for deployment to complete (2-5 minutes)
4. View deployment logs in real-time

## Step 6: Get Your Frontend URL

After deployment succeeds:

1. Copy your frontend URL (e.g., `https://your-app.vercel.app`)
2. Test the URL in your browser
3. Verify the application loads correctly

## Step 7: Update Backend Configuration

Now update your backend with the frontend URL:

1. Go to Railway → Backend service → **Variables**
2. Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Click **"Redeploy"** in Railway

This ensures CORS and authentication redirects work correctly.

## Step 8: Test Your Deployment

### Basic Tests

1. **Homepage**: Visit your Vercel URL
2. **Registration**: Try registering a new user
3. **Login**: Test the login flow
4. **API Connection**: Check browser console for API errors

### Full Integration Test

1. Register a new account
2. Verify email (check SendGrid)
3. Login with new account
4. Test subscription flow
5. Verify Stripe payment works
6. Check webhook processing

### Check Browser Console

Open browser DevTools (F12) and check:
- No CORS errors
- API calls succeed
- No 404 errors for resources

## Custom Domain (Optional)

### Add Custom Domain

1. Go to your Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Click **"Add"**

### Configure DNS

Vercel will provide DNS records. Add them to your domain registrar:

**Option 1: CNAME (Recommended for subdomains)**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**Option 2: A Record (For root domain)**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Verify Domain

1. Wait for DNS propagation (5-60 minutes)
2. Vercel will automatically verify and issue SSL certificate
3. Your app will be available at your custom domain

### Update Backend

After adding custom domain, update Railway:
```
FRONTEND_URL=https://app.yourdomain.com
```

## Environment Variables Management

### View Variables
1. Go to Vercel project → **Settings** → **Environment Variables**
2. View and edit existing variables

### Add More Variables

Common additional variables:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_NAME=Your SaaS Name
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Note**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Update Variables

1. Edit variable in Vercel dashboard
2. Click **"Save"**
3. Redeploy for changes to take effect

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

### Production Deployments
- Triggered by pushes to `main` branch
- Uses production environment variables
- Assigns to production domain

### Preview Deployments
- Triggered by pushes to other branches
- Creates unique preview URL
- Uses preview environment variables
- Great for testing before merging

### Disable Auto-Deploy (Optional)
1. Go to **Settings** → **Git**
2. Configure branch deployment settings
3. Disable preview deployments if needed

## Monitoring and Analytics

### View Deployments
1. Go to Vercel project dashboard
2. See all deployments with status
3. Click deployment for details

### View Logs
1. Click on a deployment
2. Go to **"Logs"** tab
3. View build and runtime logs
4. Filter by type (build, serverless function, edge)

### Performance Monitoring

Vercel provides built-in analytics:

1. Go to **Analytics** tab
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Geographic distribution
   - Web Vitals (Core Web Vitals)

### Speed Insights

1. Enable in **Settings** → **Speed Insights**
2. Monitor performance metrics:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

## Troubleshooting

### Build Failures

**Check Build Logs**:
1. Go to deployment → **Logs** tab
2. Look for error messages

**Common Issues**:
- Missing dependencies: Check `package.json`
- TypeScript errors: Run `npm run build` locally
- Environment variables: Verify all required vars are set
- Node version: Ensure compatible version

### Runtime Errors

**Check Function Logs**:
1. Go to deployment → **Logs** tab
2. Filter for runtime errors

**Common Issues**:
- API connection fails: Check `NEXT_PUBLIC_API_URL`
- CORS errors: Verify backend `FRONTEND_URL`
- 404 errors: Check routing configuration

### API Connection Issues

**Symptoms**:
- "Network Error" in browser
- API calls fail
- CORS errors

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend CORS configuration
3. Ensure backend `FRONTEND_URL` matches Vercel URL
4. Test API directly: `curl https://your-backend.up.railway.app/api/health`

### Performance Issues

**Slow Loading**:
- Enable Vercel Image Optimization
- Use Next.js Image component
- Optimize bundle size
- Enable caching headers

**Check Performance**:
- Use Lighthouse in Chrome DevTools
- Check Vercel Analytics
- Monitor Web Vitals

## Optimization Tips

### Image Optimization

Use Next.js Image component:
```jsx
import Image from 'next/image'

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={100}
  priority
/>
```

### Code Splitting

Next.js automatically code-splits. For dynamic imports:
```jsx
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('../components/Heavy'))
```

### Caching

Configure in `next.config.ts`:
```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

### Bundle Analysis

Analyze bundle size:
```bash
npm install @next/bundle-analyzer
```

Add to `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## Security Best Practices

- [ ] Use environment variables for secrets
- [ ] Never commit `.env.local` to git
- [ ] Use HTTPS only (Vercel default)
- [ ] Enable Vercel security headers
- [ ] Implement Content Security Policy
- [ ] Use Vercel's Web Application Firewall
- [ ] Enable DDoS protection
- [ ] Regularly update dependencies
- [ ] Use Vercel's authentication if needed

### Security Headers

Add to `next.config.ts`:
```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
}
```

## Scaling

### Automatic Scaling

Vercel automatically scales based on traffic:
- Serverless functions scale automatically
- Edge Network handles CDN distribution
- No manual scaling needed

### Performance Tiers

**Hobby (Free)**:
- Personal projects
- Unlimited bandwidth
- 100GB bandwidth/month
- 6,000 build minutes/month

**Pro ($20/month)**:
- Commercial projects
- Enhanced DDoS protection
- Priority support
- Advanced analytics

**Enterprise (Custom)**:
- SLA guarantees
- Dedicated support
- Custom contracts
- Advanced security

## Cost Management

### Vercel Pricing

**Free Tier Includes**:
- 100GB bandwidth/month
- 6,000 build minutes/month
- Unlimited deployments
- Automatic HTTPS

**When to Upgrade**:
- Commercial projects
- Need more bandwidth
- Want advanced analytics
- Need priority support

### Cost Optimization

- Use Vercel's built-in Image Optimization
- Enable caching
- Optimize bundle size
- Use ISR (Incremental Static Regeneration)
- Monitor bandwidth usage

## CI/CD Integration

### GitHub Integration

Vercel automatically integrates with GitHub:

1. **Automatic Deployments**: Push to deploy
2. **Preview Deployments**: PR previews
3. **Comments**: Deployment URLs in PRs
4. **Checks**: Build status in PRs

### Custom Workflow (Optional)

Create `.github/workflows/vercel.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd frontend
          npm ci
          npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **Vercel Community**: https://github.com/vercel/next.js/discussions

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Connect to backend
3. ✅ Test full application
4. 🎨 Add custom domain (optional)
5. 📊 Set up monitoring
6. 🚀 Launch to users!

---

**Frontend URL**: Your application is live at:
```
https://your-app.vercel.app
```

**Remember**: After deployment, update the backend's `FRONTEND_URL` environment variable in Railway!

# Vercel Deployment Guide

This guide will help you deploy Vintiq to Vercel.

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your GitHub repository is pushed to GitHub

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `vintiq` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository (`gentaArnezzi/vintiq`)
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
4. Click "Deploy"

## Environment Variables

This project doesn't require any environment variables for basic functionality.

## Post-Deployment

After deployment, your app will be available at:
- Production: `https://vintiq.vercel.app` (or your custom domain)
- All commits to `main` branch will auto-deploy

## Custom Domain (Optional)

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify `next.config.ts` is correct

### Camera Not Working
- Ensure you're accessing via HTTPS (Vercel provides this by default)
- Camera API requires secure context

## Updates

To deploy updates:
- **Via Git**: Just push to `main` branch, Vercel will auto-deploy
- **Via CLI**: Run `vercel --prod` again

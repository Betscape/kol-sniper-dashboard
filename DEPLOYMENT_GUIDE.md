# 🚀 KOL Sniper Dashboard - Deployment Guide

## ✅ Current Status
- **MongoDB Atlas**: ✅ Connected and tested
- **API Integration**: ✅ Working perfectly
- **Next.js App**: ✅ Built and ready

## 🔧 Next Steps

### 1. GitHub Repository Setup

#### Option A: Create New Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click "New repository" (green button)
3. Repository name: `kol-sniper-dashboard`
4. Description: `Real-time KOL trading dashboard for Solana meme coins`
5. Set to **Public** (for free Vercel deployment)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

#### Option B: Use Existing Repository
1. Go to your existing repository
2. Make sure it's set to **Public** for free Vercel deployment

### 2. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: KOL Sniper Dashboard"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/kol-sniper-dashboard.git

# Push to GitHub
git push -u origin main
```

### 3. Vercel Deployment

#### Step 1: Connect GitHub to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your `kol-sniper-dashboard` repository
5. Vercel will automatically detect it's a Next.js project

#### Step 2: Configure Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables:

```env
MONGODB_URI=mongodb+srv://jgero961_db_user:EuiabpUVUqJ67sz7@main.en214w1.mongodb.net/?retryWrites=true&w=majority&appName=main
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=kol-sniper-dashboard-secret-key-2024
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Step 3: Deploy
1. Click "Deploy" button
2. Wait for deployment to complete (2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

### 4. Google OAuth Setup (Optional)

#### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-app-name.vercel.app/api/auth/callback/google` (production)

#### Step 2: Update Environment Variables
Add your Google OAuth credentials to Vercel environment variables:
- `GOOGLE_CLIENT_ID`: Your Google Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google Client Secret

### 5. MongoDB Atlas Security (Important!)

#### Step 1: Network Access
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to "Network Access"
3. Click "Add IP Address"
4. Add `0.0.0.0/0` (allow all IPs) for Vercel deployment
5. Or add specific Vercel IP ranges

#### Step 2: Database User
1. Go to "Database Access"
2. Verify your user `jgero961_db_user` has read/write permissions
3. If needed, create a new user with proper permissions

### 6. Test Your Deployment

#### Local Testing
```bash
# Install dependencies
npm install

# Create .env.local file with your MongoDB URI
echo "MONGODB_URI=mongodb+srv://jgero961_db_user:EuiabpUVUqJ67sz7@main.en214w1.mongodb.net/?retryWrites=true&w=majority&appName=main" > .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
echo "NEXTAUTH_SECRET=kol-sniper-dashboard-secret-key-2024" >> .env.local

# Run development server
npm run dev
```

#### Production Testing
1. Visit your Vercel URL
2. Test all features:
   - Homepage loads with token data
   - KOL leaderboard works
   - Token details pages load
   - Authentication works (if Google OAuth is set up)

### 7. Vercel Cron Jobs

The app is configured with automatic data refresh:
- **Frequency**: Every 5 minutes
- **Endpoint**: `/api/refresh-data`
- **Status**: Automatically enabled in Vercel

### 8. Monitoring & Analytics

#### Vercel Analytics
1. Go to your project dashboard
2. Enable Vercel Analytics for usage insights
3. Monitor performance and errors

#### MongoDB Atlas Monitoring
1. Check your Atlas dashboard for:
   - Database performance
   - Connection metrics
   - Storage usage

## 🎯 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/kol-sniper-dashboard.git
cd kol-sniper-dashboard
npm install

# Create environment file
cp env.example .env.local
# Edit .env.local with your credentials

# Run locally
npm run dev

# Build for production
npm run build
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check network access in Atlas
   - Verify connection string
   - Ensure database user has proper permissions

2. **Vercel Build Failed**
   - Check environment variables
   - Verify all dependencies are installed
   - Check build logs in Vercel dashboard

3. **API Not Working**
   - Verify API endpoint is accessible
   - Check CORS settings
   - Monitor API rate limits

## 📞 Support

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify MongoDB Atlas connection
3. Test API endpoints manually
4. Check browser console for errors

## 🎉 Success!

Once deployed, your KOL Sniper Dashboard will be live and ready to help traders make data-driven decisions in the Solana meme coin ecosystem!

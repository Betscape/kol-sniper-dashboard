# 🔄 Manual Data Refresh Guide

## 🎯 **For Free Vercel Accounts**

Since you're on a free Vercel account, cron jobs are limited to 2 per account and only run once a day. Here's how to manually refresh your data:

### **Option 1: Manual Refresh via URL**
1. **Visit your live app**: `https://kol-sniper-dashboard.vercel.app/`
2. **Go to**: `https://kol-sniper-dashboard.vercel.app/api/refresh-data`
3. **This will trigger a data refresh** and fetch the latest token data
4. **Refresh your homepage** to see the updated data

### **Option 2: Add Refresh Button to App**
You can add a "Refresh Data" button to your dashboard that users can click to update the data.

### **Option 3: Upgrade to Pro (Optional)**
If you want automatic data refresh every 5 minutes:
1. **Upgrade to Vercel Pro** ($20/month)
2. **Restore the cron job** in `vercel.json`
3. **Data will refresh automatically**

## 🚀 **Current Status**

Your app will work perfectly without cron jobs! The data refresh API endpoint is still available, you just need to trigger it manually or add a refresh button to your UI.

## 📱 **How to Use**

1. **Deploy your app** (without cron jobs)
2. **Visit the homepage** - it will load with cached data
3. **Manually refresh data** by visiting `/api/refresh-data`
4. **Users can refresh** the page to see updated data

**Your KOL Sniper Dashboard will work great even without automatic cron jobs!** 🎉

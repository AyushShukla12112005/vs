# Pre-Deployment Checklist ✅

## Files Ready for Deployment

### ✅ Backend Configuration
- [x] `backend/api/index.js` - Serverless handler created
- [x] `backend/vercel.json` - Optimized (no memory warnings)
- [x] `backend/package.json` - Updated with engines and main entry
- [x] `backend/.vercelignore` - Excludes unnecessary files
- [x] `backend/config/db.js` - Production-safe MongoDB connection

### ✅ Warnings Fixed
- [x] Removed `memory` setting from vercel.json (Active CPU billing)
- [x] `node-domexception` warning (dev dependency, won't affect production)
- [x] No `builds` array (uses Vercel auto-detection)

## Required Environment Variables

### Critical (Must Set):
```
NODE_ENV=production
JWT_SECRET=your-secret-key-minimum-32-characters-long
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bugtracker?retryWrites=true&w=majority
```

### Optional (Email Features):
```
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your-email@ethereal.email
EMAIL_PASS=your-password
```

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to https://mongodb.com/cloud/atlas
   - Create free M0 cluster
   - Choose region closest to your users

2. **Create Database User**
   - Database Access → Add New Database User
   - Username: `bugtracker-user`
   - Password: Generate secure password
   - Role: Read and write to any database

3. **Network Access**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - (Required for Vercel serverless functions)

4. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `bugtracker`

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Optimize for Vercel deployment"
git push origin main
```

### 2. Deploy Backend
1. Go to https://vercel.com/new
2. Import your repository
3. **Root Directory**: `backend`
4. **Framework Preset**: Other
5. **Build Command**: (leave empty)
6. **Output Directory**: (leave empty)
7. **Install Command**: `npm install`

### 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- Add all required variables listed above
- Make sure to select "Production" environment

### 4. Deploy
- Click "Deploy"
- Wait for deployment to complete
- Copy your backend URL

### 5. Test Backend
Visit these URLs (replace with your actual URL):
- `https://your-backend.vercel.app/` - Should show API info
- `https://your-backend.vercel.app/api/health` - Should return `{"ok":true}`

### 6. Deploy Frontend
1. Update `frontend/vercel.json` with your backend URL
2. Create new Vercel project
3. **Root Directory**: `frontend`
4. **Framework Preset**: Vite
5. Deploy

## Verification Tests

After deployment, test these endpoints:

### Backend Health
```bash
curl https://your-backend.vercel.app/api/health
# Expected: {"ok":true}
```

### Register User
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'
# Expected: User object with token
```

### Login
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Expected: User object with token
```

## Common Issues & Solutions

### Issue: "MONGODB_URI is required in production"
**Solution**: Add MONGODB_URI to Vercel environment variables

### Issue: "MongoDB connection timeout"
**Solution**: 
- Check MongoDB Atlas network access allows `0.0.0.0/0`
- Verify connection string is correct
- Ensure database user has correct permissions

### Issue: "JWT_SECRET is not set"
**Solution**: Add JWT_SECRET to Vercel environment variables (min 32 chars)

### Issue: Still getting function invocation errors
**Solution**: 
- Check Vercel deployment logs
- Verify all environment variables are set
- Test MongoDB connection string locally first

## Success Indicators

✅ Deployment completes without errors
✅ `/api/health` returns `{"ok":true}`
✅ Can register new user
✅ Can login
✅ Can create projects
✅ No errors in Vercel logs

## Post-Deployment

1. Test all API endpoints
2. Update frontend with backend URL
3. Deploy frontend
4. Test full application flow
5. Monitor Vercel logs for any issues

---

## Quick Deploy Command

```bash
# After setting up MongoDB and environment variables
git add .
git commit -m "Ready for deployment"
git push origin main
# Then deploy via Vercel dashboard
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test MongoDB connection
4. Review VERCEL-FIX.md for detailed troubleshooting

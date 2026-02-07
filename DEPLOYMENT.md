# Bug Tracker - Vercel Deployment Guide

## Project Structure
```
bug-tracker/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express backend
└── vercel.json        # Root Vercel configuration
```

## Recommended: Deploy Backend Separately

For best results, deploy the backend as a separate Vercel project.

### Backend Deployment Steps:

1. **Create New Vercel Project**
   - Go to https://vercel.com/new
   - Import your repository
   - Set **Root Directory** to `backend`
   - Framework Preset: **Other**

2. **Configure Build Settings** (in Vercel Dashboard)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

3. **Add Environment Variables** (CRITICAL!)
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bugtracker?retryWrites=true&w=majority
   ```
   
   **Important Notes:**
   - `MONGODB_URI` is **REQUIRED** - in-memory MongoDB won't work on Vercel
   - `JWT_SECRET` must be at least 32 characters
   - Email variables are optional (for password reset feature)

4. **Deploy**
   - Click "Deploy"
   - Note your backend URL (e.g., `https://your-backend.vercel.app`)
   - Test: `https://your-backend.vercel.app/api/health`

### Frontend Deployment Steps:

1. **Update Frontend Configuration**
   - Edit `frontend/vercel.json`
   - Replace `https://your-backend-url.vercel.app` with your actual backend URL

2. **Create New Vercel Project**
   - Import your repository again
   - Set **Root Directory** to `frontend`
   - Framework Preset: **Vite**

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Your frontend will be live!

## Important: MongoDB Setup

**You MUST use MongoDB Atlas for production:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs: `0.0.0.0/0` (for Vercel)
5. Get connection string
6. Add to Vercel environment variables as `MONGODB_URI`

## Environment Variables Reference

### Backend Required Variables:
```env
NODE_ENV=production
JWT_SECRET=your-secret-key-at-least-32-characters-long
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Backend Optional Variables (Email):
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your-email@ethereal.email
EMAIL_PASS=your-password
```

## Vercel Configuration Files

### backend/vercel.json
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/server.js"
    }
  ]
}
```

This simple configuration:
- ✅ No `builds` array (uses Vercel's automatic detection)
- ✅ Routes all requests to server.js
- ✅ Works with Vercel's project settings

### frontend/vercel.json
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.vercel.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Testing Before Deployment

### Test Backend Locally:
```bash
cd backend
npm install
npm start
# Test at http://localhost:5000/api/health
```

### Test Frontend Locally:
```bash
cd frontend
npm install
npm run build
npm run preview
# Test at http://localhost:4173
```

## Post-Deployment Checklist

- [ ] Backend health check works: `https://your-backend.vercel.app/api/health`
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] Can register new user
- [ ] Can login
- [ ] Can create project
- [ ] Can create issue
- [ ] MongoDB connection working

## Troubleshooting

### Error: "WARN! Due to builds existing..."
**Solution:** Remove `builds` array from vercel.json (already done)

### Error: MongoDB connection failed
**Solution:** 
- Check MONGODB_URI is correct
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Ensure database user has read/write permissions

### Error: JWT authentication fails
**Solution:** 
- Ensure JWT_SECRET is set in Vercel environment variables
- JWT_SECRET must be at least 32 characters

### Error: CORS issues
**Solution:** Backend already has CORS enabled. If issues persist:
- Check backend URL in frontend vercel.json
- Ensure no trailing slashes in URLs

### Error: 404 on API calls
**Solution:** 
- Verify backend URL in frontend/vercel.json
- Check API routes start with `/api/`
- Test backend directly: `https://your-backend.vercel.app/api/health`

## Production URLs (Update after deployment)

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-api.vercel.app
- **MongoDB**: mongodb+srv://...

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

---

**Note**: The in-memory MongoDB used in development will NOT work in production. You MUST use MongoDB Atlas or another cloud MongoDB service.

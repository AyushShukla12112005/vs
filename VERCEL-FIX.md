# Vercel FUNCTION_INVOCATION_FAILED Fix

## Problem
Error: `500: INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED`

## Root Cause
The original `server.js` was designed for traditional Node.js hosting with `app.listen()`, which doesn't work in Vercel's serverless environment.

## Solution
Created a Vercel-compatible serverless function handler.

## Changes Made

### 1. Created `backend/api/index.js`
This is the new entry point for Vercel serverless functions:
- ✅ No `app.listen()` - uses serverless handler
- ✅ Database connection caching
- ✅ Proper error handling
- ✅ Compatible with Vercel's serverless architecture

### 2. Updated `backend/vercel.json`
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

### 3. Updated `backend/config/db.js`
- ✅ Prevents in-memory MongoDB in production
- ✅ Requires MONGODB_URI in production
- ✅ Optimized for serverless with connection timeouts
- ✅ Better error messages

### 4. Created `backend/.vercelignore`
Excludes unnecessary files from deployment.

## Critical Requirements

### ⚠️ MONGODB_URI is REQUIRED
You **MUST** set `MONGODB_URI` in Vercel environment variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bugtracker?retryWrites=true&w=majority
```

Without this, the deployment will fail because:
- In-memory MongoDB doesn't work in serverless
- Production mode requires a real database

### ⚠️ JWT_SECRET is REQUIRED
```
JWT_SECRET=your-secret-key-at-least-32-characters-long
```

## How to Deploy

1. **Set up MongoDB Atlas** (if not done)
   - Create free cluster at https://mongodb.com/cloud/atlas
   - Create database user
   - Whitelist all IPs: `0.0.0.0/0`
   - Copy connection string

2. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Fix Vercel serverless deployment"
   git push
   ```

3. **Deploy to Vercel**
   - Go to your Vercel project
   - Go to Settings → Environment Variables
   - Add:
     - `NODE_ENV` = `production`
     - `JWT_SECRET` = `your-secret-key`
     - `MONGODB_URI` = `mongodb+srv://...`
   - Redeploy

4. **Test**
   - Visit: `https://your-backend.vercel.app/api/health`
   - Should return: `{"ok":true}`

## File Structure

```
backend/
├── api/
│   └── index.js          # ← NEW: Vercel serverless handler
├── config/
│   └── db.js             # ← UPDATED: Production-safe
├── routes/
│   ├── auth.js
│   ├── projects.js
│   └── ...
├── models/
│   └── ...
├── server.js             # ← Still used for local development
├── vercel.json           # ← UPDATED: Points to api/index.js
├── .vercelignore         # ← NEW: Excludes test files
└── package.json

```

## Local Development
The original `server.js` still works for local development:
```bash
npm run dev
```

## Vercel Deployment
Uses `api/index.js` automatically via vercel.json configuration.

## Troubleshooting

### Still getting FUNCTION_INVOCATION_FAILED?
1. Check Vercel logs for specific error
2. Verify `MONGODB_URI` is set correctly
3. Verify `JWT_SECRET` is set
4. Check MongoDB Atlas allows connections from `0.0.0.0/0`
5. Ensure database user has read/write permissions

### MongoDB connection timeout?
- Check MongoDB Atlas network access settings
- Verify connection string format
- Try increasing timeout in `config/db.js`

### JWT errors?
- Ensure `JWT_SECRET` is at least 32 characters
- Check it's set in Vercel environment variables

## Success Indicators

✅ Deployment completes without errors
✅ `/api/health` returns `{"ok":true}`
✅ Can register new user
✅ Can login
✅ Can create projects

---

**Note**: The `server.js` file is kept for local development. Vercel automatically uses `api/index.js` based on the vercel.json configuration.

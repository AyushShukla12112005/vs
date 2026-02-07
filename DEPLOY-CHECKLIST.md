# Quick Deployment Checklist

## ✅ Pre-Deployment

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access set to `0.0.0.0/0` (allow all IPs)
- [ ] Connection string copied
- [ ] JWT_SECRET generated (min 32 characters)
- [ ] Code pushed to GitHub

## ✅ Backend Deployment

1. **Create Vercel Project**
   - [ ] Go to https://vercel.com/new
   - [ ] Import your GitHub repository
   - [ ] Set Root Directory: `backend`
   - [ ] Framework: Other

2. **Environment Variables** (in Vercel Dashboard)
   - [ ] `NODE_ENV` = `production`
   - [ ] `JWT_SECRET` = `your-secret-key-min-32-chars`
   - [ ] `MONGODB_URI` = `mongodb+srv://...`
   - [ ] `EMAIL_HOST` = `smtp.ethereal.email` (optional)
   - [ ] `EMAIL_PORT` = `587` (optional)
   - [ ] `EMAIL_USER` = `your-email` (optional)
   - [ ] `EMAIL_PASS` = `your-password` (optional)

3. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment to complete
   - [ ] Copy backend URL (e.g., `https://your-backend.vercel.app`)
   - [ ] Test: `https://your-backend.vercel.app/api/health`

## ✅ Frontend Deployment

1. **Update Configuration**
   - [ ] Edit `frontend/vercel.json`
   - [ ] Replace backend URL with your actual backend URL

2. **Create Vercel Project**
   - [ ] Go to https://vercel.com/new
   - [ ] Import your GitHub repository
   - [ ] Set Root Directory: `frontend`
   - [ ] Framework: Vite

3. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment to complete
   - [ ] Open frontend URL

## ✅ Post-Deployment Testing

- [ ] Frontend loads successfully
- [ ] Can register new user
- [ ] Can login with test user
- [ ] Can create project
- [ ] Can create issue
- [ ] Can edit project
- [ ] Can delete project
- [ ] Sidebar shows projects
- [ ] Kanban board works
- [ ] Settings page works

## 🎉 Deployment Complete!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.vercel.app`

**Test Credentials:**
- Email: test@example.com
- Password: password123

---

## 🔧 If Something Goes Wrong

1. Check Vercel deployment logs
2. Check browser console (F12)
3. Test backend directly: `/api/health`
4. Verify environment variables in Vercel
5. Check MongoDB Atlas connection
6. See DEPLOYMENT.md for detailed troubleshooting

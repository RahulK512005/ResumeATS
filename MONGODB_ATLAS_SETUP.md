# MongoDB Atlas Setup Guide

Follow these steps to connect your backend to MongoDB Atlas:

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (or use Google/GitHub)
3. Select "Free" tier (M0 Sandbox)

## Step 2: Create Cluster
1. After login, click **"Create"**
2. Select **"Free" (M0)** tier
3. Choose a cloud provider (AWS recommended) and a region near you
4. Click **"Create Cluster"** (takes 1-3 minutes)

## Step 3: Configure Network Access
1. Go to **Network Access** in left sidebar
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere" (0.0.0.0/0)**
4. Click **"Confirm"**

## Step 4: Create Database User
1. Go to **Database Access** in left sidebar
2. Click **"Add New Database User"**
3. Create a username (e.g., `admin`)
4. Create a strong password - **SAVE THIS!**
5. Click **"Add User"**

## Step 5: Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Drivers"**
4. You'll see a connection string like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xyz123.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Backend .env File

Open `Resume-ATS-Backend/backend/.env` and replace the MONGO_URI line:

**Before:**
```
MONGO_URI=mongodb://127.0.0.1:27017/ats
```

**After (replace with your connection string):**
```
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xyz123.mongodb.net/ats?retryWrites=true&w=majority
```

**Important:** Replace:
- `your_username` with your database username
- `your_password` with your database password
- `cluster0.xyz123` with your actual cluster name

## Step 7: Restart Backend
1. Stop the running backend (Ctrl+C in terminal)
2. Run: `cd Resume-ATS-Backend/backend && npm start`

## Troubleshooting
- **Auth failed**: Make sure username/password is correct in connection string
- **Network error**: Ensure IP Access is set to Allow Anywhere (0.0.0.0/0)
- **Timeout**: Check cluster status is "Running" in Atlas dashboard

# How to Get Your MongoDB Atlas Connection String

Follow these steps to get your connection string:

## Step 1: Go to MongoDB Atlas
1. Open https://cloud.mongodb.com/
2. Log in to your account

## Step 2: Navigate to Your Cluster
1. Click on **"Database"** in the left sidebar
2. Click on your cluster name (e.g., "Cluster0")

## Step 3: Get Connection String
1. Click the **"Connect"** button
2. Select **"Drivers"** option
3. You'll see a connection string like this:

```
mongodb+srv://myUser:myPassword@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

## Step 4: Replace Placeholders
In that string, replace:
- `myUser` → your database username
- `myPassword` → your database password

## Example
If your username is "admin" and password is "secret123", your connection string would be:
```
mongodb+srv://admin:secret123@cluster0.abc123.mongodb.net/ats?retryWrites=true&w=majority
```

## Next Steps
Once you have your connection string, paste it here and I'll update the backend configuration for you.

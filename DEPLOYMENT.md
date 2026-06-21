# Vercel Deployment Guide - PGinfo.online Frontend

This guide provides step-by-step instructions to deploy the Vite-based React frontend of **PGinfo.online** to [Vercel](https://vercel.com).

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. **GitHub Account**: A GitHub repository containing your frontend codebase.
2. **Deployed Backend API URL**: Your backend's live URL from Render (e.g., `https://pginfo-backend.onrender.com/api/v1`).

---

## 🚀 Step-by-Step Deployment on Vercel

### Step 1: Push your Code to GitHub
Ensure all your files (including `vercel.json`, updated `.gitignore`, and `.env.example`) are committed and pushed to your remote GitHub repository.
> [!WARNING]
> Do NOT push your local `.env` or `.env.local` files to GitHub. Vercel will manage these values securely in the cloud.

### Step 2: Create a New Project on Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** and select **Project**.
3. Under **Import Git Repository**, connect your GitHub account, find your repository, and click **Import**.

### Step 3: Configure Project Settings
Fill in the configuration details:

1. **Framework Preset**: Vercel should auto-detect **Vite**. If not, select **Vite** from the dropdown.
2. **Root Directory**: Click **Edit** next to the root directory, select the `frontend` folder, and click **Continue**.
3. **Build & Development Settings**: Keep the default values:
   * Build Command: `npm run build`
   * Output Directory: `dist`
   * Install Command: `npm install`

---

### Step 4: Configure Environment Variables
Under the **Environment Variables** section on the Vercel project configuration page, add the following key-value pair:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend.onrender.com/api/v1` | **Required**: The live URL of your backend. Make sure to append `/api/v1` at the end! |

*Click **Add** to save the variable.*

---

### Step 5: Deploy and Verify
1. Click the **Deploy** button.
2. Vercel will install the dependencies, compile the React build using Vite, and set up your production URL.
3. Once completed, Vercel will show a preview screen and provide a production domain (e.g., `https://pginfo-web.vercel.app`).
4. Click on the URL and test the website in your browser. Navigating to pages like `/login` or `/search` and performing hard refreshes should work perfectly, thanks to the rewrite rules in `vercel.json`.

---

## 🔗 Syncing CORS with your Render Backend

For the frontend and backend to communicate without being blocked by browser CORS security policies, you must authorize your new Vercel domain in your backend's environment variables:

1. Copy your live Vercel frontend URL (e.g. `https://pginfo-web.vercel.app`).
2. Log in to the [Render Dashboard](https://dashboard.render.com).
3. Open your backend Web Service page, and go to the **Environment** tab in the sidebar.
4. Locate the `CLIENT_URL` environment variable and update its value to include your new Vercel URL:
   * **Single Origin**: `https://pginfo-web.vercel.app`
   * **Multiple Origins**: `https://pginfo-web.vercel.app,http://localhost:5173` (separated by commas)
5. Save the environment variable changes. Render will automatically redeploy the backend with the new configuration.

# Vercel Deployment Setup Guide

This guide will help you deploy your Ankify application to Vercel and configure all necessary environment variables.

## Prerequisites

- A Vercel account
- Your Supabase project credentials
- Your OpenAI API key
- Your PayPal developer credentials

## Step 1: Deploy to Vercel

1. Push your code to GitHub (if not already done)
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. **Don't deploy yet** - we need to configure environment variables first

## Step 2: Configure Environment Variables

In your Vercel project settings, go to **Settings > Environment Variables** and add the following:

### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**Where to find these:**
- Go to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings > API**
- Copy the Project URL and API keys

### OpenAI Configuration

```
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Where to find this:**
- Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
- Create a new secret key if you don't have one

### PayPal Configuration

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

**Where to find these:**
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications)
2. Sign in with your PayPal account
3. Click "Create App" or select an existing app
4. Copy the **Client ID** and **Secret**

> **Important:** Make sure to use **Sandbox credentials** for testing and **Live credentials** for production.

## Step 3: Configure Supabase Redirect URLs

This is **critical** for Google OAuth to work correctly in production.

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication > URL Configuration**
4. Under **Redirect URLs**, add your production URL:
   ```
   https://your-app-name.vercel.app/auth/callback
   ```
5. Keep the localhost URL for local development:
   ```
   http://localhost:3000/auth/callback
   ```
6. Click **Save**

### Site URL Configuration

Also update the **Site URL** to your production domain:
```
https://your-app-name.vercel.app
```

## Step 4: Deploy

1. After adding all environment variables, click **Deploy**
2. Wait for the deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 5: Verify Everything Works

### Test Google OAuth
1. Go to your deployed app
2. Click "Sign in with Google"
3. Verify it redirects to your production URL (not localhost)
4. Complete the sign-in process

### Test PayPal Subscriptions
1. Sign in to your app
2. Go to the dashboard
3. Verify PayPal buttons appear (not "PayPal Client ID missing")
4. Test a subscription flow (use PayPal Sandbox for testing)

## Troubleshooting

### Google OAuth still redirects to localhost

**Problem:** After deployment, Google OAuth redirects to `http://localhost:3000`

**Solution:**
1. Double-check you added your production URL to Supabase redirect URLs
2. Make sure you saved the changes in Supabase
3. Clear your browser cache
4. Try signing in again

### PayPal buttons not showing

**Problem:** "PayPal Client ID missing" error appears

**Solution:**
1. Verify `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in Vercel environment variables
2. Make sure the variable name is **exactly** `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (case-sensitive)
3. Redeploy your application after adding the variable
4. Check the Vercel deployment logs for any errors

### Environment variables not working

**Problem:** Changes to environment variables don't take effect

**Solution:**
1. After changing environment variables in Vercel, you **must redeploy**
2. Go to **Deployments** tab
3. Click the three dots on the latest deployment
4. Click **Redeploy**

## Important Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` to Git (it's in `.gitignore`)
- Use different PayPal credentials for development (Sandbox) and production (Live)
- Always test in PayPal Sandbox before going live

## Need Help?

If you're still experiencing issues:
1. Check the Vercel deployment logs
2. Check your browser console for errors
3. Verify all environment variables are set correctly
4. Make sure your Supabase project is active and not paused

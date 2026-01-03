# Setting Up Supabase Project "Ankify"

## Step 1: Create New Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"** button
3. Fill in the project details:
   - **Name**: `Ankify`
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Select your preferred plan (Free tier is fine for development)
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire contents of `schema.sql` file
4. Click **"Run"** to execute the SQL
5. Verify the tables were created by going to **Table Editor**

## Step 4: Update Environment Variables

Update your `.env.local` file with your new project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (if you have it)
OPENAI_API_KEY=your_openai_api_key

# LemonSqueezy Configuration (optional)
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

## Step 5: (Optional) Set Up Authentication Providers

If you want to use Google OAuth:
1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Google** provider
3. Add your Google OAuth credentials
4. Set redirect URL to: `http://localhost:3000/auth/callback`

## Step 6: Start the Development Server

```bash
npm run dev
```

Your app should now connect to the new "Ankify" Supabase project!


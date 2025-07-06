# Supabase Edge Functions Deployment Guide

## Current Status
Your Edge Functions are already created in the `supabase/functions/` directory:
- ✅ `script-generator` - Generates and serves obfuscated protection scripts
- ✅ `script-tracker` - Tracks events and clone detections
- ✅ `resend-email` - Handles email notifications
- ✅ `stripe-checkout` - Manages Stripe payment sessions
- ✅ `stripe-webhook` - Processes Stripe webhooks

## Automatic Deployment
Since you're using Bolt with Supabase integration, these functions should deploy automatically when your project is connected to Supabase.

## Manual Verification Steps

### 1. Check Function Status
In your Supabase dashboard:
1. Go to **Edge Functions** section
2. Verify all 5 functions are listed and deployed
3. Check their deployment status and logs

### 2. Environment Variables
Ensure these environment variables are set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (for email functionality)
- `STRIPE_SECRET_KEY` (for payments)
- `STRIPE_WEBHOOK_SECRET` (for webhooks)

### 3. Test Function Accessibility
Use the provided `test-functions.js` script to verify functions are accessible.

## Testing the Protection Script

### Step 1: Generate a Script
1. Run your CloneGuard application locally
2. Log in and go to Settings or Protected Domains
3. Add a test domain (e.g., `test-site.com`)
4. Copy the generated obfuscated script

### Step 2: Test on a Website
1. Use the provided `test-script-generation.html` file
2. Paste your script just before the closing `</body>` tag
3. Open the file in a browser
4. Simulate clone behavior by:
   - Changing the domain in the URL
   - Clicking buttons and links
   - Staying on the page for different durations

### Step 3: Monitor Results
1. Check your CloneGuard dashboard
2. Look for new entries in:
   - Analytics Dashboard
   - Clone Sites page
   - Real-time alerts

## Troubleshooting

### Functions Not Deploying
If functions aren't deploying automatically:
1. Check your Supabase connection in Bolt
2. Verify your project has the correct permissions
3. Check the Supabase dashboard for deployment errors

### Script Not Working
If the protection script isn't working:
1. Check browser console for errors
2. Verify the script ID is correct
3. Ensure the domain is properly configured
4. Check Supabase function logs for errors

### No Data in Dashboard
If you're not seeing data in the dashboard:
1. Verify the script is loading correctly
2. Check network requests in browser dev tools
3. Ensure the database tables exist
4. Check RLS policies are correctly configured

## Next Steps
1. Test the functions using the provided tools
2. Generate and test a protection script
3. Monitor the dashboard for incoming data
4. Configure protection settings as needed
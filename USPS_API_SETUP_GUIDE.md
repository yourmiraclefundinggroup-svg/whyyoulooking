# USPS API Setup Guide for ScoreShift

This guide will walk you through setting up USPS API access for real-time tracking of your dispute letters.

## What You'll Get
- Real-time tracking status for all certified mail
- Automatic delivery confirmation with signatures  
- 14-day follow-up alerts after delivery
- Complete tracking history and location updates
- Bulk tracking updates for all disputes

## Step-by-Step Registration

### Step 1: Create USPS Business Account
1. Go to https://reg.usps.com/entreg/RegistrationAction_input
2. Click "Create New Account" 
3. Choose "Business Account"
4. Fill out your business information:
   - Company Name: Your business name
   - Business Type: Choose appropriate type
   - Address: Your business address
   - Phone and Email

### Step 2: Access USPS Developer Portal
1. Visit: https://developers.usps.com
2. Click "Get Started" or "Sign In"
3. Log in with your USPS Business Account credentials from Step 1

### Step 3: Create Your Application
1. Once logged in, click the **"Apps"** button in the menu
2. Click "Create New App"
3. Fill out the application form:
   - **App Name**: ScoreShift Credit Repair
   - **Description**: Credit repair platform for tracking certified dispute letters
   - **Website**: https://scoreshiftapp.com
   - **Purpose**: Tracking certified mail for legal dispute letters

### Step 4: Get Your API Credentials
1. After creating your app, select it from your apps list
2. Go to the **"Credentials"** section
3. Copy these two important values:
   - **Consumer Key** (this is your USPS_CLIENT_ID)
   - **Consumer Secret** (this is your USPS_CLIENT_SECRET)

### Step 5: Authorize Your App
1. In the developer portal, find the "Authorization" section  
2. Enter your Consumer Key to authorize access to:
   - Payment accounts
   - Customer Registration IDs (CRIDs)
   - Mailer IDs (MIDs) 
   - Tracking permissions

### Step 6: Test Your Setup (Optional)
1. In the developer portal, go to "API Testing"
2. Try the tracking API with a sample tracking number
3. You should see JSON response with tracking data

## What to Do Next

Once you have your credentials:

1. **USPS_CLIENT_ID**: Your Consumer Key (starts with letters/numbers)
2. **USPS_CLIENT_SECRET**: Your Consumer Secret (longer string)

Provide these to me and I'll configure ScoreShift to use real USPS tracking!

## Important Notes

- **Free Service**: USPS APIs are completely free for businesses
- **Rate Limits**: 60 API calls per hour (plenty for typical use)
- **Testing**: I've set up the system to work with both sandbox and production
- **Modern API**: Using OAuth 2.0 (not the old XML system that expires in 2026)

## Troubleshooting

**Can't create business account?**
- Try using a different browser or clearing cookies
- Make sure you're using a business email address
- Contact USPS support: 1-800-344-7779

**Developer portal won't load?**
- The new portal is at https://developers.usps.com (not the old .usps.com links)
- Try incognito/private browsing mode

**Need help with business verification?**
- USPS may require additional business verification documents
- This is normal for new business accounts
- Process usually takes 1-2 business days

Ready to get started? Just let me know if you need help with any of these steps!
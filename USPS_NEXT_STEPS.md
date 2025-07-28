# USPS API - Next Steps After Account Creation

## Step 2: Access the Developer Portal

1. **Go to the USPS Developer Portal**: https://developers.usps.com
2. **Log in** using the USPS business account you just created
3. **Look for**: "Apps", "Applications", or "My Apps" in the navigation menu

## Step 3: Create Your Application

1. **Click "Apps"** or "Create New App"
2. **Fill out the form**:
   - **App Name**: ScoreShift Credit Repair
   - **Description**: Credit repair platform for tracking certified dispute letters
   - **Website**: https://scoreshiftapp.com
   - **Contact Email**: Your business email

## Step 4: Get Your Credentials

After creating the app, you'll see:
- **Consumer Key** (this is your USPS_CLIENT_ID)
- **Consumer Secret** (this is your USPS_CLIENT_SECRET)

**Copy both of these values** - they look something like:
- Consumer Key: `abc123def456` 
- Consumer Secret: `xyz789uvw012345`

## What to Send Me

Once you have those two values, just paste them here like this:
```
USPS_CLIENT_ID: [your consumer key]
USPS_CLIENT_SECRET: [your consumer secret]
```

That's it! I'll configure ScoreShift to use real USPS tracking immediately.

## If You're Having Trouble

**Can't find the developer portal?**
- Make sure you're at https://developers.usps.com (not the old site)
- Try logging out and back in
- Clear your browser cache

**Don't see "Apps" menu?**
- Look for "Applications", "My Apps", or "Developer" sections
- The interface may look different but the concept is the same

**Need business verification?**
- Some accounts require additional verification
- This is normal and usually takes 1-2 business days
- You can still get your credentials while verification is pending
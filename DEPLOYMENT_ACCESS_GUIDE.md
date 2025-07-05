# CreditFix Pro - Portal Access Guide

## Overview
CreditFix Pro features two separate authentication portals designed for different user types:
- **Client Portal**: View-only access for clients to see their credit repair progress
- **Admin Portal**: Full administrative access for CreditFix Pro staff to manage client accounts and create disputes

## Portal Access URLs

### When Deployed on Replit
After deploying your app using Replit's deployment button, both portals will be accessible through the same domain but with different login credentials:

**Main Application URL**: `https://your-app-name.replit.app`

Both the Client Portal and Admin Portal use the same login page but authenticate users differently based on their credentials and portal selection.

## How to Access Each Portal

### 1. Client Portal Access
**For your clients to access their view-only portal:**

1. Navigate to your deployed app URL: `https://your-app-name.replit.app`
2. The login screen will appear automatically
3. Select "**Client Portal**" button (blue, on the left)
4. Enter client credentials:
   - Use the email and password you provide to each client
   - Demo: `client@example.com` / `client123`
5. Click "Sign In"

**What clients can see:**
- Dashboard with credit score overview
- Credit Repair page showing sent disputes and USPS tracking
- View active credit issues and pending disputes
- "Client View" indicator in navigation
- No access to create new disputes or use AI features

### 2. Admin Portal Access
**For you (CreditFix Pro staff) to access the full admin system:**

1. Navigate to the same app URL: `https://your-app-name.replit.app`
2. Select "**Admin Portal**" button (blue, on the right)
3. Enter admin credentials:
   - Email: `admin@creditfixpro.com`
   - Password: `admin123`
4. Click "Sign In"

**What admins can access:**
- Full Dashboard with all features
- Credit Repair with dispute creation capabilities
- Credit Building tools
- Education content management
- Admin panel for client management
- AI-powered dispute letter generation
- All advanced features

## Security Features

### Portal Separation
- **Credential Validation**: Each portal validates that users have appropriate access levels
- **Cross-Portal Protection**: Admin credentials won't work in Client Portal and vice versa
- **Role-Based Access**: Features are hidden/disabled based on user access level

### Access Control
- **CLIENT_VIEWER**: Can only view existing data, cannot create or modify
- **ADMIN**: Full access to all features including client management and dispute creation

## Managing Client Access

### Creating New Client Accounts
1. Log into Admin Portal
2. Navigate to "Client Management" tab
3. Use "Create New Client" form to add client accounts
4. Provide clients with their login credentials
5. Clients use these credentials in the Client Portal

### Client Credentials Format
When you create client accounts, provide them with:
- **Portal**: Client Portal (important: they must select this)
- **Email**: The email address you set up for them
- **Password**: The password you assign (recommend strong passwords)
- **URL**: Your deployed app URL

## Demo Accounts

### Pre-configured Demo Accounts
Your app comes with demo accounts for immediate testing:

**Admin Demo Account:**
- Portal: Admin Portal
- Email: `admin@creditfixpro.com`
- Password: `admin123`

**Client Demo Account:**
- Portal: Client Portal  
- Email: `client@example.com`
- Password: `client123`

## Production Deployment Steps

### 1. Deploy to Replit
1. Click the "Deploy" button in your Replit workspace
2. Follow Replit's deployment process
3. Note your deployed app URL

### 2. Update Admin Credentials
For production, update the demo admin credentials in the authentication system:
- Change the admin email and password in `server/routes.ts`
- Update the demo credentials display in the login page

### 3. Client Onboarding Process
1. Create client accounts through Admin Portal
2. Provide clients with:
   - Your app's deployed URL
   - Their login credentials
   - Instructions to select "Client Portal"
   - Basic usage guide

### 4. Staff Training
Ensure your staff knows:
- Always use "Admin Portal" selection when logging in
- How to create and manage client accounts
- How to switch between client views for testing
- Client limitation guidelines

## Troubleshooting

### Common Access Issues

**"Access Denied" Messages:**
- Verify correct portal selection (Client vs Admin)
- Check credentials are correct
- Ensure account exists in system

**Features Not Visible:**
- Confirm user access level matches expected permissions
- Check if logged into correct portal type
- Verify account is properly configured

**Client Cannot See Their Data:**
- Ensure client account has associated credit data
- Check that disputes/issues are linked to correct client ID
- Verify client is using correct credentials

### Support Contacts
- **Technical Issues**: Contact your Replit support
- **Account Issues**: Use Admin Portal to manage client accounts
- **Feature Questions**: Reference the user documentation

## Best Practices

### For Administrators
1. Regularly update admin passwords
2. Use strong, unique passwords for client accounts
3. Monitor client portal usage
4. Keep client credentials secure
5. Test both portals regularly

### For Client Communication
1. Clearly explain which portal to use
2. Provide step-by-step login instructions
3. Set expectations about view-only access
4. Explain what clients can and cannot do
5. Provide contact information for support

---

**Next Steps**: Deploy your app and test both portal access methods to ensure everything works correctly for your business needs.
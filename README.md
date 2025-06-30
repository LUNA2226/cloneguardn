# CloneGuard - Anti-Cloning Protection Platform

This application provides advanced protection against website cloning with real-time detection, automated responses, and comprehensive analytics.

## 🚀 Features

### 🔐 Authentication System
- **Complete user authentication** with Supabase
- **Password recovery** via email using Resend
- **User registration** with automatic profile creation
- **Secure session management**

### 🛡️ Protection Features
- **Real-time clone detection**
- **Obfuscated protection scripts**
- **Automated anti-cloning actions**:
  - Traffic redirection
  - Visual sabotage
  - Link replacement
  - Image replacement
  - Visual interference

### 📊 Analytics & Monitoring
- **Comprehensive analytics dashboard**
- **Real-time visitor tracking**
- **Clone detection reports**
- **Geographic analysis**
- **Device and browser statistics**
- **Hourly activity patterns**

### ⚙️ Script Generator
- **Dynamic script generation**
- **Advanced JavaScript obfuscation**
- **Customizable protection settings**
- **Easy integration with any website**

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Email Service**: Resend
- **Obfuscation**: JavaScript Obfuscator
- **Payments**: Stripe (integrated)

## 📧 Email Configuration

### Setting up Resend for Email Delivery

1. **Create a Resend account** at [resend.com](https://resend.com)

2. **Get your API key** from the Resend dashboard

3. **Add environment variable** in Supabase:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   ```

4. **Configure email templates** in the Resend function:
   - Password reset emails
   - Email confirmation emails
   - Custom branded templates

### Testing Email Functionality

1. **Password Reset Test**:
   - Go to login page
   - Click "Forgot your password?"
   - Enter your email address
   - Check your inbox for the reset email

2. **Registration Test**:
   - Create a new account
   - Check your inbox for the confirmation email
   - Click the confirmation link

## 🔧 Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy .env.example to .env and fill in your values
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Tables
- **users**: User profiles and settings
- **protected_domains**: Domains under protection
- **script_analytics**: Script usage analytics
- **clone_detections**: Detected cloning attempts
- **stripe_customers**: Stripe customer data
- **stripe_subscriptions**: Subscription management
- **stripe_orders**: Order history

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **User-specific data access** policies
- **Secure API endpoints** with authentication

## 🚀 Deployment

The application is designed to work seamlessly with:
- **Supabase** for backend services
- **Netlify** for frontend hosting
- **Resend** for email delivery
- **Stripe** for payment processing

## 📝 Usage Guide

### 1. User Registration
- Users sign up with email and password
- Automatic profile creation in the database
- Email confirmation (optional)

### 2. Domain Protection
- Add domains to protect
- Generate obfuscated protection scripts
- Configure protection settings
- Deploy scripts to websites

### 3. Monitoring & Analytics
- View real-time clone detection
- Analyze visitor behavior
- Export detailed reports
- Set up automated responses

### 4. Script Integration
- Copy the generated obfuscated script
- Paste it into your website's HTML
- The script automatically protects against cloning
- Monitor activity through the dashboard

## 🔒 Security Features

- **Advanced script obfuscation** to prevent reverse engineering
- **Domain validation** to ensure scripts only run on authorized sites
- **Real-time threat detection** and response
- **Secure API endpoints** with proper authentication
- **Data encryption** and secure storage

## 📊 Analytics Features

- **Clone detection tracking**
- **Visitor behavior analysis**
- **Geographic distribution**
- **Device and browser statistics**
- **Time-based activity patterns**
- **Export capabilities** for reports

## 🎯 Anti-Cloning Actions

1. **Traffic Redirection**: Automatically redirect clone visitors to the original site
2. **Visual Sabotage**: Apply visual effects that break the clone's layout
3. **Link Replacement**: Replace checkout and important links with correct ones
4. **Image Replacement**: Replace all images with warning messages
5. **Visual Interference**: Apply effects that make the clone difficult to use

## 📞 Support

For technical support or questions about the platform, please contact our support team through the application's support channels.

---

**CloneGuard** - Advanced Anti-Cloning Protection for Modern Websites
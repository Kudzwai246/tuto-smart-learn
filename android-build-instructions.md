
# Tuto Smart Learn - Android APK Build Instructions

## Prerequisites
Before you start building the APK, make sure you have:
- Node.js installed (version 16 or higher)
- Android Studio installed
- Java Development Kit (JDK) 11 or higher
- Git installed
- A GitHub account

## Step 1: Export Project to GitHub

1. In your Lovable project, click the **GitHub** button in the top right corner
2. Click **"Connect to GitHub"** if not already connected
3. Click **"Create Repository"** 
4. Name your repository (e.g., "tuto-smart-learn")
5. Wait for the export to complete

## Step 2: Clone Repository Locally

1. Open Terminal/Command Prompt
2. Navigate to where you want to store the project:
   ```bash
   cd /path/to/your/projects
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tuto-smart-learn.git
   cd tuto-smart-learn
   ```

## Step 3: Install Dependencies

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install Capacitor CLI globally:
   ```bash
   npm install -g @capacitor/cli
   ```

## Step 4: Add Android Platform

1. Add Android platform to your project:
   ```bash
   npx cap add android
   ```

2. If you get an error, first build the web assets:
   ```bash
   npm run build
   npx cap add android
   ```

## Step 5: Configure Android Studio

1. Open Android Studio
2. Open the `android` folder from your project directory
3. Let Android Studio sync and download dependencies (this may take several minutes)
4. Accept any SDK license agreements when prompted

## Step 6: Configure App Details

1. Open `android/app/src/main/res/values/strings.xml`
2. Update app name if needed:
   ```xml
   <string name="app_name">Tuto Smart Learn</string>
   ```

3. Open `android/app/src/main/AndroidManifest.xml`
4. Verify permissions are set correctly (they should be auto-generated)

## Step 7: Build APK

### Method 1: Using Android Studio (Recommended for beginners)
1. In Android Studio, click **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. Click **"locate"** link in the notification to find your APK
4. The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Method 2: Using Command Line
1. Navigate to the android directory:
   ```bash
   cd android
   ```
2. Build the APK:
   ```bash
   ./gradlew assembleDebug
   ```
3. Find APK at: `app/build/outputs/apk/debug/app-debug.apk`

## Step 8: Install APK on Your Phone

### Option A: Direct Installation
1. Connect your phone to computer via USB
2. Enable Developer Options on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
3. Enable USB Debugging:
   - Go to Settings → Developer Options
   - Turn on USB Debugging
4. Install using ADB:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Option B: Transfer APK File
1. Copy the APK file to your phone
2. On your phone, go to Settings → Security
3. Enable "Install from Unknown Sources" or "Allow from this source"
4. Use a file manager to find and tap the APK file
5. Follow installation prompts

## Step 9: Create Admin Account

1. Install and open the app on your phone
2. Sign up with your email: `appstuto77@gmail.com`
3. Complete the registration process
4. In your Supabase dashboard, go to SQL Editor
5. Run this command to make yourself admin:
   ```sql
   SELECT public.make_admin('appstuto77@gmail.com');
   ```
6. Restart the app and sign in again - you'll now have admin access

## Step 10: Testing Checklist

### ✅ Authentication System
- [ ] Sign up new accounts (student/teacher)
- [ ] Sign in with existing accounts
- [ ] Sign out functionality
- [ ] Admin dashboard access

### ✅ Student Features
- [ ] Complete student registration with guardian info
- [ ] View available teachers
- [ ] Browse different grade levels
- [ ] View payment methods (APIs not connected yet)

### ✅ Teacher Features
- [ ] Submit teacher application
- [ ] View pending approval status
- [ ] Add qualifications and subjects

### ✅ Admin Features (Your Account Only)
- [ ] View all students and teachers
- [ ] Approve/reject teacher applications
- [ ] View subscription data
- [ ] Monitor system stats

## Step 11: Building Release APK (For Production)

When ready for production:

1. Generate a signed APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. You'll need to create a keystore first:
   ```bash
   keytool -genkey -v -keystore tuto-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias tuto-key
   ```

3. Configure signing in `android/app/build.gradle`

## Troubleshooting

### Common Issues:

1. **"JAVA_HOME not set"**
   - Install JDK 11+ and set JAVA_HOME environment variable

2. **"SDK not found"**
   - Open Android Studio and install Android SDK through SDK Manager

3. **"Build failed"** 
   - Run `npm run build` first, then `npx cap sync android`

4. **"App won't install"**
   - Check if you have enough storage space
   - Enable "Install from Unknown Sources"
   - Try uninstalling any previous version first

### Getting Help:
- Check the browser console for any errors when testing features
- Verify your Supabase connection is working
- Ensure all database migrations have been applied

## Features Ready for Testing

✅ **Working Features:**
- Complete authentication system
- Student registration with guardian info
- Teacher application process  
- Admin dashboard with approval system
- Specific grade level selection
- Payment method display (USD only)
- Email notification system (ready for API integration)

⏳ **Payment APIs:** 
- Placeholders ready for EcoCash, CABS, and Zimbabwe banks
- Easy to integrate when payment providers are selected

📧 **Email System:**
- Progress report templates ready
- Notification system in place
- Emails from "Tuto Team & Kudzwai Madyavanhu, CEO & Co-Founder"

Your Tuto Smart Learn APK is now ready for installation and testing!

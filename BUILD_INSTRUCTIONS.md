# TutoSmart Learn - Android Build Instructions

## Complete Build Guide for TutoSmart Learn Mobile App

### Project Overview
- **App Name**: TutoSmart Learn
- **Package ID**: com.tutosmart.learn  
- **Target Platform**: Android
- **Framework**: React + Capacitor
- **Build System**: Gradle 8.2.1

## Prerequisites

### Required Software
1. **Node.js** (v20.x or later)
2. **Android Studio** (Latest stable version)
3. **Java JDK 17** (Required for Android builds)
4. **Git** (for repository management)

### Android SDK Requirements
- **Target SDK**: 34
- **Minimum SDK**: 22  
- **Compile SDK**: 34
- **Build Tools**: 34.0.0 or later

### Required Android SDK Components
```bash
# Install via Android Studio SDK Manager:
- Android SDK Platform 34
- Android SDK Build-Tools 34.0.0
- Android Emulator
- Android SDK Platform-Tools
- Android SDK Tools
```

## Option 1: GitHub Actions Build (Recommended)

### Automatic APK Building via CI/CD

1. **Fork/Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd tutosmart-learn
   ```

2. **GitHub Actions Workflow**
   The repository includes `.github/workflows/android-capacitor-build.yml` which automatically:
   - Sets up Node.js 20
   - Installs dependencies
   - Builds web assets
   - Configures Android environment with JDK 17
   - Syncs Capacitor
   - Builds both Debug and Release APKs
   - Uploads artifacts for download

3. **Trigger Build**
   - Push to `main` branch, or
   - Manually trigger via GitHub Actions tab

4. **Download APKs**
   - Go to Actions tab in your GitHub repository
   - Select latest workflow run
   - Download `tutosmart-apks` artifact

### APK Locations after Build
```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## Option 2: Local Android Studio Build

### Environment Setup

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Include Android SDK and emulator during installation

2. **Configure Environment Variables**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export JAVA_HOME=/path/to/java17
   ```

3. **Verify Installation**
   ```bash
   java -version  # Should show Java 17
   android --version
   adb version
   ```

### Build Process

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd tutosmart-learn
   npm install
   ```

2. **Build Web Assets**
   ```bash
   npm run build
   ```

3. **Capacitor Setup**
   ```bash
   # Add Android platform if not present
   npx cap add android
   
   # Sync web assets to native
   npx cap sync android
   ```

4. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

5. **Build in Android Studio**
   - File → Open → Select `android` folder
   - Wait for Gradle sync to complete
   - Build → Make Project (Ctrl+F9)
   - Build → Build Bundle(s)/APK(s) → Build APK(s)

### Alternative Command Line Build
```bash
cd android
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK
```

## Project Structure

### Key Configuration Files
```
├── android/
│   ├── app/
│   │   ├── build.gradle           # App-level Gradle config
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── java/com/tutosmart/learn/MainActivity.java
│   │   └── proguard-rules.pro
│   ├── build.gradle               # Project-level Gradle
│   ├── gradle.properties
│   ├── settings.gradle
│   ├── variables.gradle           # Shared variables
│   └── gradlew                    # Gradle wrapper (executable)
├── capacitor.config.ts            # Capacitor configuration
├── package.json                   # Node.js dependencies
└── .github/workflows/
    └── android-capacitor-build.yml # CI/CD workflow
```

### Important Gradle Configuration

**android/app/build.gradle**:
```gradle
android {
    namespace 'com.tutosmart.learn'
    compileSdk 34
    
    defaultConfig {
        applicationId "com.tutosmart.learn"
        minSdk 22
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

## Features & Functionality

### Core Features
- **Dual Admin System**: 
  - luckilyimat@gmail.com (CEO - Kudzwai Madyavanhu)
  - chiwandiretakunda75@gmail.com (COO - Takunda Chiwandire)
- **Profile Management**: Avatar upload, personal info management
- **Teacher Qualifications**: Detailed academic background and specializations
- **Rating System**: Multi-dimensional teacher ratings (teaching quality, communication, etc.)
- **Location-based Matching**: Find teachers by proximity and subjects
- **Payment Integration**: Ready for Stripe/PayPal integration

### Database Features
- **Supabase Backend**: Real-time database, authentication, file storage
- **Row Level Security**: Comprehensive data protection policies
- **File Storage**: Profile pictures and teacher documents
- **Advanced Ratings**: 5-category teacher evaluation system

## Troubleshooting

### Common Issues

1. **Gradle Build Failures**
   ```bash
   # Clean and rebuild
   cd android
   ./gradlew clean
   ./gradlew build --stacktrace
   ```

2. **Capacitor Sync Issues**
   ```bash
   npx cap clean android
   npx cap sync android
   ```

3. **JDK Version Issues**
   - Ensure JDK 17 is installed and JAVA_HOME is set correctly
   - Android Studio uses embedded JDK by default

4. **SDK License Issues**
   ```bash
   cd $ANDROID_HOME/tools/bin
   ./sdkmanager --licenses
   # Accept all licenses
   ```

5. **Build Memory Issues**
   Add to `android/gradle.properties`:
   ```properties
   org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m
   org.gradle.parallel=true
   org.gradle.configureondemand=true
   ```

### Build Verification

After successful build, verify APK:
```bash
# Check APK details
aapt dump badging android/app/build/outputs/apk/debug/app-debug.apk

# Install on device/emulator
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Release Build & Signing

### For Production Release

1. **Generate Signing Key**
   ```bash
   keytool -genkey -v -keystore tutosmart-release-key.keystore -alias tutosmart -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing in gradle**
   Add to `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               keyAlias 'tutosmart'
               keyPassword 'your-key-password'
               storeFile file('tutosmart-release-key.keystore')
               storePassword 'your-store-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## Version Information

- **Gradle**: 8.2.1
- **Android Gradle Plugin**: 8.2.1
- **Capacitor**: 7.4.1
- **Target Android Version**: 14 (API 34)
- **Minimum Android Version**: 5.1 (API 22)

## Support & Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer Docs**: https://developer.android.com
- **GitHub Repository**: [Your repo URL]
- **Issues**: Report via GitHub Issues

---

**Built with ❤️ by the TutoSmart Team**
- Kudzwai Madyavanhu (CEO & Co-Founder)
- Takunda Chiwandire (COO & Co-Founder)
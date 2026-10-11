# Native Volume Button SOS Integration Guide

This document specifies the technical architecture, platform prerequisites, and reference implementation for **Volume Button Emergency SOS** (holding a hardware volume button continuously for 3 seconds to trigger an emergency SOS alert).

---

## 1. Platform Support & Web Browser Limitations

### Web Browsers & PWAs (Current Platform)
* **Status**: **UNAVAILABLE / RESTRICTED BY BROWSER ENGINE**
* **Technical Reason**: Modern mobile browsers (Chrome for Android, Safari on iOS, Firefox Mobile) intentionally do **not** expose hardware volume key events (`KEYCODE_VOLUME_UP`, `KEYCODE_VOLUME_DOWN`) to web applications or PWAs.
* **Security & Sandboxing**: Operating system volume buttons are reserved exclusively by the OS audio server. Web browsers cannot intercept key-down or key-up events on physical volume rocker keys, nor can they measure a 3-second physical hold.
* **Integrity Guarantee**: Women Safety Shield does **not** use misleading browser hacks (such as pretending standard keyboard key events or scroll events represent physical volume buttons).

---

## 2. Native Android Integration Architecture

To implement hardware volume button SOS, a native Android companion application or React Native / Capacitor native plugin is required.

### Architecture Overview

```
[ User Holds Volume Down ]
           │
           ▼
[ Android AccessibilityService / MediaSession ]
           │
           ▼
[ KeyEvent.ACTION_DOWN ] ─── (Start 3000ms Timer & Haptic Pulse)
           │
           ├─ If Released Before 3000ms ──> [ KeyEvent.ACTION_UP ] ──> Cancel Timer
           │
           ▼ (Held for >= 3000ms)
[ Dispatch SOS Trigger ]
           │
           ▼
[ POST /api/v1/emergencies ] (incidentType: "volume_button")
```

---

## 3. Reference Android Native Implementation (Kotlin)

### A. Android Manifest Permissions (`AndroidManifest.xml`)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.womensafetyshield.companion">

    <!-- Foreground service for continuous listening when armed -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application>
        <!-- Accessibility Service to intercept hardware volume keys across apps -->
        <service
            android:name=".services.VolumeButtonSosService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="false">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>
    </application>
</manifest>
```

### B. Accessibility Service Config (`res/xml/accessibility_service_config.xml`)

```xml
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagRequestFilterKeyEvents"
    android:canRequestFilterKeyEvents="true"
    android:description="@string/accessibility_service_description"
    android:notificationTimeout="100" />
```

### C. Kotlin Service (`VolumeButtonSosService.kt`)

```kotlin
package com.womensafetyshield.companion.services

import android.accessibilityservice.AccessibilityService
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class VolumeButtonSosService : AccessibilityService() {

    companion object {
        private const val HOLD_DURATION_MS = 3000L
        private const val SOS_API_URL = "https://your-api-domain.com/api/v1/emergencies"
    }

    private val handler = Handler(Looper.getMainLooper())
    private var isHoldingVolumeDown = false
    private var triggerPending = false
    private var lastTriggerTimestamp = 0L

    private val sosRunnable = Runnable {
        triggerPending = false
        triggerEmergencySos()
    }

    override fun onKeyEvent(event: KeyEvent): Boolean {
        val keyCode = event.keyCode

        // We listen for Volume Down long press
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            when (event.action) {
                KeyEvent.ACTION_DOWN -> {
                    // Filter out OS auto-repeat events
                    if (event.repeatCount == 0 && !isHoldingVolumeDown) {
                        isHoldingVolumeDown = true
                        triggerPending = true

                        // Initial haptic feedback notifying user that countdown started
                        provideHapticFeedback(50)

                        // Start 3-second hold timer
                        handler.postDelayed(sosRunnable, HOLD_DURATION_MS)
                    }
                    return false // Allow normal volume adjustment unless deliberate SOS
                }

                KeyEvent.ACTION_UP -> {
                    if (isHoldingVolumeDown) {
                        isHoldingVolumeDown = false
                        if (triggerPending) {
                            // User released before 3 seconds: cancel trigger safely
                            handler.removeCallbacks(sosRunnable)
                            triggerPending = false
                        }
                    }
                    return false
                }
            }
        }

        return super.onKeyEvent(event)
    }

    private fun triggerEmergencySos() {
        val now = System.currentTimeMillis()
        if (now - lastTriggerTimestamp < 10000L) return // 10s cooldown
        lastTriggerTimestamp = now

        // Strong vibration indicating activation
        provideHapticFeedback(500)

        // Dispatch to backend API
        val client = OkHttpClient()
        val json = JSONObject().apply {
            put("incidentType", "volume_button")
        }
        val body = json.toString().toRequestBody("application/json; charset=utf-8".toMediaType())
        val request = Request.Builder()
            .url(SOS_API_URL)
            .header("Authorization", "Bearer YOUR_STORED_AUTH_TOKEN")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                // Fallback: initiate direct phone call to 112 if network fails
            }
            override fun onResponse(call: Call, response: Response) {
                response.close()
            }
        })
    }

    private fun provideHapticFeedback(milliseconds: Long) {
        val vibrator = getSystemService(Vibrator::class.java)
        vibrator?.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {
        handler.removeCallbacks(sosRunnable)
    }
}
```

---

## 4. Platform Restrictions & Compliance

1. **Android 14+ (API 34) Foreground Restrictions**:
   * Foreground services must declare a specific `foregroundServiceType` in the manifest.
   * Background activity starts from a service require `SYSTEM_ALERT_WINDOW` permission or notification-based launches.

2. **Google Play Store Policy on Accessibility Services**:
   * Google Play requires an in-app prominent disclosure explaining why the AccessibilityService is used (safety emergency trigger).

3. **Apple iOS Limitations**:
   * iOS does **not** permit third-party applications to intercept physical volume buttons globally while suspended or in the background. Universal 3-second volume holds cannot be intercepted on iOS without private APIs.

---

## 5. Web Application Integration

In the Women Safety Shield web application:
* The web app maintains the `/api/v1/emergencies` endpoint with `incidentType: "volume_button"` support.
* In Settings, the UI clearly displays:
  - **Status**: "Native Companion Required"
  - **Info Modal**: Full explanation of browser sandboxing vs. native Android implementation.

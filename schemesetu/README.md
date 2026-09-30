# SanghaSetu - Offline-First Financial Management Platform

A comprehensive offline-first platform designed for managing Chit Funds, DWAKRA Groups, Women's Self Help Groups (SHGs), and Community Savings Groups.

## 📖 About the App

SanghaSetu is a robust, entirely local mobile application that allows community leaders and group organizers to manage members, record payments, distribute loans, conduct auctions, and send automated reminders without requiring an internet connection or backend server.

## ✨ Features

| Feature Category | Capabilities |
| --- | --- |
| **Complete Offline Use** | Entire database (Drift SQLite) and business logic run locally on the device. No servers, no mandatory APIs. |
| **Chit Funds (Module 1)** | Manage Chit groups, auctions, installments, collections, and winners. |
| **DWAKRA / SHG (Module 2)** | Dedicated workflow for Women's Groups, tracking savings, loans, interest calculations, meeting attendance, and cash books. |
| **Authentication & Security** | Setup & verify custom Security PIN, biometric app lock. All data stays on the device. |
| **Contact Integration** | Directly import members from your phone's native Contacts App. |
| **UPI App Deep Linking** | Validate transactions instantly by launching UPI apps directly. |
| **Communications & Notifications** | 1-Click WhatsApp reminders, local notifications for dues, meetings, and birthdays. |
| **Offline Backup & Export** | Encrypted ZIP backups, PDF exports, Excel/CSV generation locally. Optional cloud sync (Google Drive). |
| **Localization** | Multi-lingual support. |

## 🛡️ Privacy & Security First

Because the application requires no backend server:
- **No Data Mining:** Your financial data stays on your device.
- **PIN Setup & Enforcement:** Active locking with 4-digit PIN and Biometric Fallback.
- **Local encrypted storage.**

## 🛠️ Tech Stack

| Domain | Technologies Used |
| --- | --- |
| **Mobile App (Frontend)** | Flutter & Dart (>= 3.0.0) |
| **State Management** | `provider`, `riverpod` |
| **Local Database** | Drift (SQLite) |
| **Security & Storage** | `flutter_secure_storage`, `local_auth` |

## 📂 Project Structure

```text
SanghaSetu/
├── lib/                     # Flutter Mobile App Source Code
│   ├── core/                # Core utilities
│   ├── data/local/          # Drift Database and DAOs
│   ├── models/              # Data models
│   ├── providers/           # State Management
│   ├── screens/             # UI Screens (Dashboard, Chit, SHG)
│   ├── services/            # Local Storage and Offline services
│   └── widgets/             # Reusable UI components
├── test/                    # Flutter Widget and Unit Tests
└── README.md                # General ecosystem guide
```

## 📱 Build & Run

**Prerequisites:** 
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed.

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd SangaSetu
   ```

2. **Install Dependencies:**
   ```bash
   flutter pub get
   ```

3. **Generate Drift Code (if modifying schema):**
   ```bash
   dart run build_runner build --delete-conflicting-outputs
   ```

4. **Build the APK:**
   ```bash
   flutter build apk --release
   ```

5. **Run directly on connected device:**
   ```bash
   flutter run
   ```

# Dehub Logistics Services

Customer shipment tracking and administration platform for Dehub Logistics Services.

## Features

- Responsive public logistics website
- Tracking-number lookup and shipment timeline
- Firebase email/password administrator authentication
- Shipment creation dashboard
- Firestore security rules separating public and private data
- Firebase Hosting configuration

## Local setup

1. Copy `.env.example` to `.env` and insert the Firebase Web app configuration.
2. Run `npm install`.
3. Run `npm run dev`.

Without Firebase environment values, the interface opens in preview mode. Use tracking number `DEH-2026-000001` and any login details to review the flows.

## Firebase setup

Enable Email/Password Authentication, create a Firestore database, and deploy `firestore.rules`. Create the first administrator in Firebase Authentication, then create `admins/{uid}` in Firestore using that Authentication user's UID as the document ID.

Do not commit `.env` or Firebase service-account credentials.

# Firebase Console Configuration Steps
## Current State (from screenshot)
- Firestore is already enabled ✅
- `users` collection exists with documents ✅
- Database location: asia-south1 (Mumbai) ✅
- Auth is working (users are signing in) ✅
## Changes Needed in Firebase Console
### 1. Deploy Firestore Security Rules
**Path:** Firebase Console → Firestore Database → Rules tab
Copy-paste the contents of `firestore.rules` from the repo and click **Publish**.
This rules file:
- Lets users read/write only their own `users/{uid}`, `payments`, `bookings` docs
- Lets admins read/write everything
- Lets anyone read published workshops, services, courses, testimonials, coupons
### 2. Make Yourself an Admin
**Path:** Firebase Console → Firestore Database → Data tab → `users` collection → click YOUR document
Add or update the `role` field to `"admin"`:
```
role: "admin"  (string)
```
Without this, admin pages will fail silently because the security rules block admin-only writes.
### 3. (Optional but Recommended) Create Composite Indexes
**Path:** Firebase Console → Firestore Database → Indexes tab
The app uses queries with `where + orderBy` combinations that need indexes. Create these:
| Collection | Fields | Query Scope |
|-----------|--------|-------------|
| `payments` | `userId` (Ascending), `createdAt` (Descending) | Collection |
| `bookings` | `userId` (Ascending), `createdAt` (Descending) | Collection |
| `bookings` | `status` (Ascending), `createdAt` (Descending) | Collection |
| `workshops` | `format` (Ascending) | Collection |
| `services` | `isVisible` (Ascending) | Collection |
| `courses` | `isPublished` (Ascending) | Collection |
| `testimonials` | `isApproved` (Ascending), `isFeatured` (Ascending) | Collection |
| `coupons` | `isActive` (Ascending) | Collection |
Firestore will auto-suggest these when queries fail, but pre-creating them avoids runtime errors.
### 4. Verify Environment Variables
Make sure `.env.local` contains these Firebase config values (they should already be there since Auth works):
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
No new env vars are needed for Firestore — it uses the same `projectId`.
### 5. Seed the Database
After deploying rules and setting your admin role:
1. Run the app locally: `npm run dev`
2. Sign in with Google (so your user doc exists in Firestore)
3. Go to `/admin/seed`
4. Click **"Seed Firestore Database"**
5. Check Firebase Console → Firestore → Data to verify collections were created
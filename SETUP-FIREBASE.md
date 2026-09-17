# Setting up the free database (Firebase) — one-time, ~10 minutes

Your website works out of the box with a starter catalogue built in. To be able to
**add, edit and delete products yourself** from the admin panel — with changes
appearing live on your site for every visitor — you need to connect one free
Firebase project. Firebase is Google's app backend service; the free "Spark" plan
covers a small shop's traffic with plenty of room to spare, at ₹0/month.

## 1. Create your Firebase project
1. Go to https://console.firebase.google.com and sign in with any Google account.
2. Click **Add project** → name it e.g. `dlampe-kalimpong` → continue through the
   prompts (you can disable Google Analytics, it's not needed) → **Create project**.

## 2. Create the database (Firestore)
1. In your new project's left sidebar, click **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** → pick any nearby location (e.g. `asia-south1 (Mumbai)`) → **Enable**.
4. Go to the **Rules** tab and replace the contents with this, then click **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

   This means: anyone can *view* products (needed for your public website), but
   only a signed-in admin (you) can *add, edit or delete* them.

## 3. Turn on the admin login (Authentication)
1. In the left sidebar, click **Build → Authentication** → **Get started**.
2. Under "Sign-in providers," click **Email/Password** → toggle it **Enabled** → **Save**.
3. Go to the **Users** tab → **Add user** → enter the email and password you (the
   shop owner) want to use to log into the admin panel → **Add user**.
   You can add more than one admin user later the same way.

## 4. Get your config keys
1. Click the ⚙️ gear icon next to "Project Overview" → **Project settings**.
2. Scroll to **Your apps** → click the **</>** (Web) icon to register a new web app.
3. Give it any nickname (e.g. "D-LAMPE Website") → **Register app**.
4. You'll see a code block with a `firebaseConfig` object like this:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "dlampe-kalimpong.firebaseapp.com",
     projectId: "dlampe-kalimpong",
     storageBucket: "dlampe-kalimpong.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

5. Open **firebase-config.js** in your website files and paste in your own values,
   replacing the `REPLACE_ME` placeholders. Save the file.

## 5. Re-deploy
Upload your updated files (the whole folder, including the edited
`firebase-config.js`) to Netlify again — see HOW-TO-DEPLOY.md. Drag-and-drop
takes 10 seconds.

## 6. Load your starter products
1. Open your live site at `/admin.html` (e.g. `https://your-site.netlify.app/admin.html`).
2. Log in with the email/password you created in step 3.
3. Click **Load Starter Catalogue** to instantly populate your database with the
   original 38 D-LAMPE products — or skip this and add your own from scratch with
   **+ Add Product**.

From here on, anything you add, edit, or delete in the admin panel appears on your
public website immediately — no re-deploying needed.

## Staying within the free plan
Firebase's free Spark plan includes (per day): 50,000 document reads, 20,000
writes, and 1 GB of stored data. A small shop catalogue with normal visitor
traffic uses a tiny fraction of this — you won't be charged anything unless you
explicitly upgrade to a paid plan.

## Keeping your admin panel private
- `admin.html` isn't linked from your public site, but its address isn't secret
  either — anyone with the link would still need your email + password to log in
  and change anything, since that's enforced by the Firestore rule above.
- Don't share your admin email/password. Add a separate Firebase user (step 3)
  for any staff member instead of sharing one login.

# Safe Haven NCFE Operations Hub — v3 (Supabase Backend)

A web application for managing NCFE Centre Approval compliance. Built on a real PostgreSQL database with authentication, file storage, and an audit log.

---

## What's new in v3

- **Real authentication** — sign in with email/password
- **Forgotten password** — reset via email link
- **Change password** while signed in (Account page)
- **PostgreSQL database** — every record persisted to Supabase (no more localStorage)
- **File uploads** — drag-and-drop files attached to learners, staff, EQA criteria, policies, and a general documents library
- **Audit log** — every create/update/delete/upload/download is logged with timestamp, user, and action
- **All Excel content** — 24 EQA criteria, 16 required policies, 7 centre contacts pre-loaded

---

## ⚠️ Before you start: GDPR responsibilities you now own

This system will hold personal data (learner names, dates of birth, ID scans, staff DBS certificates). Once you put real data in, **Safe Haven becomes the data controller** under UK GDPR. That means:

1. **Sign the Data Processing Agreement (DPA) with Supabase** — free, but you must accept it. Go to your Supabase project → Settings → Legal → Sign DPA.
2. **Update your Privacy Notice** — tell learners and staff their data is processed via this system (hosted by Supabase, EU region).
3. **Update your ICO registration** — confirm it covers cloud-hosted personal data systems.
4. **Use a strong unique password** — managed in a password manager. This is not a place to reuse passwords.
5. **Don't share login credentials** — if other staff need access, create them as separate users (Supabase → Authentication → Users → Add user).
6. **Breach response** — if Supabase notifies you of a breach, you have 72 hours to notify the ICO. Have this in your incident response plan.
7. **Retention** — NCFE requires achievement records held for at least 3 years. Decide your retention policy and document it.

If any of this feels uncertain, the safer alternative is an established platform (OneFile, Microsoft 365/SharePoint with proper governance). This custom build gives you full control but the compliance weight is on you.

---

## Setup — Step by Step

### Part 1: Supabase (the backend)

**1. Create a free Supabase account**
- Go to https://supabase.com and sign up
- Verify your email

**2. Create a new project**
- Click **New project**
- Name: `safe-haven-ncfe-hub` (or anything you like)
- Database password: **generate a strong one and store it in your password manager** — you'll need it for emergency database access
- **Region: choose `West EU (London)` or `Central EU (Frankfurt)`** — keeps data in the UK/EU jurisdiction for GDPR
- Pricing plan: Free is fine to start
- Click **Create new project** and wait ~2 minutes for it to provision

**3. Run the database schema**
- In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
- Click **New query**
- Open the file `supabase/01-schema.sql` from this package, copy its entire contents, paste into the SQL Editor
- Click **Run** (bottom right)
- You should see "Success. No rows returned." — this means all tables were created.

**4. Seed the EQA criteria**
- Still in SQL Editor, click **New query**
- Open `supabase/02-seed-eqa-criteria.sql`, copy/paste contents
- Click **Run**
- This populates all 24 EQA criteria with their full titles, summaries, evidence items, and the formal Not Applicable evidence statements for criteria 3.2 and 3.20–3.24.

**5. Configure authentication**
- Go to **Authentication → Providers** (left sidebar)
- Make sure **Email** is enabled (it is by default)
- For first-time setup, scroll down and **turn OFF "Confirm email"** temporarily — this lets you sign in immediately without clicking a verification link. You can turn it back on later if you add more users.
- Click **Save**

**6. Create your first user (you)**
- Go to **Authentication → Users**
- Click **Add user → Create new user**
- Email: your real email address
- Password: a strong unique password (10+ chars, mix of types). Save in a password manager.
- Tick **Auto Confirm User**
- Click **Create user**

**7. Get your API credentials**
- Go to **Settings → API** (left sidebar)
- You need two values:
  - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
  - **anon public key** (a long string starting with `eyJ...`)
- Keep this page open — you'll need these in Part 3.

---

### Part 2: Get the code on GitHub

If you've been using the existing repo `justlakeside/safe-haven-ncfe-hub`:

**Option A — Replace the contents (recommended for clean upgrade)**
1. Unzip this package locally.
2. Go to your repo on github.com.
3. Delete all old files (you can do this via the GitHub web UI: click each file → trash icon → commit).
4. Upload the new files via **Add file → Upload files**.
5. Drag in the contents of the unzipped folder. **Important: drag in the files and folders inside the zip, not the outer folder itself.** Then commit.

**Option B — Create a fresh repo**
1. On github.com, create a new repo (e.g. `ncfe-hub-v3`).
2. Upload all the unzipped files. Commit.
3. In Part 4 below, point Vercel at this new repo.

---

### Part 3: Add environment variables to Vercel

Vercel needs to know your Supabase credentials, but they must **never** go in the code itself.

1. In your Vercel project (the one connected to your GitHub repo), go to **Settings → Environment Variables**
2. Add two variables:

| Name | Value | Environments |
|---|---|---|
| `VITE_SUPABASE_URL` | (paste the Project URL from Supabase Settings → API) | Production, Preview, Development (tick all) |
| `VITE_SUPABASE_ANON_KEY` | (paste the anon public key) | Production, Preview, Development (tick all) |

3. Click **Save** after adding each one.

---

### Part 4: Configure password reset emails

If you forget your password and click "Forgotten password?" the system sends an email with a reset link. You need to tell Supabase what URL to send people to.

1. In Supabase, go to **Authentication → URL Configuration**
2. **Site URL** — set this to your Vercel URL (e.g. `https://project-b3vy4.vercel.app`). No trailing slash.
3. **Redirect URLs** — click **Add URL** and add both of these (separately):
   - `https://your-vercel-url.vercel.app/`
   - `https://your-vercel-url.vercel.app/?reset=1`
4. Click **Save**

---

### Part 5: Trigger a Vercel redeploy

Vercel needs to rebuild the app now that the environment variables exist.

1. Go to your Vercel project → **Deployments** tab
2. On the most recent deployment, click the **...** menu → **Redeploy**
3. Confirm. Wait 1–2 minutes.

---

### Part 6: Sign in

1. Open your Vercel URL
2. You should see the Safe Haven sign-in screen
3. Enter the email + password you created in Supabase
4. You're in.

---

## Using the app

### Sidebar navigation
- **Overview** — readiness % and outstanding criteria
- **Centre Details** — official centre info + 7 key contacts (pre-loaded)
- **EQA Criteria** — all 24 criteria. Click any to expand. Mark evidence as Met/Pending/Not Met. Attach files. The 6 N/A criteria already have their formal evidence statements pre-written.
- **Policies** — 16 required policies from criterion 3.1 are pre-loaded. Open each to record version, owner, review dates, and upload the document.
- **Learners** — track learner records, ID verification, progress. Upload ID scans, enrolment forms, assessment evidence per learner.
- **Staff** — competency, DBS, CPD records. Conflict-of-interest detection flags anyone who is both tutor/assessor and IQA.
- **Exam Sessions** — JCQ-compliant session logs with attendance registers.
- **IQA Sampling** — sampling decisions, feedback, and action tracking. Warns if assessor and IQA are the same person.
- **Documents** — general repository for anything not tied to a specific learner/staff/criterion.
- **Account** — change your password while signed in.

### Forgotten password flow
1. Click **Forgotten password?** on the sign-in screen
2. Enter your email → click Send Reset Link
3. Check your email (and spam folder) for a message from Supabase
4. Click the link → you'll be taken to a screen to set a new password

### Change password while signed in
1. Click **Account** in the sidebar
2. Enter current password + new password (twice)
3. Click Update Password

---

## File upload rules

- Max 25 MB per file
- Allowed types: PDF, Word, Excel, PowerPoint, JPG, PNG, WebP, HEIC, TXT, CSV (other types will prompt for confirmation)
- Files are stored in Supabase Storage (private bucket — only accessible to signed-in users)
- Downloads use signed URLs that expire after 60 seconds, so links can't be shared externally
- Deleting a learner/staff record also deletes all their uploaded files

---

## Adding more users later

When you're ready to add staff:

1. Supabase → **Authentication → Users → Add user**
2. Set their email + temporary password
3. Tick "Auto Confirm User"
4. Tell them to sign in and immediately change their password via the Account page

All users currently see everything. If you later need role-based access (e.g. tutors only see their own learners), the database schema already has a `role` field on the `profiles` table to support this — let me know when you're ready and we can add the row-level security policies for it.

---

## Local development (optional)

Only needed if you want to test changes on your own computer before deploying.

```
npm install
cp .env.example .env.local
# Edit .env.local and add your Supabase URL + anon key
npm run dev
```

Open http://localhost:5173

---

## Troubleshooting

**"Missing Supabase environment variables" warning in browser console**
→ Vercel env vars aren't set, or you didn't redeploy after adding them. Go to Vercel → Settings → Environment Variables, confirm both are present, then redeploy.

**Sign-in shows "Invalid login credentials"**
→ Either the email/password is wrong, or the user was created with email confirmation required but never confirmed. Go to Supabase → Authentication → Users → click the user → confirm them manually.

**"Forgotten password" email never arrives**
→ Check spam folder. If still nothing, Supabase free tier uses their own SMTP which can be flaky. For production reliability, configure your own SMTP under Authentication → Email Templates → SMTP Settings.

**Upload fails with "row-level security" error**
→ Likely means the storage bucket policies didn't apply. Re-run the storage policy section at the bottom of `01-schema.sql` in SQL Editor.

**Files upload but vanish from the list**
→ Make sure the bucket is named exactly `documents` (lowercase). The schema creates it but if you renamed it, the app code expects `documents`.

---

## What's in the database

| Table | Holds |
|---|---|
| `profiles` | Extension of auth.users with role + display name |
| `centre_details` | Single-row centre information |
| `centre_contacts` | 7 key role-holders |
| `eqa_criteria` | All 24 EQA criteria with status |
| `eqa_evidence` | Evidence items per criterion |
| `policies` | The 16 required policies |
| `learners` | Learner records |
| `staff` | Staff competency + DBS records |
| `exam_sessions` + `exam_register_entries` | Exam sessions + attendance |
| `iqa_samples` | IQA sampling decisions |
| `documents` | Metadata for all uploaded files (the actual files are in Storage) |
| `audit_log` | Every action logged with user, timestamp, action type |

---

Built for Safe Haven – A Ray of Hope. Newcastle upon Tyne.

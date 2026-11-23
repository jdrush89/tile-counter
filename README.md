# Tally Me Banana

A React and Capacitor tally counter. Guests keep data on their device. Signed-in users can sync their tallies, tally history, and tally notes across devices.

## Development

```bash
npm install
npm run dev
```

## Production builds

Build the web and mobile assets at the site root:

```bash
npm run build
```

Build for the custom domain:

```bash
VITE_BASE_PATH=/ npm run build
```

Pushes to `main` deploy the Pages build to `https://bananatally.me/`. The deployment workflow reads the active Pages base path from GitHub so asset URLs remain correct if the domain configuration changes.

Guest web data is local to each browser and origin. Use the snapshot export and import features to move data between the retired Spark deployment and GitHub Pages.

The daily challenge is available at `/daily/` relative to the deployed app URL. Its four rounds are generated deterministically from the player's local calendar date.

## Accounts and sync

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard). In SQL Editor, run `supabase/migrations/20261120100000_account_tallies.sql`. It creates the account data table with row-level security so each account can access only its own data.
2. Under Authentication, enable email and password sign-in. Set the Site URL to `https://bananatally.me/` and add your local development URL, such as `http://localhost:5173/**`, to the allowed redirect URLs. Configure a custom SMTP provider for production email delivery.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project's Connect dialog. Use the publishable key, never the secret or service-role key. For native builds, set `VITE_AUTH_REDIRECT_URL` to the public web app URL; users confirm their email in a browser and then return to the app to sign in.
4. In GitHub repository Settings → Secrets and variables → Actions → Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The Pages workflow includes these public values in the web build. Rebuild native apps with the same environment values.
5. After signing in and syncing once, run `supabase/tests/account_tallies_rls.sql` in SQL Editor to check the access rules.

Guest data is copied into an account when signing in, without deleting the local copy. Edits made offline remain on the device until they can sync. If the same tally changes in two places, choose which version of that tally, including its history and notes, to keep. Snapshots and daily challenge results remain device-local. Browser account data is stored locally for offline use, so sign out and use a trusted device. Safe multi-tab syncing requires the Web Locks API; browsers without it cannot use account sync.

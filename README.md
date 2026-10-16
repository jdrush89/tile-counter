# Tally Me Banana

A React and Capacitor tally counter. The web app stores data in the browser's local storage, while the Android and iOS apps use Capacitor Preferences.

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

Web data is local to each browser and origin. Use the snapshot export and import features to move data between the retired Spark deployment and GitHub Pages.

The daily challenge is available at `/daily/` relative to the deployed app URL. Its three rounds are generated deterministically from the player's local calendar date.

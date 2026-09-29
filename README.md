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

Build with the GitHub Pages project path:

```bash
VITE_BASE_PATH=/tile-counter/ npm run build
```

Pushes to `main` deploy the Pages build to `https://jdrush89.github.io/tile-counter/`.

Web data is local to each browser and origin. Use the snapshot export and import features to move data between the retired Spark deployment and GitHub Pages.

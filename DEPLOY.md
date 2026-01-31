# Deploying The Reservoir with Live Streaming

This guide sets up The Reservoir with the multi-source hybrid API that fetches fresh fragments from PoetryDB, Quotable, and Zen Quotes.

## Quick Deploy to Netlify (Recommended)

### 1. Fork/Copy the Repository

```bash
git clone https://github.com/yourusername/the-reservoir.git
cd the-reservoir
```

### 2. Install Netlify CLI (optional, for local testing)

```bash
npm install -g netlify-cli
```

### 3. Local Development

```bash
# Start Netlify Dev server (serves functions locally)
netlify dev
```

Your site will be at `http://localhost:8888`
The API endpoint is at `http://localhost:8888/.netlify/functions/reservoir-stream`

### 4. Deploy to Production

```bash
# Link to your Netlify site
netlify link

# Deploy
netlify deploy --prod
```

Or connect your GitHub repo to Netlify for automatic deploys on push.

## Manual Deploy (Any Static Host)

If you don't want the live streaming API, you can:

1. Delete the `netlify/` folder
2. Set `USE_STREAMING_API = false` in `index.html`
3. Customize `reservoir.json` with your own fragments
4. Deploy `index.html` and `reservoir.json` to any static host (GitHub Pages, Vercel, Cloudflare Pages, etc.)

## Configuration

### Frontend Settings (in `index.html`)

```javascript
// Use streaming API or local JSON only
const USE_STREAMING_API = true;  // Set to false for offline-only mode

// API endpoint (change for your domain)
const STREAM_API_URL = '/.netlify/functions/reservoir-stream';
```

### Adding Your Own Fragments to the Stream

Edit `netlify/functions/reservoir-stream.js` and add to the `getDigitalFragment()` function:

```javascript
function getDigitalFragment() {
  const digital = [
    { text: "Your unique thought", source: "YourName", category: "digital" },
    // ... more fragments
  ];
  return digital[Math.floor(Math.random() * digital.length)];
}
```

Or add a new API source in the `handler` function.

### Rate Limits & Caching

The current implementation:
- Fetches fresh fragments on every stream generation (if `USE_STREAMING_API` is true)
- No caching (fresh chaos every time)
- Respects API rate limits by using `Promise.allSettled()` (fails gracefully)

If you want to add caching:
1. Add Redis or similar
2. Cache for 1-5 minutes to reduce API calls
3. Serve stale cache if APIs fail

## API Sources Used

| Source | Endpoint | Content | Auth |
|--------|----------|---------|------|
| PoetryDB | poetrydb.org/random/3 | Classic poetry | None |
| Quotable | api.quotable.io | Famous quotes | None |
| Zen Quotes | zenquotes.io/api/quotes | Spiritual wisdom | None |

All APIs are free and require no authentication.

## Troubleshooting

### "FETCHING..." stays forever
- Check browser console for CORS errors
- Verify `STREAM_API_URL` is correct
- Ensure Netlify Functions are enabled on your account

### APIs returning empty
- Check if APIs are down (rare)
- Fallback to local JSON happens automatically
- Check function logs in Netlify dashboard

### Want to add more sources?
- Add new `fetchXXX()` function
- Add to `Promise.allSettled()` array
- Process results in the handler

## Cost

- **Netlify**: Free tier includes 125k function invocations/month
- **APIs**: All free, no rate limits hit at personal usage levels
- **Total cost for personal use**: $0

## Custom Domains

Once deployed, update `STREAM_API_URL` in `index.html`:

```javascript
const STREAM_API_URL = 'https://yourdomain.com/.netlify/functions/reservoir-stream';
```

## Advanced: GitHub Actions + Netlify

For daily automated fragment updates (optional):

1. Create `.github/workflows/update-stream.yml`
2. Schedule to run daily
3. Commit new fragments to repo
4. Netlify auto-deploys

See example in `examples/github-actions-stream.yml`

---

*The stream flows through servers, yet feels like breath.*
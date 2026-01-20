This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### YouTube transcripts (fallbacks)
- Install the helpers: `pip install youtube-transcript-api yt-dlp`.
- If YouTube blocks requests, configure env vars in `.env.local`:
  - `YT_PROXY` (optionnel) : proxy résidentiel ou réseau de confiance (ex: `http://user:pass@host:port`).
  - `YT_COOKIES_FILE` (optionnel) : chemin vers un fichier cookies exporté depuis YouTube (pour les vidéos nécessitant connexion/âge).
  - `YT_USER_AGENT` (optionnel) : user-agent custom si besoin.
  - `YT_DLP_EXTRA` (optionnel) : options supplémentaires passées à `yt-dlp` (ex: `--extractor-args "youtube:player_client=android"`).
- Le fallback Whisper utilise `yt-dlp` avec ces paramètres; sans accès audio, utilisez l’option Copier/Coller dans l’UI.

### Gemini quotas
- Les checks de santé appellent Gemini. Si tu es en quota free tier, définis `DISABLE_GEMINI_HEALTHCHECK=true` dans `.env.local` pour ne pas consommer de requêtes sur cette route.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

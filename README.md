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

### YouTube Transcription (Whisper & yt-dlp)
- Ce projet utilise **Whisper (via Groq)** comme méthode principale pour transcrire les vidéos YouTube, car les méthodes basées sur les transcripts officiels sont souvent bloquées sur les serveurs VPS (OVH, AWS, etc.).
- Prérequis : `pip install yt-dlp` (et `youtube-transcript-api` en fallback).
- Si YouTube bloque les requêtes (429), configurez ces variables dans `.env.local` :
  - `YT_PROXY` : proxy résidentiel (ex: `http://user:pass@host:port`).
  - `YT_COOKIES_FILE` : chemin vers un fichier cookies exporté depuis YouTube.
  - `YT_DLP_EXTRA` : options supplémentaires (ex: `--extractor-args "youtube:player_client=android"`).
- Sans accès audio ou si tout échoue, utilisez l'option "Transcription manuelle" (Copier/Coller) dans l'interface.

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

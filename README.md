This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


## Environment Variables

| Variable              | Type     | Description                                  |
|-----------------------|----------|----------------------------------------------|
| `kashkaPrivacyNotice` | `string` | Defines Markdown displayed at ```/privacy``` |
| `kashkaImprint`       | `string` | Defines Markdown displayed at ```/imprint``` |


# Development

## Internationalization (i18n)

The app is localized with [`next-intl`](https://next-intl.dev/). All translations live in `i18n/<lang>.json`; the list of languages (codes, native names, style notes, enabled flag) is the single source of truth in `src/i18n/languages.json`.

Supported languages: `en`, `de`, `fr`, `es`, `it`, `pt`, `nl`, `pl`, `sv`, `da`, `no`, `fi`, `cs`, `sk`, `hu`, `ro`, `el`, `tr`, `uk`, `ru` (further languages are pre-registered but disabled).

### Adding / updating translations

`en.json` is the source of truth. To sync new or changed keys into all other languages and translate them:

```bash
# one language
pnpm translate fr

# all enabled languages (runs up to 3 in parallel, override with TRANSLATE_JOBS=n)
pnpm translate-all
```

The pipeline:

1. `scripts/sync-i18n.mjs` copies missing keys from `en.json` into the target file, marking them with `FROM en.json REPLACE: `
2. `scripts/translate-api.mjs` translates all marked values via an OpenAI-compatible chat API (batched, with validation, retries and token/TPS stats)
3. The script verifies that no marker remains and the file is valid JSON

Every run is logged to `logs/translate/<lang>-<timestamp>.log` (gitignored).

### API configuration

The translation API is configured through environment variables (no defaults):

| Variable               | Required | Description                              |
|------------------------|----------|------------------------------------------|
| `TRANSLATE_API_BASE`   | yes      | OpenAI-compatible base URL, e.g. `http://localhost:4000/v1` (already baked into `pnpm translate-all`) |
| `TRANSLATE_API_KEY`    | yes      | Bearer token — **keep out of the repo**, export it in your shell profile |
| `TRANSLATE_API_MODEL`  | yes      | Model id, e.g. `qwen3.8-27b` (already baked into `pnpm translate-all`) |
| `TRANSLATE_API_BATCH`  | no       | Keys per request (default `40`)          |

```bash
export TRANSLATE_API_KEY=sk-…   # once per shell / in your profile
pnpm translate-all
```

Per-language tone (e.g. informal "du"/"tu" registers) is stored in the `style` field of `src/i18n/languages.json`.

### Debugging translations

With `NEXT_PUBLIC_DISPLAY_DEBUG=true`, `/debug/translations` lists every key and value of the current locale, with a search filter.

## Running on Docker

Build the Docker image with:

```bash
docker build -t toolbox .
```

Run it with:

```bash
docker run -p 3000:3000 toolbox
```

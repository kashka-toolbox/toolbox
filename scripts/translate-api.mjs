#!/usr/bin/env node
// Fast path for scripts/translate.sh: translates marked values via a single
// OpenAI-compatible chat API per batch (no agent involved).
//
// Required configuration via environment variables (no defaults):
//   TRANSLATE_API_BASE   e.g. http://localhost:4000/v1
//   TRANSLATE_API_KEY    bearer token
//   TRANSLATE_API_MODEL  e.g. qwen3.8-27b
// Optional:
//   TRANSLATE_API_BATCH  keys per request (default 40)
//
// Exit codes: 0 = no markers remain, 2 = some markers remain, 1 = hard error.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MARKER = "FROM en.json REPLACE: ";
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, "..");
const lang = process.argv[2];
if (!lang) {
  console.error("usage: node scripts/translate-api.mjs <lang>");
  process.exit(1);
}

// --- config ----------------------------------------------------------------

const BASE = process.env.TRANSLATE_API_BASE?.replace(/\/$/, "");
const KEY = process.env.TRANSLATE_API_KEY;
const MODEL = process.env.TRANSLATE_API_MODEL;
const BATCH = Number(process.env.TRANSLATE_API_BATCH ?? 40);

for (const [name, value] of [["TRANSLATE_API_BASE", BASE], ["TRANSLATE_API_KEY", KEY], ["TRANSLATE_API_MODEL", MODEL]]) {
  if (!value) {
    console.error(`error: ${name} is not set. Export it before running, e.g.:\n  TRANSLATE_API_BASE=… TRANSLATE_API_KEY=… TRANSLATE_API_MODEL=… pnpm translate-all`);
    process.exit(1);
  }
}

// --- collect pending keys --------------------------------------------------

const registry = JSON.parse(readFileSync(path.join(root, "src", "i18n", "languages.json"), "utf8"));
const entry = registry.find((l) => l.code === lang);
if (!entry) {
  console.error(`error: unknown language "${lang}"`);
  process.exit(1);
}

const targetPath = path.join(root, "i18n", `${lang}.json`);
const target = JSON.parse(readFileSync(targetPath, "utf8"));

const pending = []; // { path, text }
(function walk(node, prefix) {
  for (const [k, v] of Object.entries(node)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      if (v.startsWith(MARKER)) pending.push({ path: p, text: v.slice(MARKER.length) });
    } else if (v && typeof v === "object") {
      walk(v, p);
    }
  }
})(target, "");

if (pending.length === 0) {
  console.log(`[${lang}] no pending markers`);
  process.exit(0);
}
console.log(`[${lang}] ${pending.length} key(s) to translate via API (${MODEL})`);

// --- API -------------------------------------------------------------------

const stats = { requests: 0, elapsedMs: 0, promptTokens: 0, completionTokens: 0 };

function stripThinking(s) {
  return s.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

function extractJson(s) {
  const t = stripThinking(s);
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in response");
  return JSON.parse(t.slice(start, end + 1));
}

async function translateBatch(batch, attempt) {
  const input = Object.fromEntries(batch.map((k) => [k.path, k.text]));
  const system = [
    `You are a professional translator for a developer toolbox web app. Translate the given English UI strings into ${entry.name} (${lang}).`,
    entry.style ? `Style: ${entry.style}.` : "",
    "Preserve HTML markup (e.g. <li>…</li>), capitalization, punctuation and trailing newlines exactly as in the source.",
    "If a source string is empty, return an empty string.",
    "Use consistent terminology across all strings (this is one coherent app).",
    'Respond with ONLY a valid JSON object mapping each key to the translated string. No markdown fences, no commentary.',
  ].filter(Boolean).join(" ");

  const user = attempt === 0 ? JSON.stringify(input, null, 1) : JSON.stringify(input, null, 1) + `\n\nYour previous response was missing or invalid for the keys included here. Translate them now.`;

  const body = {
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  const makeRequest = (withJsonFormat) =>
    fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
      },
      body: JSON.stringify(withJsonFormat ? { ...body, response_format: { type: "json_object" } } : body),
    });

  const t0 = Date.now();
  let res = await makeRequest(true);
  if (!res.ok) res = await makeRequest(false);
  const elapsedMs = Date.now() - t0;
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty response");

  // Decode stats: completion tokens per second of wall time for this request.
  const usage = data.usage ?? {};
  const completionTokens = usage.completion_tokens ?? 0;
  const promptTokens = usage.prompt_tokens ?? 0;
  const tps = elapsedMs > 0 ? (completionTokens / (elapsedMs / 1000)).toFixed(1) : "?";
  stats.requests += 1;
  stats.elapsedMs += elapsedMs;
  stats.promptTokens += promptTokens;
  stats.completionTokens += completionTokens;
  console.error(
    `[${lang}] batch ${stats.requests}: ${batch.length} keys | ${elapsedMs} ms decode | ${completionTokens} out / ${promptTokens} in tok | ${tps} tok/s`
  );

  return extractJson(content);
}

// --- run -------------------------------------------------------------------

const batches = [];
for (let i = 0; i < pending.length; i += BATCH) batches.push(pending.slice(i, i + BATCH));

const translations = {}; // path -> translated string
let failed = 0;

for (const batch of batches) {
  let done = false;
  for (let attempt = 0; attempt < 3 && !done; attempt++) {
    try {
      const out = await translateBatch(batch, attempt);
      for (const { path: p } of batch) {
        if (typeof out[p] === "string") {
          translations[p] = out[p];
        }
      }
      const missing = batch.filter(({ path: p }) => typeof translations[p] !== "string");
      if (missing.length === 0) done = true;
      else batch.splice(0, batch.length, ...missing); // retry only the missing ones
    } catch (e) {
      console.error(`[${lang}] batch attempt ${attempt + 1} failed: ${e.message}`);
    }
  }
  failed += batch.filter(({ path: p }) => typeof translations[p] !== "string").length;
}

// --- merge -----------------------------------------------------------------

function assign(node, pathParts, value) {
  const [head, ...rest] = pathParts;
  if (rest.length === 0) {
    node[head] = value;
    return;
  }
  assign(node[head], rest, value);
}

for (const { path: p } of pending) {
  if (typeof translations[p] === "string") {
    assign(target, p.split("."), translations[p]);
  }
}

writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);

const remaining = pending.filter(({ path: p }) => typeof translations[p] !== "string").length;
console.log(`[${lang}] translated ${pending.length - remaining}/${pending.length} key(s)${failed ? `, ${failed} failed` : ""}`);
console.log(
  `[${lang}] API stats: ${stats.requests} request(s), total decode ${(stats.elapsedMs / 1000).toFixed(1)} s, ` +
  `${stats.promptTokens} in / ${stats.completionTokens} out tok, ` +
  `avg ${(stats.elapsedMs > 0 ? (stats.completionTokens / (stats.elapsedMs / 1000)).toFixed(1) : "?")} tok/s`
);
process.exit(remaining > 0 ? 2 : 0);

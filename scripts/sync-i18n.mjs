#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const lang = process.argv[2] ?? "de";
const registryPath = path.join(dir, "..", "src", "i18n", "languages.json");
const enPath = path.join(dir, "..", "i18n", "en.json");
const targetPath = path.join(dir, "..", "i18n", `${lang}.json`);

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
if (!registry.some((l) => l.code === lang)) {
  console.error(
    `error: unknown language code "${lang}". Known codes: ${registry
      .map((l) => l.code)
      .join(", ")}`
  );
  process.exit(1);
}

const en = JSON.parse(readFileSync(enPath, "utf8"));
// Bootstrap: a missing target file starts from an empty object, so every key
// is added (and marked) on the first run.
const target = existsSync(targetPath)
  ? JSON.parse(readFileSync(targetPath, "utf8"))
  : {};

const MARKER = "FROM en.json REPLACE: ";

function prefixValue(value) {
  if (typeof value === "string") return MARKER + value;
  if (Array.isArray(value)) return value.map(prefixValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = prefixValue(v);
    return out;
  }
  return value;
}

const added = [];

function merge(nodeEn, nodeTarget, prefix) {
  const out = {};
  for (const [key, value] of Object.entries(nodeEn)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (!(key in nodeTarget)) {
      added.push(p);
      out[key] = prefixValue(value);
    } else if (
      typeof value === "object" &&
      value !== null &&
      typeof nodeTarget[key] === "object" &&
      nodeTarget[key] !== null
    ) {
      out[key] = merge(value, nodeTarget[key], p);
    } else {
      out[key] = nodeTarget[key];
    }
  }
  for (const key of Object.keys(nodeTarget)) {
    if (!(key in nodeEn)) out[key] = nodeTarget[key];
  }
  return out;
}

const merged = merge(en, target, "");

if (added.length > 0) {
  writeFileSync(targetPath, `${JSON.stringify(merged, null, 2)}\n`);
  for (const key of added) console.log(key);
  console.error(`Added ${added.length} missing keys from en.json to ${lang}.json`);
} else {
  console.error(`${lang}.json is already in sync with en.json, no changes made`);
}

#!/usr/bin/env node
/**
 * MongoDB image migration — shrinks the base64 blobs in `uploaded_images`.
 *
 * Why: product/thumbnail images are stored as base64 inside MongoDB and served by
 * /api/inventory/images/[id]. next/image can't serve the optimized image until it
 * first fetches that (often multi-MB) source, which is the ~4 s "resource load
 * delay" behind the product-page LCP. Re-encoding the stored blobs to resized WebP
 * collapses that cold-start cost (next/image still re-optimizes on delivery).
 *
 * Safe by design:
 *   - DRY RUN by default (reports savings, writes nothing).
 *   - On --apply, every original doc is copied to `uploaded_images_backup`
 *     (keyed by _id, never overwritten) before the blob is replaced.
 *   - Idempotent: already-WebP blobs at/under the cap are skipped.
 *
 * Usage:
 *   node scripts/optimize-db-images.mjs                 # dry run
 *   node scripts/optimize-db-images.mjs --apply         # migrate in place (+ backup)
 *   node scripts/optimize-db-images.mjs --apply --quality=72 --max-width=1600
 *   node scripts/optimize-db-images.mjs --restore       # put originals back from backup
 *
 * Flags:
 *   --apply         Write changes (default: dry run).
 *   --restore       Copy every doc in uploaded_images_backup back over the live doc.
 *   --max-width=N   Cap the longest edge (default 1600).
 *   --quality=N     WebP quality (default 72).
 *   --min-kb=N      Skip blobs smaller than N KiB (default 60).
 *   --db=NAME       Database name (default tMust).
 */
import { MongoClient } from "mongodb";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

sharp.cache(false);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// --- tiny .env loader (node scripts don't get Next's env automatically) ---
function loadEnv() {
  if (process.env.MONGODB_URI) return;
  try {
    const raw = readFileSync(path.join(ROOT, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {
    /* no .env file — rely on real env */
  }
}
loadEnv();

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (name, d) => {
  const hit = argv.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split("=")[1] : d;
};

const APPLY = has("--apply");
const RESTORE = has("--restore");
const DO_BACKUP = !has("--no-backup");
const MAX_WIDTH = Number(val("--max-width", "1600"));
const QUALITY = Number(val("--quality", "72"));
const MIN_BYTES = Number(val("--min-kb", "60")) * 1024;
const DB_NAME = val("--db", "tMust");
const COLL = "uploaded_images";
const BACKUP_COLL = "uploaded_images_backup";

const fmt = (b) => `${(b / 1024).toFixed(1)} KiB`;
const pct = (a, b) => (a ? `${(((a - b) / a) * 100).toFixed(0)}%` : "0%");

function decode(base64Data) {
  if (typeof base64Data !== "string") return null;
  const comma = base64Data.indexOf(",");
  const b64 = base64Data.startsWith("data:") && comma !== -1
    ? base64Data.slice(comma + 1)
    : base64Data;
  return Buffer.from(b64, "base64");
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found (checked env and .env). Aborting.");
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db(DB_NAME);
  const coll = db.collection(COLL);
  const backup = db.collection(BACKUP_COLL);

  try {
    if (RESTORE) {
      let restored = 0;
      const cur = backup.find({});
      for await (const doc of cur) {
        const { _id, ...rest } = doc;
        await coll.replaceOne({ _id }, rest, { upsert: true });
        restored++;
      }
      console.log(`♻️  Restored ${restored} image(s) from ${BACKUP_COLL}.`);
      return;
    }

    let totalBefore = 0;
    let totalAfter = 0;
    let changed = 0;
    let skipped = 0;
    const total = await coll.countDocuments();
    console.log(`Scanning ${total} document(s) in ${DB_NAME}.${COLL} …\n`);

    const cursor = coll.find({});
    for await (const doc of cursor) {
      const id = doc._id;
      try {
        const buf = decode(doc.base64Data);
        if (!buf || buf.length < MIN_BYTES) { skipped++; continue; }

        const meta = await sharp(buf, { failOn: "none" }).metadata();
        const alreadyWebp = /webp/i.test(doc.mimeType || meta.format || "");
        if (alreadyWebp && (!meta.width || meta.width <= MAX_WIDTH)) { skipped++; continue; }

        const out = await sharp(buf, { failOn: "none" })
          .rotate()
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: QUALITY, effort: 5 })
          .toBuffer();

        if (out.length >= buf.length) { skipped++; continue; }

        totalBefore += buf.length;
        totalAfter += out.length;
        changed++;
        console.log(`  ${id} ${doc.filename ? `(${doc.filename})` : ""}  ${fmt(buf.length)} -> ${fmt(out.length)}  (-${pct(buf.length, out.length)})`);

        if (APPLY) {
          if (DO_BACKUP) {
            const exists = await backup.findOne({ _id: id }, { projection: { _id: 1 } });
            if (!exists) await backup.insertOne(doc);
          }
          await coll.updateOne(
            { _id: id },
            {
              $set: {
                base64Data: `data:image/webp;base64,${out.toString("base64")}`,
                mimeType: "image/webp",
                optimizedAt: new Date(),
              },
            },
          );
        }
      } catch (err) {
        skipped++;
        console.log(`  ${id}  SKIPPED (${err.message})`);
      }
    }

    console.log("\n" + "-".repeat(60));
    console.log(`Images re-encoded : ${changed}`);
    console.log(`Skipped           : ${skipped}`);
    console.log(`Total before      : ${fmt(totalBefore)}`);
    console.log(`Total after       : ${fmt(totalAfter)}`);
    if (totalBefore) console.log(`Saved             : ${fmt(totalBefore - totalAfter)} (-${pct(totalBefore, totalAfter)})`);
    console.log(
      APPLY
        ? `\n✅ Applied. Originals copied to ${DB_NAME}.${BACKUP_COLL}. Revert with: node scripts/optimize-db-images.mjs --restore`
        : `\nℹ️  DRY RUN — nothing written. Re-run with --apply to migrate.`,
    );
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Image optimizer for /public using sharp.
 *
 * Why: the hero / collection PNGs are 2–3.5 MB each. next/image transcodes them
 * on delivery, but a smaller, dimension-capped SOURCE means faster optimization,
 * a lighter repo, and smaller delivered bytes. This script recompresses and
 * downscales the originals in place (keeping the same path + extension so every
 * import keeps working) and can also emit modern .webp/.avif siblings.
 *
 * Usage:
 *   node scripts/optimize-images.mjs             # DRY RUN — report savings only
 *   node scripts/optimize-images.mjs --apply     # overwrite originals (backs up first)
 *   node scripts/optimize-images.mjs --apply --emit-modern   # also write .webp + .avif
 *
 * Flags:
 *   --apply         Actually overwrite the source files (default: dry run).
 *   --emit-modern   Also write <name>.webp and <name>.avif next to each source.
 *   --max-width=N   Cap the longest edge (default 2000). Mobile art stays smaller.
 *   --min-kb=N      Skip files smaller than N KiB (default 80).
 *   --no-backup     Skip copying originals to .image-optim-backup/ (not recommended).
 */
import sharp from "sharp";
import { readdir, stat, mkdir, copyFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Don't let libvips hold file handles / mmaps open — otherwise overwriting the
// same path in place fails on Windows (EUNKNOWN).
sharp.cache(false);
sharp.concurrency(1);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const BACKUP = path.join(ROOT, ".image-optim-backup");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (name, d) => {
  const hit = argv.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split("=")[1] : d;
};

const APPLY = has("--apply");
const EMIT_MODERN = has("--emit-modern");
const DO_BACKUP = !has("--no-backup");
const MAX_WIDTH = Number(val("--max-width", "2000"));
const MIN_BYTES = Number(val("--min-kb", "80")) * 1024;

const RASTER = /\.(png|jpe?g)$/i;
const SKIP_DIRS = new Set([".image-optim-backup", "node_modules"]);

const fmt = (b) => `${(b / 1024).toFixed(1)} KiB`;
const pct = (a, b) => `${(((a - b) / a) * 100).toFixed(0)}%`;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(path.join(dir, entry.name));
    } else if (RASTER.test(entry.name)) {
      yield path.join(dir, entry.name);
    }
  }
}

async function reencode(input, meta) {
  const isPng = /\.png$/i.test(input);
  let pipe = sharp(input, { failOn: "none" });
  if (meta.width && meta.width > MAX_WIDTH) {
    pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }
  // Keep the same container so imports/paths are unchanged.
  return isPng
    ? pipe.png({ compressionLevel: 9, effort: 10, quality: 82, palette: true }).toBuffer()
    : pipe.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;
  const rows = [];

  for await (const file of walk(PUBLIC)) {
    const rel = path.relative(ROOT, file);
    try {
      const { size } = await stat(file);
      if (size < MIN_BYTES) continue;

      const meta = await sharp(file, { failOn: "none" }).metadata();
      const optimized = await reencode(file, meta);

      if (EMIT_MODERN && APPLY) {
        const base = file.replace(RASTER, "");
        const src = sharp(file, { failOn: "none" }).resize({
          width: meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : undefined,
          withoutEnlargement: true,
        });
        await src.clone().webp({ quality: 72 }).toFile(`${base}.webp`);
        await src.clone().avif({ quality: 50 }).toFile(`${base}.avif`);
      }

      if (optimized.length < size) {
        totalBefore += size;
        totalAfter += optimized.length;
        changed++;
        rows.push(`  ${rel}  ${fmt(size)} -> ${fmt(optimized.length)}  (-${pct(size, optimized.length)})`);

        if (APPLY) {
          if (DO_BACKUP) {
            const dest = path.join(BACKUP, path.relative(PUBLIC, file));
            // Never overwrite an existing backup — preserves the true original
            // if the script is re-run after a partial application.
            if (!existsSync(dest)) {
              await mkdir(path.dirname(dest), { recursive: true });
              await copyFile(file, dest);
            }
          }
          await writeFile(file, optimized);
        }
      }
    } catch (err) {
      rows.push(`  ${rel}  SKIPPED (${err.code || err.message})`);
    }
  }

  console.log(rows.join("\n") || "  (no images above threshold needed shrinking)");
  console.log("\n" + "-".repeat(60));
  console.log(`Files optimized : ${changed}`);
  console.log(`Total before    : ${fmt(totalBefore)}`);
  console.log(`Total after     : ${fmt(totalAfter)}`);
  if (totalBefore) console.log(`Saved           : ${fmt(totalBefore - totalAfter)} (-${pct(totalBefore, totalAfter)})`);
  console.log(
    APPLY
      ? `\n✅ Applied in place.${DO_BACKUP ? ` Originals backed up to ${path.relative(ROOT, BACKUP)}/` : ""}`
      : `\nℹ️  DRY RUN — nothing written. Re-run with --apply to overwrite the sources.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

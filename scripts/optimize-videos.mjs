#!/usr/bin/env node
/**
 * Video optimizer for /public using ffmpeg (must be on PATH).
 *
 * Why: the 8 style-showcase clips are 1.5–4.6 MB each (~28 MB total) and were the
 * single biggest payload on the homepage. They are muted, looping, cropped to a
 * 4:5 card — so they can be scaled down, stripped of audio, and re-encoded far
 * smaller with no visible loss. This also generates a poster frame you can use as
 * the <video poster="…"> so the card shows instantly before playback.
 *
 * Usage:
 *   node scripts/optimize-videos.mjs           # encode previews into <dir>/.optimized/ + report
 *   node scripts/optimize-videos.mjs --apply   # replace originals in place (backs up first)
 *
 * Flags:
 *   --apply        Overwrite the original .mp4 with the optimized one (backup kept).
 *   --webm         Also emit a VP9 .webm sibling (smaller, slower to encode).
 *   --poster       Also write <name>.jpg poster from the first frame.
 *   --height=N     Max height in px (default 720; cards never need more on mobile).
 *   --crf=N        x264 quality, lower = better/bigger (default 30).
 *   --no-backup    Skip copying originals to .video-optim-backup/.
 */
import { spawnSync } from "node:child_process";
import { readdir, stat, mkdir, copyFile, rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const BACKUP = path.join(ROOT, ".video-optim-backup");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (name, d) => {
  const hit = argv.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split("=")[1] : d;
};

const APPLY = has("--apply");
const WEBM = has("--webm");
const POSTER = has("--poster");
const DO_BACKUP = !has("--no-backup");
const HEIGHT = Number(val("--height", "720"));
const CRF = Number(val("--crf", "30"));

const VIDEO = /\.(mp4|mov|webm|m4v)$/i;
const SKIP_DIRS = new Set([".optimized", ".video-optim-backup", "node_modules"]);
const SCALE = `scale=-2:'min(${HEIGHT},ih)'`;

const fmt = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;
const pct = (a, b) => `${(((a - b) / a) * 100).toFixed(0)}%`;

function ffmpeg(a) {
  const r = spawnSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...a], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${a.join(" ")}`);
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(path.join(dir, entry.name));
    } else if (VIDEO.test(entry.name)) {
      yield path.join(dir, entry.name);
    }
  }
}

async function main() {
  if (spawnSync("ffmpeg", ["-version"]).status !== 0) {
    console.error("ffmpeg not found on PATH. Install it and re-run.");
    process.exit(1);
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for await (const file of walk(PUBLIC)) {
   try {
    const { size } = await stat(file);
    const rel = path.relative(ROOT, file);
    const dir = path.dirname(file);
    const name = path.basename(file, path.extname(file));

    const outDir = APPLY ? dir : path.join(dir, ".optimized");
    await mkdir(outDir, { recursive: true });
    const outMp4 = path.join(outDir, `${name}.opt.mp4`);

    // H.264 MP4: scaled, audio stripped (clips are muted), faststart for streaming.
    ffmpeg([
      "-i", file,
      "-vf", SCALE,
      "-an",
      "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-crf", String(CRF), "-preset", "slow", "-movflags", "+faststart",
      outMp4,
    ]);

    if (WEBM) {
      ffmpeg([
        "-i", file, "-vf", SCALE, "-an",
        "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-row-mt", "1",
        path.join(outDir, `${name}.webm`),
      ]);
    }
    if (POSTER) {
      ffmpeg([
        "-i", file, "-vf", `${SCALE},select=eq(n\\,0)`, "-frames:v", "1",
        "-q:v", "4", path.join(outDir, `${name}.jpg`),
      ]);
    }

    const after = (await stat(outMp4)).size;
    totalBefore += size;
    totalAfter += after;
    count++;
    console.log(`  ${rel}  ${fmt(size)} -> ${fmt(after)}  (-${pct(size, after)})`);

    if (APPLY) {
      if (DO_BACKUP) {
        const dest = path.join(BACKUP, path.relative(PUBLIC, file));
        // Never overwrite an existing backup — preserves the true original.
        if (!existsSync(dest)) {
          await mkdir(path.dirname(dest), { recursive: true });
          await copyFile(file, dest);
        }
      }
      // Replace original with the optimized MP4 (same filename/extension).
      if (/\.mp4$/i.test(file)) {
        await rm(file);
        await rename(outMp4, file);
      } else {
        // non-mp4 source: write an .mp4 beside it and keep original backed up
        await rename(outMp4, path.join(dir, `${name}.mp4`));
      }
    }
   } catch (err) {
     console.log(`  ${path.relative(ROOT, file)}  SKIPPED (${err.message})`);
   }
  }

  console.log("\n" + "-".repeat(60));
  console.log(`Videos processed : ${count}`);
  console.log(`Total before     : ${fmt(totalBefore)}`);
  console.log(`Total after      : ${fmt(totalAfter)}`);
  if (totalBefore) console.log(`Saved            : ${fmt(totalBefore - totalAfter)} (-${pct(totalBefore, totalAfter)})`);
  console.log(
    APPLY
      ? `\n✅ Replaced originals in place.${DO_BACKUP ? ` Backups in ${path.relative(ROOT, BACKUP)}/` : ""}`
      : `\nℹ️  Previews written to each folder's .optimized/. Re-run with --apply to replace originals.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

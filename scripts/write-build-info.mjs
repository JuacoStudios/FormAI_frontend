import { writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const sha = process.env.VERCEL_GIT_COMMIT_SHA
  || execSync("git rev-parse --short HEAD").toString().trim();
const branch = process.env.VERCEL_GIT_COMMIT_REF
  || execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
const ts = new Date().toISOString();

mkdirSync("dist", { recursive: true });
writeFileSync("dist/build-info.json", JSON.stringify({ sha, branch, ts }, null, 2));
console.log("[build-info] wrote dist/build-info.json", { sha, branch, ts });









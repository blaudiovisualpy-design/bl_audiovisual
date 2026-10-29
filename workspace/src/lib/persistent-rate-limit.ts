import { createHash, randomBytes } from "node:crypto";
import { chmod, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// OPENCLAW_PERSISTENT_RATE_LIMIT_V1
type Bucket = { count: number; resetAt: number };
export type RateLimitResult = { allowed: boolean; retryAfter: number };

const LOCK_STALE_MS = 15_000;
const LOCK_RETRIES = 80;
const LOCK_WAIT_MS = 25;

function stateRoot() {
  const configured = process.env.OPENCLAW_SECURITY_STATE_DIR?.trim();
  return configured
    ? path.resolve(configured, "rate-limits")
    : path.resolve(process.cwd(), ".openclaw-security", "rate-limits");
}

function idForKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureRoot() {
  const root = stateRoot();
  await mkdir(root, { recursive: true, mode: 0o700 });
  await chmod(root, 0o700).catch(() => undefined);
  return root;
}

async function acquireLock(lockPath: string) {
  for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
    try {
      await mkdir(lockPath, { mode: 0o700 });
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;
      const info = await stat(lockPath).catch(() => null);
      if (info && Date.now() - info.mtimeMs > LOCK_STALE_MS) {
        await rm(lockPath, { recursive: true, force: true });
        continue;
      }
      await sleep(LOCK_WAIT_MS);
    }
  }
  throw new Error("No se pudo adquirir el lock del rate limit");
}

async function readBucket(filePath: string): Promise<Bucket | null> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<Bucket>;
    if (!Number.isFinite(parsed.count) || !Number.isFinite(parsed.resetAt)) return null;
    return { count: Number(parsed.count), resetAt: Number(parsed.resetAt) };
  } catch {
    return null;
  }
}

async function writeBucket(filePath: string, bucket: Bucket) {
  const temp = `${filePath}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(temp, `${JSON.stringify(bucket)}\n`, { mode: 0o600, flag: "wx" });
  await rename(temp, filePath);
  await chmod(filePath, 0o600).catch(() => undefined);
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (!Number.isInteger(limit) || limit <= 0 || !Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("Configuracion de rate limit invalida");
  }

  const root = await ensureRoot();
  const id = idForKey(key);
  const filePath = path.join(root, `${id}.json`);
  const lockPath = path.join(root, `${id}.lock`);
  await acquireLock(lockPath);

  try {
    const now = Date.now();
    const current = await readBucket(filePath);
    const bucket = !current || current.resetAt <= now
      ? { count: 1, resetAt: now + windowMs }
      : { count: current.count + 1, resetAt: current.resetAt };
    await writeBucket(filePath, bucket);
    return {
      allowed: bucket.count <= limit,
      retryAfter: bucket.count <= limit ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

export async function clearRateLimit(key: string) {
  const root = await ensureRoot();
  const id = idForKey(key);
  const filePath = path.join(root, `${id}.json`);
  const lockPath = path.join(root, `${id}.lock`);
  await acquireLock(lockPath);
  try {
    await rm(filePath, { force: true });
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

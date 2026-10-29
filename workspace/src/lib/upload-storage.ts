import path from "node:path";

export const MAX_UPLOAD_SIZE =
  5 * 1024 * 1024;

export const UPLOAD_KINDS = [
  "projects",
  "services",
  "testimonials",
  "logos",
  "hero",
  "general",
] as const;

export type UploadKind =
  (typeof UPLOAD_KINDS)[number];

const uploadKindSet =
  new Set<string>(UPLOAD_KINDS);

const storedFilenamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i;

export function normalizeUploadKind(
  value: unknown,
): UploadKind | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  return uploadKindSet.has(normalized)
    ? (normalized as UploadKind)
    : null;
}

export function uploadStorageRoot() {
  const configured =
    process.env.UPLOAD_STORAGE_DIR?.trim();

  return configured
    ? path.resolve(configured)
    : path.resolve(
        process.cwd(),
        "storage",
        "uploads",
      );
}

export function isStoredUploadFilename(
  value: string,
) {
  return storedFilenamePattern.test(value);
}

export function resolveStoredUpload(
  kind: UploadKind,
  filename: string,
) {
  if (!isStoredUploadFilename(filename)) {
    return null;
  }

  const root =
    uploadStorageRoot();

  const kindRoot =
    path.resolve(root, kind);

  const target =
    path.resolve(
      kindRoot,
      filename,
    );

  if (
    target !== kindRoot &&
    !target.startsWith(
      `${kindRoot}${path.sep}`,
    )
  ) {
    return null;
  }

  return target;
}

export function contentTypeForUpload(
  filename: string,
) {
  const extension =
    path.extname(filename).toLowerCase();

  if (extension === ".jpg") {
    return "image/jpeg";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return null;
}

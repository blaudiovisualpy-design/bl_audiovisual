import {
  readFile,
} from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  contentTypeForUpload,
  normalizeUploadKind,
  resolveStoredUpload,
} from "@/lib/upload-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    kind: string;
    filename: string;
  }>;
};

async function loadUpload(
  context: RouteContext,
) {
  const {
    kind: rawKind,
    filename,
  } = await context.params;

  const kind =
    normalizeUploadKind(rawKind);

  const contentType =
    contentTypeForUpload(filename);

  if (
    !kind ||
    !contentType
  ) {
    return null;
  }

  const targetPath =
    resolveStoredUpload(
      kind,
      filename,
    );

  if (!targetPath) {
    return null;
  }

  try {
    const data =
      await readFile(targetPath);

    return {
      data,
      contentType,
    };
  } catch {
    return null;
  }
}

function responseHeaders(
  contentType: string,
  length: number,
) {
  return {
    "Content-Type":
      contentType,
    "Content-Length":
      String(length),
    "Cache-Control":
      "public, max-age=31536000, immutable",
    "X-Content-Type-Options":
      "nosniff",
  };
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const upload =
    await loadUpload(context);

  if (!upload) {
    return new NextResponse(
      "No encontrado.",
      {
        status: 404,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }

  return new NextResponse(
    new Uint8Array(
      upload.data,
    ),
    {
      status: 200,
      headers:
        responseHeaders(
          upload.contentType,
          upload.data.length,
        ),
    },
  );
}

export async function HEAD(
  _request: Request,
  context: RouteContext,
) {
  const upload =
    await loadUpload(context);

  if (!upload) {
    return new NextResponse(
      null,
      {
        status: 404,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }

  return new NextResponse(
    null,
    {
      status: 200,
      headers:
        responseHeaders(
          upload.contentType,
          upload.data.length,
        ),
    },
  );
}

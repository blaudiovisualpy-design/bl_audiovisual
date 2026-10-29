import { randomUUID } from "node:crypto";
import {
  mkdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { MediaOrigin, MediaType } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { requireAdminMutation } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_UPLOAD_SIZE,
  normalizeUploadKind,
  resolveStoredUpload,
  type UploadKind,
} from "@/lib/upload-storage";
import { requestBodyTooLarge } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS =
  new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
  ]);

type ValidImage = {
  mime:
    | "image/jpeg"
    | "image/png"
    | "image/webp";
  extension:
    | "jpg"
    | "png"
    | "webp";
};

function jsonError(
  message: string,
  status = 400,
) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    },
  );
}

function extensionFromName(
  name: string,
) {
  return (
    name
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
}

function detectImage(
  buffer: Buffer,
): ValidImage | null {
  if (
    buffer.length >= 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return {
      mime: "image/jpeg",
      extension: "jpg",
    };
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      mime: "image/png",
      extension: "png",
    };
  }

  if (
    buffer.length >= 12 &&
    buffer
      .subarray(0, 4)
      .toString("ascii") ===
      "RIFF" &&
    buffer
      .subarray(8, 12)
      .toString("ascii") ===
      "WEBP"
  ) {
    return {
      mime: "image/webp",
      extension: "webp",
    };
  }

  return null;
}

function requestedKind(
  value: FormDataEntryValue | null,
): UploadKind | null {
  if (value === null) {
    return "general";
  }

  return normalizeUploadKind(value);
}

export async function POST(
  request: Request,
) {
  const actor =
    await requireAdminMutation(request);

  if (!actor) {
    return jsonError(
      "No autorizado.",
      401,
    );
  }

  if (requestBodyTooLarge(request, MAX_UPLOAD_SIZE + 1024 * 1024)) {
    return jsonError("La carga supera el tamaño máximo permitido.", 413);
  }

  const formData =
    await request
      .formData()
      .catch(() => null);

  if (!formData) {
    return jsonError(
      "La solicitud debe usar multipart/form-data.",
    );
  }

  const kind =
    requestedKind(
      formData.get("kind"),
    );

  if (!kind) {
    return jsonError(
      "El tipo de carga no está permitido.",
    );
  }

  const file =
    formData.get("file");

  if (!(file instanceof File)) {
    return jsonError(
      "Debe seleccionar un archivo de imagen.",
    );
  }

  if (file.size <= 0) {
    return jsonError(
      "El archivo está vacío.",
    );
  }

  if (
    file.size >
    MAX_UPLOAD_SIZE
  ) {
    return jsonError(
      "El archivo supera el tamaño máximo de 5 MiB.",
    );
  }

  const originalExtension =
    extensionFromName(file.name);

  if (
    !ALLOWED_EXTENSIONS.has(
      originalExtension,
    )
  ) {
    return jsonError(
      "La extensión del archivo no está permitida.",
    );
  }

  const arrayBuffer =
    await file
      .arrayBuffer()
      .catch(() => null);

  if (!arrayBuffer) {
    return jsonError(
      "No se pudo leer el archivo de imagen.",
    );
  }

  const buffer =
    Buffer.from(arrayBuffer);

  const detected =
    detectImage(buffer);

  if (!detected) {
    return jsonError(
      "El contenido del archivo no corresponde a una imagen válida.",
    );
  }

  if (
    file.type !==
    detected.mime
  ) {
    return jsonError(
      "El MIME declarado no coincide con el contenido real.",
    );
  }

  const filename =
    `${randomUUID()}.${detected.extension}`;

  const targetPath =
    resolveStoredUpload(
      kind,
      filename,
    );

  if (!targetPath) {
    return jsonError(
      "No se pudo generar una ruta de almacenamiento segura.",
      500,
    );
  }

  const relativeUrl =
    `/uploads/${kind}/${filename}`;

  try {
    await mkdir(
      path.dirname(targetPath),
      {
        recursive: true,
      },
    );

    await writeFile(
      targetPath,
      buffer,
      {
        flag: "wx",
      },
    );

    const asset =
      await prisma.mediaAsset.create({
        data: {
          type: MediaType.IMAGE,
          origin: MediaOrigin.LOCAL,
          url: relativeUrl,
          mimeType: detected.mime,
          sizeBytes: file.size,
        },
      });

    await audit(
      actor.id,
      "UPLOAD",
      "MediaAsset",
      asset.id,
      `kind=${kind};mime=${detected.mime};size=${file.size}`,
    );
  } catch {
    return jsonError(
      "No se pudo guardar la imagen.",
      500,
    );
  }

  return NextResponse.json({
    ok: true,
    url: relativeUrl,
  });
}

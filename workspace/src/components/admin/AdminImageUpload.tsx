"use client";

import { useId, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AdminImageUpload({
  label,
  name,
  removeName,
  kind,
  defaultValue,
}: {
  label: string;
  name: string;
  removeName: string;
  kind: "projects" | "services" | "testimonials" | "logos" | "hero";
  defaultValue?: string | null;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue || "");
  const [removed, setRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Solo se aceptan imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen no puede superar los 5 MiB.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", kind);

    setUploading(true);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await response.json().catch(() => ({}));
    setUploading(false);

    if (!response.ok || typeof json.url !== "string") {
      setError(json.error || "No se pudo subir la imagen.");
      return;
    }

    setUrl(json.url);
    setRemoved(false);
  }

  function removeImage() {
    setUrl("");
    setRemoved(true);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="grid gap-3 rounded-md border border-black/15 bg-white p-3 text-sm font-bold md:col-span-2">
      <input name={name} type="hidden" value={removed ? "" : url} />
      {removed && <input name={removeName} type="hidden" value="true" />}

      <label className="grid gap-2" htmlFor={id}>
        <span>{label}</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="focus-ring file:mr-3 file:rounded-md file:border-0 file:bg-[#11130F] file:px-3 file:py-2 file:text-sm file:font-black file:text-white"
          id={id}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
          ref={fileRef}
          type="file"
        />
      </label>

      <label className="grid gap-1 text-xs font-bold text-black/62">
        URL existente o manual
        <input
          className="focus-ring min-h-10 rounded-md border border-black/15 bg-[#F7F1DE] px-3 text-sm text-[#11130F]"
          onChange={(event) => {
            setUrl(event.target.value);
            setRemoved(false);
          }}
          placeholder="/uploads/projects/imagen.webp o https://..."
          type="text"
          value={removed ? "" : url}
        />
      </label>

      {url && !removed && (
        <div className="overflow-hidden rounded-md border border-black/10 bg-black/5">
          <img alt={`Vista previa de ${label.toLowerCase()}`} className="max-h-52 w-full object-cover" src={url} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button className="focus-ring rounded-md border border-black/15 px-3 py-2 text-xs font-black" onClick={removeImage} type="button">
          Quitar imagen
        </button>
        {uploading && <span className="text-xs text-black/58">Subiendo imagen...</span>}
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
    </div>
  );
}

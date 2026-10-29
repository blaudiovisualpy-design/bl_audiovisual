import fs from "node:fs";
import path from "node:path";
import {
  createRequire,
} from "node:module";

const root =
  process.env.OPENCLAW_ROOT;

const workspace =
  process.cwd();

const credentialsFile =
  process.env.QA_CREDENTIALS;

const testImage =
  process.env.QA_TEST_IMAGE;

const reportDir =
  process.env.QA_REPORT_DIR;

const reportJson =
  path.join(
    reportDir,
    "report.json",
  );

const reportMarkdown =
  path.join(
    reportDir,
    "report.md",
  );

const screenshotPath =
  path.join(
    reportDir,
    "service-created-real.png",
  );

function assert(
  condition,
  message,
) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseEnv(raw) {
  const values =
    new Map();

  for (
    const rawLine
    of raw.split(/\r?\n/)
  ) {
    const line =
      rawLine.trim();

    if (
      !line ||
      line.startsWith("#") ||
      !line.includes("=")
    ) {
      continue;
    }

    const separator =
      line.indexOf("=");

    const key =
      line
        .slice(0, separator)
        .trim();

    let value =
      line
        .slice(separator + 1)
        .trim();

    if (
      (
        value.startsWith('"') &&
        value.endsWith('"')
      ) ||
      (
        value.startsWith("'") &&
        value.endsWith("'")
      )
    ) {
      value =
        value.slice(1, -1);
    }

    values.set(
      key,
      value,
    );
  }

  return values;
}

function applyEnvironmentFile(
  file,
) {
  if (!fs.existsSync(file)) {
    return;
  }

  const values =
    parseEnv(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );

  for (
    const [key, value]
    of values.entries()
  ) {
    process.env[key] =
      value;
  }
}

function loadCredentials() {
  const values =
    parseEnv(
      fs.readFileSync(
        credentialsFile,
        "utf8",
      ),
    );

  const email =
    values.get(
      "ADMIN_EMAIL",
    );

  const password =
    values.get(
      "ADMIN_PASSWORD",
    );

  const configuredUrl =
    values.get(
      "ADMIN_URL",
    ) ||
    "http://127.0.0.1:3000/admin/login";

  assert(
    email &&
    password,
    "Faltan ADMIN_EMAIL o ADMIN_PASSWORD.",
  );

  const origin =
    new URL(
      configuredUrl,
    ).origin;

  return {
    email,
    password,
    origin,
    loginUrl:
      `${origin}/admin/login`,
  };
}

function chromeExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  const executable =
    candidates.find(
      (candidate) =>
        fs.existsSync(candidate),
    );

  assert(
    executable,
    "No se encontró Chrome o Chromium.",
  );

  return executable;
}

function safeUploadedFile(
  uploadedUrl,
) {
  assert(
    /^\/uploads\/services\/[0-9a-f-]+\.(?:jpg|png|webp)$/i.test(
      uploadedUrl,
    ),
    "La URL cargada no pertenece al directorio permitido.",
  );

  const filename =
    path.posix.basename(
      uploadedUrl,
    );

  const storageRoot =
    path.resolve(
      process.env.UPLOAD_STORAGE_DIR ||
      path.join(
        workspace,
        "storage",
        "uploads",
      ),
    );

  const allowedRoot =
    path.resolve(
      storageRoot,
      "services",
    ) + path.sep;

  const absolute =
    path.resolve(
      storageRoot,
      "services",
      filename,
    );

  assert(
    absolute.startsWith(
      allowedRoot,
    ),
    "La ruta calculada salió del directorio permitido.",
  );

  return absolute;
}

fs.mkdirSync(
  reportDir,
  {
    recursive: true,
  },
);

applyEnvironmentFile(
  path.join(
    workspace,
    ".env",
  ),
);

applyEnvironmentFile(
  path.join(
    workspace,
    ".env.local",
  ),
);

const requireFromRoot =
  createRequire(
    path.join(
      root,
      "package.json",
    ),
  );

const requireFromWorkspace =
  createRequire(
    path.join(
      workspace,
      "package.json",
    ),
  );

const {
  chromium,
} = requireFromRoot(
  "playwright",
);

const {
  PrismaClient,
} = requireFromWorkspace(
  "@prisma/client",
);

const prisma =
  new PrismaClient();

const credentials =
  loadCredentials();

const stamp =
  Date.now();

const titleEs =
  `Producción audiovisual QA ${stamp}`;

const descriptionEs =
  "Servicio creado únicamente en español para validar la traducción automática y la persistencia directa en PostgreSQL.";

let browser = null;
let serviceId = null;
let uploadedUrl = "";
let uploadedFile = "";
let payload = null;
let databaseRecord = null;
let failure = null;

const checks = [];

function addCheck(
  name,
  ok,
  detail,
) {
  const result = {
    name,
    ok: Boolean(ok),
    detail,
  };

  checks.push(
    result,
  );

  console.log(
    `CHECK=${name}` +
    `|OK=${Number(result.ok)}` +
    `|DETAIL=${detail}`,
  );
}

try {
  assert(
    fs.existsSync(testImage),
    "No existe la imagen de prueba.",
  );

  browser =
    await chromium.launch({
      executablePath:
        chromeExecutable(),
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

  const context =
    await browser.newContext({
      viewport: {
        width: 1440,
        height: 1000,
      },
    });

  const page =
    await context.newPage();

  await page.goto(
    credentials.loginUrl,
    {
      waitUntil:
        "domcontentloaded",
      timeout: 45000,
    },
  );

  await page
    .locator(
      'input[name="email"]',
    )
    .fill(
      credentials.email,
    );

  await page
    .locator(
      'input[name="password"]',
    )
    .fill(
      credentials.password,
    );

  await Promise.all([
    page.waitForURL(
      (url) =>
        url.pathname ===
        "/admin",
      {
        timeout: 45000,
        waitUntil:
          "domcontentloaded",
      },
    ),
    page
      .getByRole(
        "button",
        {
          name: "Entrar",
          exact: true,
        },
      )
      .click(),
  ]);

  await page
    .getByRole(
      "button",
      {
        name: "Servicios",
        exact: true,
      },
    )
    .waitFor({
      state: "visible",
      timeout: 30000,
    });

  addCheck(
    "login-real",
    true,
    "Sesión administrativa iniciada mediante navegador.",
  );

  await page
    .getByRole(
      "button",
      {
        name: "Servicios",
        exact: true,
      },
    )
    .click();

  await page
    .getByRole(
      "button",
      {
        name:
          "Crear servicio",
        exact: true,
      },
    )
    .click();

  await page
    .getByLabel(
      "Título",
      {
        exact: true,
      },
    )
    .fill(
      titleEs,
    );

  await page
    .getByLabel(
      "Descripción",
      {
        exact: true,
      },
    )
    .fill(
      descriptionEs,
    );

  await page
    .getByLabel(
      "Orden",
      {
        exact: true,
      },
    )
    .fill(
      "9876",
    );

  const uploadResponsePromise =
    page.waitForResponse(
      (response) => {
        const url =
          new URL(
            response.url(),
          );

        return (
          url.pathname ===
            "/api/admin/upload" &&
          response.request()
            .method() ===
            "POST"
        );
      },
      {
        timeout: 45000,
      },
    );

  await page
    .locator(
      'input[type="file"]',
    )
    .setInputFiles(
      testImage,
    );

  const uploadResponse =
    await uploadResponsePromise;

  const uploadBody =
    await uploadResponse
      .json()
      .catch(() => ({}));

  addCheck(
    "upload-http",
    uploadResponse.status() === 200,
    `HTTP ${uploadResponse.status()}`,
  );

  uploadedUrl =
    typeof uploadBody.url ===
    "string"
      ? uploadBody.url
      : "";

  addCheck(
    "upload-url",
    uploadedUrl.startsWith(
      "/uploads/services/",
    ),
    uploadedUrl ||
      "URL ausente",
  );

  await page.waitForFunction(
    () => {
      const input =
        document.querySelector(
          'input[name="imageUrl"]',
        );

      return (
        input instanceof
          HTMLInputElement &&
        input.value.startsWith(
          "/uploads/services/",
        )
      );
    },
    undefined,
    {
      timeout: 45000,
    },
  );

  const hiddenImageUrl =
    await page
      .locator(
        'input[name="imageUrl"]',
      )
      .inputValue();

  addCheck(
    "upload-hidden-field",
    hiddenImageUrl ===
      uploadedUrl,
    hiddenImageUrl,
  );

  const createResponsePromise =
    page.waitForResponse(
      (response) => {
        const url =
          new URL(
            response.url(),
          );

        if (
          url.pathname !==
            "/api/admin/content" ||
          response.request()
            .method() !==
            "POST"
        ) {
          return false;
        }

        try {
          const candidate =
            response.request()
              .postDataJSON();

          return (
            candidate?.resource ===
              "service" &&
            candidate?.data?.titleEs ===
              titleEs
          );
        } catch {
          return false;
        }
      },
      {
        timeout: 60000,
      },
    );

  await page
    .getByRole(
      "button",
      {
        name: "Guardar",
        exact: true,
      },
    )
    .click();

  const createResponse =
    await createResponsePromise;

  const createBody =
    await createResponse
      .json()
      .catch(() => ({}));

  payload =
    createResponse
      .request()
      .postDataJSON();

  serviceId =
    createBody?.id ||
    createBody?.item?.id ||
    null;

  addCheck(
    "create-http",
    createResponse.status() ===
      200,
    `HTTP ${createResponse.status()}`,
  );

  addCheck(
    "service-id",
    Boolean(serviceId),
    serviceId ||
      "ID ausente",
  );

  const forbiddenKeys = [
    "titleEn",
    "descriptionEn",
    "nameEn",
    "quoteEn",
    "heroTextEn",
    "aboutEn",
    "locationEn",
  ].filter(
    (key) =>
      Object.prototype
        .hasOwnProperty
        .call(
          payload?.data || {},
          key,
        ),
  );

  addCheck(
    "payload-solo-espanol",
    forbiddenKeys.length === 0 &&
      payload?.data?.titleEs ===
        titleEs &&
      payload?.data?.descriptionEs ===
        descriptionEs,
    `Claves enviadas: ${
      Object.keys(
        payload?.data || {},
      ).join(",")
    }`,
  );

  await page
    .getByText(
      "Guardado correctamente. Los datos se actualizaron.",
      {
        exact: true,
      },
    )
    .waitFor({
      state: "visible",
      timeout: 60000,
    });

  await page
    .getByText(
      titleEs,
      {
        exact: true,
      },
    )
    .waitFor({
      state: "visible",
      timeout: 30000,
    });

  addCheck(
    "visible-en-listado",
    true,
    "El servicio aparece en el listado después de guardar.",
  );

  databaseRecord =
    await prisma.service
      .findUnique({
        where: {
          id: serviceId,
        },
      });

  addCheck(
    "postgres-registro",
    Boolean(
      databaseRecord,
    ),
    databaseRecord?.id ||
      "Registro ausente",
  );

  addCheck(
    "postgres-espanol",
    databaseRecord?.titleEs ===
      titleEs &&
    databaseRecord
      ?.descriptionEs ===
      descriptionEs,
    "Los campos españoles coinciden con la entrada.",
  );

  addCheck(
    "postgres-ingles-generado",
    Boolean(
      databaseRecord
        ?.titleEn
        ?.trim() &&
      databaseRecord
        ?.descriptionEn
        ?.trim() &&
      databaseRecord
        .descriptionEn !==
        descriptionEs,
    ),
    JSON.stringify({
      titleEnLength:
        databaseRecord
          ?.titleEn
          ?.length || 0,
      descriptionEnLength:
        databaseRecord
          ?.descriptionEn
          ?.length || 0,
      translatedDescriptionDiffers:
        databaseRecord
          ?.descriptionEn !==
        descriptionEs,
    }),
  );

  addCheck(
    "postgres-imagen",
    databaseRecord?.imageUrl ===
      uploadedUrl,
    databaseRecord?.imageUrl ||
      "URL ausente",
  );

  uploadedFile =
    safeUploadedFile(
      uploadedUrl,
    );

  addCheck(
    "archivo-fisico",
    fs.existsSync(
      uploadedFile,
    ) &&
    fs.statSync(
      uploadedFile,
    ).size > 0,
    uploadedFile,
  );

  const publicImageResponse =
    await context.request.get(
      credentials.origin +
      uploadedUrl,
    );

  addCheck(
    "imagen-publica-http",
    publicImageResponse.status() ===
      200,
    `HTTP ${publicImageResponse.status()}`,
  );

  await page.screenshot({
    path:
      screenshotPath,
    fullPage: true,
  });

  addCheck(
    "captura-real",
    fs.existsSync(
      screenshotPath,
    ) &&
    fs.statSync(
      screenshotPath,
    ).size > 0,
    screenshotPath,
  );

  await context.close();
} catch (error) {
  failure =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(
    "QA_FUNCTIONAL_ERROR=" +
    failure,
  );
} finally {
  if (browser) {
    await browser
      .close()
      .catch(() => {});
  }

  let databaseCleanupOk =
    !serviceId;

  if (serviceId) {
    try {
      await prisma.service.delete({
        where: {
          id: serviceId,
        },
      });

      databaseCleanupOk =
        true;
    } catch {
      databaseCleanupOk =
        false;
    }
  }

  addCheck(
    "cleanup-postgres",
    databaseCleanupOk,
    serviceId
      ? `Servicio QA eliminado: ${serviceId}`
      : "No había servicio creado.",
  );

  let fileCleanupOk =
    !uploadedFile;

  if (
    uploadedFile &&
    fs.existsSync(
      uploadedFile,
    )
  ) {
    try {
      fs.rmSync(
        uploadedFile,
        {
          force: true,
        },
      );

      fileCleanupOk =
        !fs.existsSync(
          uploadedFile,
        );
    } catch {
      fileCleanupOk =
        false;
    }
  }

  addCheck(
    "cleanup-archivo",
    fileCleanupOk,
    uploadedFile ||
      "No había archivo creado.",
  );

  await prisma
    .$disconnect()
    .catch(() => {});

  const ok =
    !failure &&
    checks.length > 0 &&
    checks.every(
      (check) =>
        check.ok,
    );

  const report = {
    ok,
    evidenceKind:
      "playwright_ui_api_postgresql",
    checkedAt:
      new Date().toISOString(),
    sourceLanguage:
      "es",
    targetLanguage:
      "en",
    serviceId,
    uploadedUrl,
    requestDataKeys:
      Object.keys(
        payload?.data || {},
      ),
    persistedRecord:
      databaseRecord
        ? {
            titleEs:
              databaseRecord.titleEs,
            titleEn:
              databaseRecord.titleEn,
            descriptionEsLength:
              databaseRecord
                .descriptionEs
                ?.length || 0,
            descriptionEnLength:
              databaseRecord
                .descriptionEn
                ?.length || 0,
            imageUrl:
              databaseRecord.imageUrl,
          }
        : null,
    checks,
    screenshot:
      fs.existsSync(
        screenshotPath,
      )
        ? screenshotPath
        : null,
    failure,
  };

  fs.writeFileSync(
    reportJson,
    JSON.stringify(
      report,
      null,
      2,
    ) + "\n",
    "utf8",
  );

  fs.writeFileSync(
    reportMarkdown,
    [
      "# QA funcional del administrador rediseñado",
      "",
      `Estado: ${ok ? "APROBADO" : "FALLIDO"}`,
      "",
      "## Alcance",
      "",
      "- Login real mediante Playwright.",
      "- Carga real de imagen PNG.",
      "- Alta de servicio desde la interfaz.",
      "- Payload sin campos ingleses.",
      "- Traducción automática server-side.",
      "- Persistencia directa en PostgreSQL.",
      "- Limpieza del registro y archivo de prueba.",
      "",
      "## Comprobaciones",
      "",
      ...checks.map(
        (check) =>
          `- ${check.ok ? "OK" : "ERROR"} — ${check.name}: ${check.detail}`,
      ),
      "",
      failure
        ? `## Error\n\n${failure}\n`
        : "",
    ].join("\n"),
    "utf8",
  );

  console.log(
    "UPLOAD_REAL_OK=" +
    Number(
      checks.some(
        (check) =>
          check.name ===
            "upload-http" &&
          check.ok,
      ),
    ),
  );

  console.log(
    "SPANISH_ONLY_PAYLOAD_OK=" +
    Number(
      checks.some(
        (check) =>
          check.name ===
            "payload-solo-espanol" &&
          check.ok,
      ),
    ),
  );

  console.log(
    "TRANSLATION_PERSISTED_OK=" +
    Number(
      checks.some(
        (check) =>
          check.name ===
            "postgres-ingles-generado" &&
          check.ok,
      ),
    ),
  );

  console.log(
    "POSTGRES_VERIFIED=" +
    Number(
      checks.some(
        (check) =>
          check.name ===
            "postgres-registro" &&
          check.ok,
      ),
    ),
  );

  console.log(
    "QA_CLEANUP_OK=" +
    Number(
      databaseCleanupOk &&
      fileCleanupOk,
    ),
  );

  console.log(
    "QA_ADMIN_REDESIGN_FUNCTIONAL_OK=" +
    Number(ok),
  );

  if (!ok) {
    process.exitCode = 1;
  }
}

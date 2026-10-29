import {
  existsSync,
} from "node:fs";

import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";

import {
  createRequire,
} from "node:module";

import path from "node:path";

const openClawRoot =
  process.env.OPENCLAW_ROOT ||
  path.resolve(process.cwd(), "../../../..");

const requireFromRoot = createRequire(
  path.join(openClawRoot, "package.json"),
);

const {
  chromium,
} = requireFromRoot("playwright");

const credentialsPath = path.join(
  process.cwd(),
  "runtime",
  "ADMIN_LOCAL_CREDENTIALS.txt",
);

const reportDir = path.join(
  process.cwd(),
  "runtime",
  "qa-functional",
);

const reportJsonPath = path.join(
  reportDir,
  "admin-crud-report.json",
);

const reportMdPath = path.join(
  reportDir,
  "admin-crud-report.md",
);

const screenshotsDir = path.join(
  reportDir,
  "screenshots",
);

const OPENCLAW_QA_RUNNER_VERSION = 3;

const functionalCheckNames = [
  "login",
  "session-cookie",
  "admin-list",
  "create-service",
  "list-created-service",
  "edit-service",
  "list-updated-service",
  "deactivate-service",
  "list-inactive-service",
];

const visualCheckNames = [
  "visual-login-page",
  "visual-authenticated-admin",
  "visual-services-panel",
];

const partialEvidence = {
  serviceId: null,
  screenshots: [],
  browser: null,
};

const checks = [];

function addCheck(name, ok, detail = "") {
  checks.push({
    name,
    ok,
    detail,
  });
}

function parseEnvFile(raw) {
  const values = new Map();

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      !trimmed.includes("=")
    ) {
      continue;
    }

    const [key, ...rest] = trimmed.split("=");

    values.set(
      key.trim(),
      rest.join("=").trim(),
    );
  }

  return values;
}

function normalizeBaseUrl(rawUrl) {
  try {
    return new URL(rawUrl).origin;
  } catch {
    return rawUrl
      .replace(/\/admin\/login\/?$/, "")
      .replace(/\/+$/, "");
  }
}

async function loadCredentials() {
  const raw = await readFile(
    credentialsPath,
    "utf8",
  );

  const values = parseEnvFile(raw);

  const configuredUrl =
    process.env.QA_BASE_URL ||
    values.get("ADMIN_URL") ||
    "http://127.0.0.1:3000";

  const email =
    values.get("ADMIN_EMAIL");

  const password =
    values.get("ADMIN_PASSWORD");

  if (!email || !password) {
    throw new Error(
      `Missing ADMIN_EMAIL or ADMIN_PASSWORD in ${credentialsPath}`,
    );
  }

  const url = normalizeBaseUrl(
    configuredUrl,
  );

  return {
    url,
    adminUrl: `${url}/admin/login`,
    email,
    password,
  };
}

function cookieHeader(headers) {
  const setCookie =
    headers.get("set-cookie");

  if (!setCookie) {
    return "";
  }

  return setCookie
    .split(/,(?=[^;,]+=)/)
    .map(
      (cookie) =>
        cookie.split(";")[0].trim(),
    )
    .filter(Boolean)
    .join("; ");
}

async function requestJson(
  url,
  options = {},
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? {
            "Content-Type":
              "application/json",
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  const text =
    await response.text();

  let body = null;

  try {
    body = text
      ? JSON.parse(text)
      : null;
  } catch {
    body = {
      raw: text,
    };
  }

  return {
    response,
    body,
  };
}

function assert(
  condition,
  message,
) {
  if (!condition) {
    throw new Error(message);
  }
}

function formatHttpFailure(
  action,
  result,
) {
  return `${
    action
  } failed with HTTP ${
    result.response.status
  }. Body: ${
    JSON.stringify(
      result.body,
    )
  }`;
}

function findById(
  collection,
  id,
) {
  return Array.isArray(collection)
    ? collection.find(
        (item) => item?.id === id,
      )
    : null;
}

function relativeToWorkspace(file) {
  return path.relative(
    process.cwd(),
    file,
  );
}

function rememberScreenshot(file) {
  const relative =
    relativeToWorkspace(file);

  if (
    !partialEvidence.screenshots.includes(
      relative,
    )
  ) {
    partialEvidence.screenshots.push(
      relative,
    );
  }

  return relative;
}

function checksPassed(names) {
  return names.every((name) =>
    checks.some(
      (check) =>
        check?.name === name &&
        check.ok === true,
    ),
  );
}

function reportFailureClass(ok) {
  if (ok) {
    return "APPROVED";
  }

  if (checksPassed(functionalCheckNames)) {
    return "QA_AUTOMATION_VISUAL_CONTRACT";
  }

  return "PRODUCT_FUNCTIONAL";
}

function chromeExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  const executablePath =
    candidates.find(
      (candidate) =>
        existsSync(candidate),
    );

  if (!executablePath) {
    throw new Error(
      "No se encontró Google Chrome o Chromium para Playwright.",
    );
  }

  return executablePath;
}

async function captureVisualEvidence(
  credentials,
) {
  await rm(
    screenshotsDir,
    {
      recursive: true,
      force: true,
    },
  );

  await mkdir(
    screenshotsDir,
    {
      recursive: true,
    },
  );

  const executablePath =
    chromeExecutable();

  partialEvidence.browser = {
    engine: "chromium",
    executablePath,
    viewport: {
      width: 1440,
      height: 1000,
    },
  };

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const context =
      await browser.newContext({
        viewport: {
          width: 1440,
          height: 1000,
        },
        deviceScaleFactor: 1,
      });

    const page =
      await context.newPage();

    const loginFile = path.join(
      screenshotsDir,
      "admin-login-real.png",
    );

    const dashboardFile = path.join(
      screenshotsDir,
      "admin-overview-real.png",
    );

    const servicesFile = path.join(
      screenshotsDir,
      "admin-services-real.png",
    );

    await page.goto(
      `${credentials.url}/admin/login`,
      {
        waitUntil:
          "domcontentloaded",
        timeout: 45000,
      },
    );

    await page
      .locator('input[name="email"]')
      .waitFor({
        state: "visible",
      });

    await page.screenshot({
      path: loginFile,
      fullPage: true,
    });

    rememberScreenshot(loginFile);

    addCheck(
      "visual-login-page",
      true,
      "Captura real de /admin/login mediante Playwright.",
    );

    await page
      .locator('input[name="email"]')
      .fill(credentials.email);

    await page
      .locator('input[name="password"]')
      .fill(credentials.password);

    await Promise.all([
      page.waitForURL(
        (url) =>
          url.pathname === "/admin",
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

    await page.screenshot({
      path: dashboardFile,
      fullPage: true,
    });

    rememberScreenshot(dashboardFile);

    addCheck(
      "visual-authenticated-admin",
      true,
      "Login visual real y entorno autenticado en /admin.",
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
        "heading",
        {
          name: "Servicios",
          exact: true,
          level: 1,
        },
      )
      .waitFor({
        state: "visible",
        timeout: 30000,
      });

    await page.screenshot({
      path: servicesFile,
      fullPage: true,
    });

    rememberScreenshot(servicesFile);

    addCheck(
      "visual-services-panel",
      true,
      "Captura real de la sección Servicios del panel.",
    );

    return {
      screenshots: [
        loginFile,
        dashboardFile,
        servicesFile,
      ].map((file) =>
        relativeToWorkspace(file),
      ),
      browser: partialEvidence.browser,
    };
  } finally {
    await browser.close();
  }
}

async function writeReport({
  ok,
  credentials,
  serviceId = null,
  error = null,
  screenshots = [],
  browser = null,
  pending = [],
}) {
  await mkdir(
    reportDir,
    {
      recursive: true,
    },
  );

  const functionalChecksPassed =
    checksPassed(functionalCheckNames);

  const visualChecksPassed =
    checksPassed(visualCheckNames);

  const report = {
    runnerVersion:
      OPENCLAW_QA_RUNNER_VERSION,
    ok,
    estado:
      ok ? "OK" : "ERROR",
    failureClass:
      reportFailureClass(ok),
    functionalChecksPassed,
    visualChecksPassed,
    evidenceKind:
      "playwright_real_browser",
    baseUrl:
      credentials?.url ?? null,
    adminUrl:
      credentials?.adminUrl ?? null,
    checks,
    checked:
      checks.map(
        (check) => check.name,
      ),
    pending,
    serviceId:
      serviceId ??
      partialEvidence.serviceId,
    screenshots:
      screenshots.length > 0
        ? screenshots
        : partialEvidence.screenshots,
    browser:
      browser ??
      partialEvidence.browser,
    error: error
      ? (
          error instanceof Error
            ? error.message
            : String(error)
        )
      : null,
    generatedAt:
      new Date().toISOString(),
  };

  await writeFile(
    reportJsonPath,
    `${
      JSON.stringify(
        report,
        null,
        2,
      )
    }\n`,
    "utf8",
  );

  await writeFile(
    reportMdPath,
    [
      "# QA funcional admin CRUD",
      "",
      `Estado: ${
        ok ? "OK" : "ERROR"
      }`,
      "",
      "Evidencia: Playwright con navegador real",
      `API base: ${
        report.baseUrl ?? "N/D"
      }`,
      `Admin URL: ${
        report.adminUrl ?? "N/D"
      }`,
      `Servicio validado: ${
        report.serviceId ?? "N/D"
      }`,
      "",
      "## Checks",
      ...checks.map(
        (check) =>
          `- ${
            check.ok
              ? "OK"
              : "ERROR"
          } ${check.name}${
            check.detail
              ? `: ${check.detail}`
              : ""
          }`,
      ),
      "",
      "## Capturas reales",
      ...report.screenshots.map(
        (file) => `- ${file}`,
      ),
      "",
      "## Pendientes",
      ...(pending.length
        ? pending.map(
            (item) => `- ${item}`,
          )
        : ["- ninguno"]),
      "",
    ].join("\n"),
    "utf8",
  );

  return report;
}

async function main() {
  const credentials =
    await loadCredentials();

  const stamp = Date.now();

  const createdTitle =
    `QA Servicio ${stamp}`;

  const updatedTitle =
    `QA Servicio Editado ${stamp}`;

  const login =
    await requestJson(
      `${credentials.url}/api/auth/login`,
      {
        method: "POST",
        body: JSON.stringify({
          email:
            credentials.email,
          password:
            credentials.password,
        }),
      },
    );

  assert(
    login.response.status === 200,
    formatHttpFailure(
      "Login",
      login,
    ),
  );

  assert(
    login.body?.ok === true,
    "Login response did not return ok=true",
  );

  addCheck(
    "login",
    true,
    "POST /api/auth/login respondió 200.",
  );

  const cookies =
    cookieHeader(
      login.response.headers,
    );

  assert(
    cookies.length > 0,
    "Login did not return a session cookie",
  );

  addCheck(
    "session-cookie",
    true,
    "Set-Cookie recibido.",
  );

  const authHeaders = {
    Cookie: cookies,
  };

  const initialList =
    await requestJson(
      `${credentials.url}/api/admin/content`,
      {
        headers: authHeaders,
      },
    );

  assert(
    initialList.response.status === 200,
    formatHttpFailure(
      "Admin list",
      initialList,
    ),
  );

  assert(
    initialList.body?.ok === true,
    "Admin list did not return ok=true",
  );

  addCheck(
    "admin-list",
    true,
    "GET /api/admin/content respondió 200.",
  );

  const create =
    await requestJson(
      `${credentials.url}/api/admin/content`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          resource: "service",
          data: {
            titleEs:
              createdTitle,
            descriptionEs:
              "Servicio creado por QA funcional automatizado.",
            sortOrder: 999,
            status:
              "PUBLISHED",
          },
        }),
      },
    );

  assert(
    create.response.status === 200,
    formatHttpFailure(
      "Create service",
      create,
    ),
  );

  assert(
    create.body?.ok === true,
    "Create response did not return ok=true",
  );

  assert(
    typeof create.body?.id ===
      "string" &&
      create.body.id.length > 0,
    "Create response missing top-level id",
  );

  assert(
    create.body?.resource?.id ===
      create.body.id,
    "Create response missing matching resource.id",
  );

  const serviceId =
    create.body.id;

  partialEvidence.serviceId =
    serviceId;

  addCheck(
    "create-service",
    true,
    "Servicio creado correctamente.",
  );

  const afterCreate =
    await requestJson(
      `${credentials.url}/api/admin/content`,
      {
        headers: authHeaders,
      },
    );

  assert(
    findById(
      afterCreate.body?.data?.services,
      serviceId,
    ),
    "Created service did not appear in admin list",
  );

  addCheck(
    "list-created-service",
    true,
    "El servicio creado aparece en el listado.",
  );

  const update =
    await requestJson(
      `${credentials.url}/api/admin/content`,
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          resource: "service",
          id: serviceId,
          data: {
            titleEs:
              updatedTitle,
            descriptionEs:
              "Servicio editado por QA funcional automatizado.",
            sortOrder: 998,
            status:
              "PUBLISHED",
          },
        }),
      },
    );

  assert(
    update.response.status === 200,
    formatHttpFailure(
      "Update service",
      update,
    ),
  );

  assert(
    update.body?.ok === true,
    "Update response did not return ok=true",
  );

  assert(
    update.body?.resource?.titleEs ===
      updatedTitle,
    "Update response did not return updated service",
  );

  addCheck(
    "edit-service",
    true,
    "Servicio editado correctamente.",
  );

  const afterUpdate =
    await requestJson(
      `${credentials.url}/api/admin/content`,
      {
        headers: authHeaders,
      },
    );

  const updated = findById(
    afterUpdate.body?.data?.services,
    serviceId,
  );

  assert(
    updated?.titleEs ===
      updatedTitle,
    "Admin list did not include updated service title",
  );

  addCheck(
    "list-updated-service",
    true,
    "El servicio editado aparece actualizado.",
  );

  const deactivate =
    await requestJson(
      `${credentials.url}/api/admin/content`,
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          resource: "service",
          id: serviceId,
          data: {
            status:
              "INACTIVE",
          },
        }),
      },
    );

  assert(
    deactivate.response.status === 200,
    formatHttpFailure(
      "Deactivate service",
      deactivate,
    ),
  );

  assert(
    deactivate.body?.ok === true,
    "Deactivate response did not return ok=true",
  );

  addCheck(
    "deactivate-service",
    true,
    "Servicio inhabilitado mediante actualización parcial.",
  );

  const afterDeactivate =
    await requestJson(
      `${credentials.url}/api/admin/content`,
      {
        headers: authHeaders,
      },
    );

  const inactive = findById(
    afterDeactivate.body?.data?.services,
    serviceId,
  );

  assert(
    inactive?.status ===
      "INACTIVE",
    "Inactive service did not appear with status INACTIVE",
  );

  addCheck(
    "list-inactive-service",
    true,
    "El servicio inhabilitado conserva estado INACTIVE.",
  );

  const visual =
    await captureVisualEvidence(
      credentials,
    );

  const report =
    await writeReport({
      ok: true,
      credentials,
      serviceId,
      screenshots:
        visual.screenshots,
      browser:
        visual.browser,
      pending: [],
    });

  console.log(
    JSON.stringify(
      {
        ok: true,
        evidenceKind:
          report.evidenceKind,
        checks:
          checks.map(
            (check) =>
              check.name,
          ),
        serviceId,
        report:
          path.relative(
            process.cwd(),
            reportJsonPath,
          ),
        markdown:
          path.relative(
            process.cwd(),
            reportMdPath,
          ),
        screenshots:
          report.screenshots,
      },
      null,
      2,
    ),
  );
}

main().catch(
  async (error) => {
    let credentials = null;

    try {
      credentials =
        await loadCredentials();
    } catch {
      credentials = null;
    }

    await writeReport({
      ok: false,
      credentials,
      error,
      serviceId:
        partialEvidence.serviceId,
      screenshots:
        partialEvidence.screenshots,
      browser:
        partialEvidence.browser,
      pending: [
        error instanceof Error
          ? error.message
          : String(error),
      ],
    }).catch(() => {});

    console.error(
      JSON.stringify(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
          report:
            path.relative(
              process.cwd(),
              reportJsonPath,
            ),
        },
        null,
        2,
      ),
    );

    process.exitCode = 1;
  },
);



import { createSign } from "node:crypto";

type CommitmentRow = Record<string, unknown>;

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable");
  }

  const credentials = JSON.parse(raw);

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Google service account JSON is missing required fields");
  }

  return credentials;
}

function createJwt(credentials: {
  client_email: string;
  private_key: string;
  token_uri?: string;
}) {
  const now = Math.floor(Date.now() / 1000);

  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  const header = encode({ alg: "RS256", typ: "JWT" });
  const payload = encode({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: credentials.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  });

  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(credentials.private_key)
    .toString("base64url");

  return `${unsignedToken}.${signature}`;
}

async function getAccessToken(): Promise<string> {
  const credentials = getCredentials();
  const jwt = createJwt(credentials);

  const response = await fetch(
    credentials.token_uri || "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      `Google authentication failed: ${JSON.stringify(result)}`
    );
  }

  return result.access_token as string;
}

export async function appendCommitmentToSheet(
  commitment: CommitmentRow
) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SPREADSHEET_ID environment variable");
  }

  const accessToken = await getAccessToken();
  const range = `'${sheetName.replace(/'/g, "''")}'!A:Z`;
  const baseUrl =
    `https://sheets.googleapis.com/v4/spreadsheets/` +
    `${encodeURIComponent(spreadsheetId)}/values/`;

  
const headers = [
  "Commitment ID",
  "Created At",
  "Person / Commitment Owner",
  "Target Deadline",
  "Commitment Deliverable",
  "Current Progress & Status",
  "Stated Blocker or Impediment",
  "Dependent Tasks & Downstream Stakes",
  "Risk Score",
  "Risk Level",
  "AI Analysis",
];
  
  const request = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${JSON.stringify(body)}`);
    }

    return body;
  };

  const current = await request(
    `${baseUrl}${encodeURIComponent(range)}`
  );

  if (!current.values || current.values.length === 0) {
    await request(
      `${baseUrl}${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: [headers] }),
      }
    );
  }

  const get = (key: string, fallback = "") => {
    const value = commitment[key];
    if (value === undefined || value === null) return fallback;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const row = [
  get("commitmentId", get("id")),
  new Date().toISOString(),
  get("person"),
  get("deadline"),
  get("commitment", get("description")),
  get("progress"),
  get("blocker"),
  get("dependencies"),
  get("riskScore"),
  get("riskLevel"),
  get("analysis"),
];

  const result = await request(
    `${baseUrl}${encodeURIComponent(range)}:append` +
      `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [row] }),
    }
  );

  console.log(
    "Google Sheets row saved:",
    result.updates?.updatedRange
  );

  return {
    success: true,
    updatedRange: result.updates?.updatedRange,
  };
}

import { describe, expect, it } from "vitest";
import { isSensitivePath, redactSensitiveText } from "../src/security.js";

describe("isSensitivePath", () => {
  it("flags dotenv files at the root and in subdirectories", () => {
    expect(isSensitivePath(".env")).toBe(true);
    expect(isSensitivePath(".env.local")).toBe(true);
    expect(isSensitivePath(".env.production")).toBe(true);
    expect(isSensitivePath("packages/api/.env")).toBe(true);
    expect(isSensitivePath("packages/api/.env.test")).toBe(true);
  });

  it("flags credential and key directories", () => {
    expect(isSensitivePath(".npmrc")).toBe(true);
    expect(isSensitivePath("home/.npmrc")).toBe(true);
    expect(isSensitivePath(".aws/credentials")).toBe(true);
    expect(isSensitivePath("home/user/.aws/config")).toBe(true);
    expect(isSensitivePath(".ssh/id_rsa")).toBe(true);
    expect(isSensitivePath(".gnupg/secring.gpg")).toBe(true);
  });

  it("flags ssh-style private key filenames", () => {
    expect(isSensitivePath("id_rsa")).toBe(true);
    expect(isSensitivePath("id_ed25519")).toBe(true);
    expect(isSensitivePath("home/user/id_ecdsa")).toBe(true);
  });

  it("flags certificate and key file extensions", () => {
    expect(isSensitivePath("server.pem")).toBe(true);
    expect(isSensitivePath("private.key")).toBe(true);
    expect(isSensitivePath("client.p12")).toBe(true);
    expect(isSensitivePath("certificate.pfx")).toBe(true);
    expect(isSensitivePath("certs/SERVER.PEM")).toBe(true);
  });

  it("does not flag ordinary source files", () => {
    expect(isSensitivePath("src/cli.ts")).toBe(false);
    expect(isSensitivePath("README.md")).toBe(false);
    expect(isSensitivePath("package.json")).toBe(false);
    expect(isSensitivePath("tests/cli.test.ts")).toBe(false);
    expect(isSensitivePath("src/security.ts")).toBe(false);
  });

  it("does not flag filenames that merely start with env or key as a substring", () => {
    expect(isSensitivePath("env.ts")).toBe(false);
    expect(isSensitivePath("environment.md")).toBe(false);
    expect(isSensitivePath("keyboard.ts")).toBe(false);
  });
});

describe("redactSensitiveText", () => {
  it("redacts BEGIN/END private key blocks", () => {
    const input = [
      "-----BEGIN RSA PRIVATE KEY-----",
      "MIIEowIBAAKCAQEAxxxxxxxxxxxxxxxxxx",
      "-----END RSA PRIVATE KEY-----",
    ].join("\n");

    const output = redactSensitiveText(input);
    expect(output).toBe("[REDACTED PRIVATE KEY BLOCK]");
  });

  it("redacts a single-line ec private key block", () => {
    const input =
      "prefix -----BEGIN EC PRIVATE KEY-----abc-----END EC PRIVATE KEY----- suffix";
    expect(redactSensitiveText(input)).toBe("prefix [REDACTED PRIVATE KEY BLOCK] suffix");
  });

  it("redacts prefixed secret assignments while preserving the variable name", () => {
    const samples = [
      ["GITHUB_TOKEN=ghp_abcdef0123456789", "GITHUB_TOKEN=[REDACTED]"],
      ["MY_API_KEY=sk-live-12345", "MY_API_KEY=[REDACTED]"],
      ["AWS_SECRET=hunter2", "AWS_SECRET=[REDACTED]"],
      ["DB_PASSWORD = supersecret", "DB_PASSWORD=[REDACTED]"],
      ["MY_PASS=letmein", "MY_PASS=[REDACTED]"],
      ["AWS_ACCESS_KEY=AKIA...", "AWS_ACCESS_KEY=[REDACTED]"],
      ["AWS_PRIVATE_KEY=value", "AWS_PRIVATE_KEY=[REDACTED]"],
      ["MY_DATABASE_URL=postgres://u:p@host/db", "MY_DATABASE_URL=[REDACTED]"],
      ["SENTRY_DSN=https://abc@sentry.io/1", "SENTRY_DSN=[REDACTED]"],
    ] as const;

    for (const [input, expected] of samples) {
      expect(redactSensitiveText(input)).toBe(expected);
    }
  });

  it("redacts standalone API_KEY assignments", () => {
    expect(redactSensitiveText("API_KEY=sk-live-12345")).toBe("API_KEY=[REDACTED]");
    expect(redactSensitiveText("API-KEY=sk-live-12345")).toBe("API-KEY=[REDACTED]");
  });

  it("redacts standalone DATABASE_URL and DSN assignments", () => {
    expect(redactSensitiveText("DATABASE_URL=postgres://u:p@host/db")).toBe(
      "DATABASE_URL=[REDACTED]",
    );
    expect(redactSensitiveText("DSN=https://abc@sentry.io/1")).toBe("DSN=[REDACTED]");
  });

  it("redacts standalone PRIVATE_KEY and ACCESS_KEY assignments", () => {
    expect(redactSensitiveText("PRIVATE_KEY=value")).toBe("PRIVATE_KEY=[REDACTED]");
    expect(redactSensitiveText("ACCESS_KEY=AKIA...")).toBe("ACCESS_KEY=[REDACTED]");
    expect(redactSensitiveText("PRIVATE-KEY=value")).toBe("PRIVATE-KEY=[REDACTED]");
  });

  it("redacts standalone TOKEN, SECRET, PASSWORD, and PASS assignments", () => {
    expect(redactSensitiveText("TOKEN=abc123")).toBe("TOKEN=[REDACTED]");
    expect(redactSensitiveText("SECRET=hunter2")).toBe("SECRET=[REDACTED]");
    expect(redactSensitiveText("PASSWORD=letmein")).toBe("PASSWORD=[REDACTED]");
    expect(redactSensitiveText("PASS=letmein")).toBe("PASS=[REDACTED]");
  });

  it("does not redact lowercase or unrelated assignments", () => {
    expect(redactSensitiveText("name=david")).toBe("name=david");
    expect(redactSensitiveText("FOO=bar")).toBe("FOO=bar");
    expect(redactSensitiveText("MY_TOKEN_NAME_DESCRIPTION ok")).toBe(
      "MY_TOKEN_NAME_DESCRIPTION ok",
    );
  });

  it("redacts bearer tokens of length >= 12 only", () => {
    expect(redactSensitiveText("Authorization: Bearer abcdef1234567890")).toBe(
      "Authorization: Bearer [REDACTED]",
    );
    expect(redactSensitiveText("Bearer short")).toBe("Bearer short");
  });

  it("redacts inline credentials in URLs", () => {
    expect(redactSensitiveText("clone https://alice:secret@example.com/repo.git")).toBe(
      "clone https://[REDACTED]@example.com/repo.git",
    );
    expect(redactSensitiveText("http://u:p@host/path")).toBe("http://[REDACTED]@host/path");
  });

  it("does not touch URLs without credentials", () => {
    expect(redactSensitiveText("https://example.com/path?token=public")).toBe(
      "https://example.com/path?token=public",
    );
  });

  it("redacts multiple distinct findings in the same text", () => {
    const input = [
      "GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx",
      "Authorization: Bearer aaaaaaaaaaaaaaaa",
      "git clone https://u:p@host/x.git",
    ].join("\n");

    const output = redactSensitiveText(input);
    expect(output).toContain("GITHUB_TOKEN=[REDACTED]");
    expect(output).toContain("Bearer [REDACTED]");
    expect(output).toContain("https://[REDACTED]@host/x.git");
  });
});

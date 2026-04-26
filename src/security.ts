const SENSITIVE_PATH_PATTERNS = [
  /(^|\/)\.env(\..+)?$/i,
  /(^|\/)\.npmrc$/i,
  /(^|\/)\.aws\//i,
  /(^|\/)\.ssh\//i,
  /(^|\/)\.gnupg\//i,
  /(^|\/)id_[a-z0-9._-]+$/i,
  /\.(?:pem|key|p12|pfx)$/i,
];

const SECRET_ASSIGNMENT_RE =
  /\b((?:[A-Z][A-Z0-9_]*)?(?:TOKEN|SECRET|PASSWORD|PASS|API[_-]?KEY|PRIVATE[_-]?KEY|ACCESS[_-]?KEY|DATABASE_URL|DSN))\s*=\s*([^\n]+)/g;
const PRIVATE_KEY_BLOCK_RE =
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;
const BEARER_TOKEN_RE = /\bBearer\s+[A-Za-z0-9._-]{12,}\b/g;
const URL_CREDENTIALS_RE = /(https?:\/\/)([^/\s:@]+):([^@\s]+)@/g;

export function isSensitivePath(pathLike: string): boolean {
  return SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(pathLike));
}

export function redactSensitiveText(text: string): string {
  return text
    .replace(PRIVATE_KEY_BLOCK_RE, "[REDACTED PRIVATE KEY BLOCK]")
    .replace(SECRET_ASSIGNMENT_RE, (_full, key) => `${key}=[REDACTED]`)
    .replace(BEARER_TOKEN_RE, "Bearer [REDACTED]")
    .replace(URL_CREDENTIALS_RE, "$1[REDACTED]@");
}

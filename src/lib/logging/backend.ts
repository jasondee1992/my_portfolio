import "server-only";

export type LoggingBackend = "sqlite" | "dynamodb";

function getExplicitLoggingBackend() {
  const value = process.env.LOG_STORAGE_BACKEND?.trim().toLowerCase();

  if (value === "sqlite" || value === "dynamodb") {
    return value;
  }

  return null;
}

export function getLoggingBackend(): LoggingBackend {
  const explicitBackend = getExplicitLoggingBackend();

  if (explicitBackend) {
    return explicitBackend;
  }

  return process.env.NODE_ENV === "production" ? "dynamodb" : "sqlite";
}

export function isSqliteLoggingBackend() {
  return getLoggingBackend() === "sqlite";
}

export function isDynamoDbLoggingBackend() {
  return getLoggingBackend() === "dynamodb";
}

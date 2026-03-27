import "server-only";
import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  type ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

export class LoggingStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoggingStorageError";
  }
}

type LoggingConfig = {
  region: string;
  chatLogsTableName: string;
  siteVisitsTableName: string;
};

let documentClient: DynamoDBDocumentClient | null = null;

function toRequiredEnvValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new LoggingStorageError(`Missing required logging environment variable: ${name}.`);
  }

  return value;
}

export function getLoggingConfig(): LoggingConfig {
  return {
    region: toRequiredEnvValue("DYNAMODB_REGION"),
    chatLogsTableName: toRequiredEnvValue("DYNAMODB_CHAT_LOGS_TABLE"),
    siteVisitsTableName: toRequiredEnvValue("DYNAMODB_SITE_VISITS_TABLE"),
  };
}

function getDocumentClient() {
  if (documentClient) {
    return documentClient;
  }

  const { region } = getLoggingConfig();
  documentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region,
    }),
    {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    }
  );

  return documentClient;
}

export function createLogId() {
  return randomUUID();
}

export function createTimestamp() {
  return new Date().toISOString();
}

export function toNullableText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof LoggingStorageError) {
    return error.message;
  }

  const errorName = typeof error === "object" && error ? "name" in error ? error.name : "" : "";
  const errorMessage =
    typeof error === "object" && error && "message" in error ? String(error.message) : String(error);
  const normalizedMessage = errorMessage.toLowerCase();

  if (
    errorName === "CredentialsProviderError" ||
    normalizedMessage.includes("could not load credentials") ||
    normalizedMessage.includes("credential") ||
    normalizedMessage.includes("access key id") ||
    normalizedMessage.includes("security token")
  ) {
    return "DynamoDB credentials are not available. Configure local AWS credentials before using logging locally.";
  }

  return errorMessage;
}

export function toLoggingStorageError(error: unknown, context: string) {
  const normalizedMessage = normalizeErrorMessage(error);
  return new LoggingStorageError(`${context} ${normalizedMessage}`.trim());
}

export async function putItem(tableName: string, item: Record<string, unknown>) {
  const client = getDocumentClient();
  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    })
  );
}

export async function scanAllItems<T>(input: ScanCommandInput) {
  const client = getDocumentClient();
  const items: T[] = [];
  let exclusiveStartKey = input.ExclusiveStartKey;

  do {
    const response = await client.send(
      new ScanCommand({
        ...input,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    items.push(...((response.Items as T[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items;
}

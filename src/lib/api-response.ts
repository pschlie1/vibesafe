import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "CONFLICT"
  | "BAD_REQUEST"
  | string;

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorEnvelope {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail[];
    request_id: string;
  };
}

export interface ApiSuccessEnvelope<T> {
  data: T;
}

function getRequestId(): string {
  return crypto.randomUUID();
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  details?: ApiErrorDetail[],
  status = 400,
  responseHeaders?: Record<string, string>,
): NextResponse<ApiErrorEnvelope> {
  const body: ApiErrorEnvelope = {
    error: {
      code,
      message,
      request_id: getRequestId(),
      ...(details && details.length > 0 ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status, headers: responseHeaders });
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessEnvelope<T>> {
  return NextResponse.json({ data }, { status });
}

/**
 * Map Zod fieldErrors into ApiErrorDetail[]
 */
export function zodFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): ApiErrorDetail[] {
  return Object.entries(fieldErrors).flatMap(([field, messages]) =>
    (messages ?? []).map((message) => ({ field, message })),
  );
}

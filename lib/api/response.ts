import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[]>
) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status }
  );
}

export function unauthorized(message = "Unauthorized") {
  return apiError("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden") {
  return apiError("FORBIDDEN", message, 403);
}

export function notFound(message = "Not found") {
  return apiError("NOT_FOUND", message, 404);
}

export function validationError(details: Record<string, string[]>) {
  return apiError("VALIDATION_ERROR", "Validation failed", 422, details);
}

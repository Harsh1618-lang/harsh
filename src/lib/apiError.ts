import { NextResponse } from "next/server";

// Centralised error responder for API route handlers.
//
// Why this exists: every route was doing `NextResponse.json({ error: error.message }, { status: 500 })`
// directly. That leaks internal details to the client on any unexpected
// failure — raw Postgres error text (table/column names, constraint names),
// file-system paths, stack-adjacent messages, third-party SDK internals,
// etc. None of that should ever reach a browser response.
//
// This function logs the REAL error server-side (so debugging still works
// via server/host logs) and returns a generic, safe message to the client.
// Expected/validation errors (400s) that routes construct themselves are
// unaffected — this is only for the catch-all 500 case.
export function apiError(error: unknown, context: string, status = 500) {
  console.error(`[API error] ${context}:`, error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again shortly." },
    { status }
  );
}

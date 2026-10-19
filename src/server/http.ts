import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

export async function handle(work: () => Promise<unknown>) {
  try {
    return NextResponse.json(await work());
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message, ...error.details }, { status: error.status });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    if (error instanceof Error && (error.message === "UNAUTHENTICATED" || error.message === "FORBIDDEN")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "FORBIDDEN" ? 403 : 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "SERVER" }, { status: 500 });
  }
}

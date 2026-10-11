import {loginSchema,type LoginSchema,type AuthResponse,authResponseSchema,} from "@speako/common/common";
import { env } from "@/lib/env";

const API_URL = env.API_URL;

export async function login(
  input: LoginSchema
): Promise<AuthResponse> {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const validatedInput = loginSchema.parse(input);

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(validatedInput),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Login failed";

    throw new Error(message);
  }

  return authResponseSchema.parse(data);
}

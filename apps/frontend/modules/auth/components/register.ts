import { registerSchema,type RegisterSchema,authResponseSchema, type AuthResponse } from "@speako/common/common";
import { env } from "@/lib/env";

const API_URL = env.API_URL;

export async function register(
  input: RegisterSchema
): Promise<AuthResponse> {
   if (!API_URL) {
    throw new Error("API URL is not configured.");
  }
  const validatedInput = registerSchema.parse(input);

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(validatedInput),
  });

  const data: unknown = await response.json().catch(() => null);

 if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Registration failed.";

    throw new Error(message);
  }


  return authResponseSchema.parse(data);
}

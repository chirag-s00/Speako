
import "server-only";
import { cookies } from "next/headers";
import { env } from "./env";

const API_URL = env.API_URL;

export async function getCurrentUser() {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");

  if (!tokenCookie) {
    return null;
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      Cookie: `token=${tokenCookie.value}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to validate authentication");
  }

  const data = await response.json();

  return data.user;
}

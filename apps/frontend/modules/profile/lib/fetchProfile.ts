import {
  profileResponseSchema,
  type Profile,
} from "@speako/common/common";

import { env } from "@/lib/env";

const API_URL = env.API_URL;

export async function getProfile(): Promise<Profile> {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Please log in to view your profile.");
    }

    throw new Error("Failed to load your profile.");
  }

  const data: unknown = await response.json();

  const parsed = profileResponseSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Invalid profile response:", parsed.error);
    throw new Error("The server returned invalid profile data.");
  }

  return parsed.data.user;
}
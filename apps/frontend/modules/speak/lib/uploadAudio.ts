import { api } from "@/lib/api";
import { env } from "@/lib/env";
import type { drillResponse } from "@speako/common/common";

const API_URL = env.API_URL;

export async function submitDrill(
  audioBlob: Blob,
  mode: "practice" | "interview",
  prompt: string,
  durationSec: number,
): Promise<drillResponse> {
  const key = await uploadAudio(audioBlob);

  const response = await api.post<drillResponse>("/api/drills", {
    key,
    mode,
    prompt,
    durationSec,
  });

  return response.data;
}

export async function uploadAudio(audioBlob: Blob): Promise<string> {
  const contentType = audioBlob.type.split(";")[0];

  const response = await fetch(`${API_URL}/uploads/presigned-url`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: audioBlob.type,
      size: audioBlob.size,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not obtain an upload URL.");
  }

  const { uploadUrl, key } = (await response.json()) as {
    uploadUrl: string;
    key: string;
  };

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: audioBlob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Could not upload the audio to S3.");
  }

  return key;
}
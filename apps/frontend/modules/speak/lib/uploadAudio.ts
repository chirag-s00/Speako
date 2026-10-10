const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadAudio(audioBlob: Blob): Promise<string> {
  const contentType = audioBlob.type.split(";")[0];

  const response = await fetch(`${API_URL}/uploads/presigned-url`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: audioBlob.type, size: audioBlob.size }),
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
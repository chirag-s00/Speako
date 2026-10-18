"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { submitDrill } from "@/modules/speak/lib/uploadAudio";
import type { Mode } from "@/modules/speak/constants";

type SubmitArgs = {
  blob: Blob;
  mode: Mode;
  promptText: string;
  seconds: number;
};

export function useDrillSubmission() {
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clear = useCallback((): void => {
    setUploadedKey(null);
    setUploadError(null);
  }, []);

  const submit = useCallback(
    async ({ blob, mode, promptText, seconds }: SubmitArgs): Promise<void> => {
      if (isUploading || uploadedKey) return;

      setIsUploading(true);
      setUploadError(null);

      try {
        const response = await submitDrill(
          blob,
          mode === "drills" ? "practice" : "interview",
          promptText,
          seconds,
        );

        setUploadedKey(response.jobId);
        router.push(`/jobs/${response.jobId}`);
      } catch (error) {
        console.error("Drill submission failed:", error);
        setUploadError("Failed to submit drill. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [isUploading, uploadedKey, router],
  );

  return { isUploading, uploadedKey, uploadError, submit, clear };
}
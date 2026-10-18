import { useCallback, useEffect, useRef, useState } from "react";

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function getErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError") {
      return "Microphone access was blocked. Allow it in your browser settings and try again.";
    }
    if (err.name === "NotFoundError") {
      return "No microphone was found. Connect one and try again.";
    }
  }
  return err instanceof Error
    ? err.message
    : "Could not access your microphone.";
}

export function useAudioRecorder(maxDuration = 90) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStartingRef = useRef(false);
  const mountedRef = useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Detach handlers first so a late `onstop` can't set state or leak a URL.
  const detachRecorder = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorder.ondataavailable = null;
    recorder.onstop = null;
    recorder.onerror = null;
    if (recorder.state !== "inactive") recorder.stop();
    recorderRef.current = null;
  }, []);

  const stop = useCallback(() => {
    stopTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    setIsRecording(false);
  }, [stopTimer]);

  const start = useCallback(async () => {
    // Blocks double-clicks while the permission prompt is open.
    if (isStartingRef.current || recorderRef.current) return;
    isStartingRef.current = true;
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("Audio recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Unmounted while the permission prompt was open.
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];
      elapsedRef.current = 0;
      setElapsed(0);
      setAudioBlob(null);

      const mimeType = MIME_TYPES.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const type =
          recorder.mimeType ||
          chunksRef.current.find((chunk) => chunk.type)?.type ||
          "application/octet-stream";

        setAudioBlob(new Blob(chunksRef.current, { type }));
        recorderRef.current = null;
        cleanupStream();
      };

      recorder.onerror = () => {
        detachRecorder();
        stopTimer();
        cleanupStream();
        setIsRecording(false);
        setError("Recording failed. Please try again.");
      };

      recorder.start(1000);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= maxDuration) stop();
      }, 1000);
    } catch (err) {
      stopTimer();
      cleanupStream();
      recorderRef.current = null;
      setError(getErrorMessage(err));
    } finally {
      isStartingRef.current = false;
    }
  }, [maxDuration, stop, stopTimer, cleanupStream, detachRecorder]);

  const reset = useCallback(() => {
    stopTimer();
    detachRecorder();
    cleanupStream();
    chunksRef.current = [];
    elapsedRef.current = 0;
    setIsRecording(false);
    setElapsed(0);
    setAudioBlob(null);
    setError(null);
  }, [stopTimer, detachRecorder, cleanupStream]);

  // The object URL is derived from the blob, and always revoked on change or unmount.
  useEffect(() => {
    if (!audioBlob) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopTimer();
      detachRecorder();
      cleanupStream();
    };
  }, [stopTimer, detachRecorder, cleanupStream]);

  return { isRecording, elapsed, audioBlob, audioUrl, error, start, stop, reset };
}

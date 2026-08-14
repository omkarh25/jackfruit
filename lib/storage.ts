import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

const UPLOAD_TIMEOUT_MS = 120_000;

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error("Upload timed out. Please try again."));
    }, UPLOAD_TIMEOUT_MS);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress?.(progress);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
      () => {
        clearTimeout(timeout);
        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
      }
    );
  });
}

export async function deleteFileByUrl(url: string): Promise<void> {
  const storage = getFirebaseStorage();
  // Extract path from download URL is tricky; for simplicity,
  // we store the path separately in Firestore and delete by path.
  // This function accepts a full gs:// or https URL and attempts deletion.
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // ignore errors
  }
}

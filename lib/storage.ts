import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

export async function uploadFile(file: File, path: string): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
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

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();
const coursesCollection = "courses";

export interface CourseModule {
  title: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  title: string;
  duration: string;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
}

export interface CourseRecord {
  id?: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  price: string;
  lessons: number;
  modules?: CourseModule[];
  outcomes: string[];
  isPublished: boolean;
  imageGradient?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function createCourse(
  data: Omit<CourseRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, coursesCollection), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCourseById(id: string): Promise<CourseRecord | null> {
  const snap = await getDoc(doc(db, coursesCollection, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as CourseRecord) : null;
}

export async function getCourseBySlug(slug: string): Promise<CourseRecord | null> {
  const q = query(collection(db, coursesCollection), where("slug", "==", slug));
  const snap = await getDocs(q);
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as CourseRecord);
}

export async function updateCourse(
  id: string,
  data: Partial<Omit<CourseRecord, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, coursesCollection, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, coursesCollection, id));
}

export async function getAllCourses(): Promise<CourseRecord[]> {
  const snap = await getDocs(collection(db, coursesCollection));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseRecord);
}

export async function getPublishedCourses(): Promise<CourseRecord[]> {
  const q = query(collection(db, coursesCollection), where("isPublished", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseRecord);
}

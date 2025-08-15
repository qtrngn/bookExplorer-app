import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore/lite";

const BOOKS = "@MyBooks:books";

const normalizeBook = (b = {}) => ({
  id: b.id,
  title: b.title || b.volumeInfo?.title || "Untitled",
  authors: b.authors || b.volumeInfo?.authors || ["Unknown Author"],
  thumbnail:
    b.thumbnail ||
    b.imageLinks?.thumbnail ||
    b.volumeInfo?.imageLinks?.thumbnail ||
    null,
  description: b.description || b.volumeInfo?.description || "",
});

const favsCol = (uid) => collection(db, "users", uid, "favorites");
const favDoc  = (uid, id) => doc(db, "users", uid, "favorites", id);

export const getFavorites = async () => {
  const uid = auth.currentUser?.uid;
  try {
    if (!uid) {
      const raw = await AsyncStorage.getItem(BOOKS);
      const list = raw ? JSON.parse(raw) : [];
      return list.map(normalizeBook);
    }
    const snap = await getDocs(query(favsCol(uid), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => normalizeBook({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("[Favorites] getFavorites failed:", e);
    return [];
  }
};

export const addFavorite = async (book) => {
  const uid = auth.currentUser?.uid;
  const clean = normalizeBook(book);
  if (!clean.id) throw new Error("Book is missing an id");

  try {
    if (!uid) {
      const existing = await getFavorites();
      if (!existing.some((f) => f.id === clean.id)) {
        const updated = [...existing, clean];
        await AsyncStorage.setItem(BOOKS, JSON.stringify(updated));
        return updated;
      }
      return existing;
    }

    await setDoc(
      favDoc(uid, clean.id),
      { ...clean, createdAt: Date.now() },  
      { merge: true }
    );
    return getFavorites();
  } catch (e) {
    console.error("[Favorites] addFavorite failed:", e);
    throw e;
  }
};

export const removeFavorite = async (id) => {
  const uid = auth.currentUser?.uid;
  try {
    if (!uid) {
      const existing = await getFavorites();
      const updated = existing.filter((b) => b.id !== id);
      await AsyncStorage.setItem(BOOKS, JSON.stringify(updated));
      return updated;
    }
    await deleteDoc(favDoc(uid, id));
    return getFavorites();
  } catch (e) {
    console.error("[Favorites] removeFavorite failed:", e);
    return getFavorites();
  }
};

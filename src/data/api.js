// api/books.js
import axios from "axios";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = "AIzaSyA5-31sFipctPDBmK1o51Q2itdj2GLjeoY";

// One axios client with the key applied everywhere
const client = axios.create({
  baseURL: BASE_URL,
  params: { key: API_KEY },
});

// Request only what we need (smaller/faster)
const FIELDS_LIST =
  "items(id,volumeInfo(title,authors,description,publishedDate,language,pageCount,imageLinks,previewLink,infoLink,canonicalVolumeLink),accessInfo(webReaderLink))";

const FIELDS_DETAIL =
  "id,volumeInfo(title,authors,description,publishedDate,language,pageCount,imageLinks,previewLink,infoLink,canonicalVolumeLink),accessInfo(webReaderLink)";

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;?/g, " ").trim();
}

function pickThumb(links = {}) {
  return (
    links.extraLarge ||
    links.large ||
    links.medium ||
    links.small ||
    links.thumbnail ||
    links.smallThumbnail ||
    null
  );
}

function normalizeVolume(item = {}) {
  const v = item.volumeInfo || {};
  const a = item.accessInfo || {};

  const out = {
    id: item.id || "",
    title: v.title || "Untitled",
    authors: v.authors || [],
    description: stripHtml(v.description || ""),
    publishedDate: v.publishedDate || "",
    language: (v.language || "").toUpperCase(),
    pageCount: v.pageCount ?? null,
    thumbnail: pickThumb(v.imageLinks || {}),
    // links
    webReaderLink: a.webReaderLink || null,
    previewLink: v.previewLink || null,
    infoLink: v.infoLink || null,
    canonicalVolumeLink: v.canonicalVolumeLink || null,
    // computed shortcut
    readerLink:
      a.webReaderLink ||
      v.previewLink ||
      v.infoLink ||
      v.canonicalVolumeLink ||
      null,
    // keep raw imageLinks if you need variations later
    imageLinks: v.imageLinks || undefined,
  };

  return out;
}

// ---------- public API ----------
export const searchBooks = async (query) => {
  try {
    const { data } = await client.get("/", {
      params: {
        q: query,
        printType: "books",
        maxResults: 20,
        orderBy: "relevance",
        fields: FIELDS_LIST,
      },
    });
    return (data.items || []).map(normalizeVolume);
  } catch (error) {
    console.error("Cannot fetch data:", error);
    return [];
  }
};

export const getPopularBooks = async () => {
  try {
    const { data } = await client.get("/", {
      params: {
        q: "subject:general",
        printType: "books",
        maxResults: 10,
        orderBy: "relevance",
        fields: FIELDS_LIST,
      },
    });
    return (data.items || []).map(normalizeVolume);
  } catch (error) {
    console.error("Cannot fetch popular books:", error);
    return [];
  }
};

export const getBooksByCategory = async (categoryQuery) => {
  if (typeof categoryQuery !== "string" || !categoryQuery.trim()) {
    console.error("Invalid category query:", categoryQuery);
    return [];
  }
  try {
    const { data } = await client.get("/", {
      params: {
        q: categoryQuery, // e.g., "subject:fiction"
        maxResults: 10,
        orderBy: "relevance",
        printType: "books",
        fields: FIELDS_LIST,
      },
    });
    return (data.items || []).map(normalizeVolume);
  } catch (error) {
    console.error("Category books error:", error);
    return [];
  }
};

// Hydrate a single book (detail page) and keep the same normalized shape
export const getBookDetails = async (id, base = null) => {
  try {
    const { data } = await client.get(`/${encodeURIComponent(id)}`, {
      params: { fields: FIELDS_DETAIL },
    });
    const normalized = normalizeVolume(data);
    // If you passed a base item (from list/favorites), merge it in
    return { ...base, ...normalized, id: normalized.id || (base?.id || id) };
  } catch (error) {
    console.error("Cannot fetch book detail:", error);
    // Fallback to whatever we already had
    return base || null;
  }
};

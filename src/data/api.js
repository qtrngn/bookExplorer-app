import axios from "axios";

// Base endpoint for Google Book Apis
const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = "AIzaSyA5-31sFipctPDBmK1o51Q2itdj2GLjeoY";

// create a [re-configure axios so all request hit the same baseURL and include the API key.
const client = axios.create({
  baseURL: BASE_URL,
  params: { key: API_KEY },
});

// Ask Google Books APIs only return these fields
const FIELDS_LIST =
  "items(id,volumeInfo(title,authors,description,publishedDate,language,pageCount,imageLinks,previewLink,infoLink,canonicalVolumeLink),accessInfo(webReaderLink))";

const FIELDS_DETAIL =
  "id,volumeInfo(title,authors,description,publishedDate,language,pageCount,imageLinks,previewLink,infoLink,canonicalVolumeLink),accessInfo(webReaderLink)";

  // Remove basic HTML tags and breaking spaces from API descriptions.
function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;?/g, " ").trim();
}

// Choose the best available thumbnail 
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

// Normalize Google's item into UI friendly shape
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
    webReaderLink: a.webReaderLink || null,
    previewLink: v.previewLink || null,
    infoLink: v.infoLink || null,
    canonicalVolumeLink: v.canonicalVolumeLink || null,
    readerLink:
      a.webReaderLink ||
      v.previewLink ||
      v.infoLink ||
      v.canonicalVolumeLink ||
      null,
    imageLinks: v.imageLinks || undefined,
  };

  return out;
}

// Search books 
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

// get the popular books list 
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


// Show books by category
export const getBooksByCategory = async (categoryQuery) => {
  if (typeof categoryQuery !== "string" || !categoryQuery.trim()) {
    console.error("Invalid category query:", categoryQuery);
    return [];
  }
  try {
    const { data } = await client.get("/", {
      params: {
        q: categoryQuery, 
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

// Show books detail
export const getBookDetails = async (id, base = null) => {
  try {
    const { data } = await client.get(`/${encodeURIComponent(id)}`, {
      params: { fields: FIELDS_DETAIL },
    });
    const normalized = normalizeVolume(data);
    return { ...base, ...normalized, id: normalized.id || (base?.id || id) };
  } catch (error) {
    console.error("Cannot fetch book detail:", error);
    return base || null;
  }
};

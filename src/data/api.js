import axios from "axios";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = "AIzaSyA5-31sFipctPDBmK1o51Q2itdj2GLjeoY";

export const searchBooks = async (query) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: query,
        maxResults: 20,
        printType: "books",
      },
    });
    return response.data.items || [];
  } catch (error) {
    console.error("Cannot fetch data:", error);
    return [];
  }
};

// Get popular books and display it on the homepage
export const getPopularBooks = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: "subject:general",
        maxResults: 10,
        orderBy: "relevance",
        printType: "books",
        key: API_KEY
      },
    });
    return response.data.items || [];
  } catch (error) {
    console.error("Cannot fetch popular books:", error);
    return [];
  }
};

// get book detail
export const getBookDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`, {
      params: {
        key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error("Cannot fetch book detail: ", error);
    return null;
  }
};

// get book by categories
export const getBooksByCategory = async (categoryQuery) => {
  if (typeof categoryQuery !== 'string' || !categoryQuery.trim())  {
    console.error('Invalid category query:', categoryQuery)
  return [];
  }
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: categoryQuery,
        maxResults: 10,
        orderBy: 'relevance',
        key: API_KEY
      }
    });
    return response.data.items || [];
  } catch (error) {
    console.error ('Category books error:', error);
    return [];
  }
}
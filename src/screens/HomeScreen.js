import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getFavorites, preloadSampleBooks } from "../data/storage";
import { getPopularBooks, getBooksByCategory, searchBooks } from "../data/api";
import BookCard from "../components/BookCard";
import categories from "../data/categories";

const HomeScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("fiction");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const favs = await getFavorites();
        setFavorites(favs);

        await preloadSampleBooks();

        const popular = await getPopularBooks();
        setPopularBooks(popular);

        await loadCategoryBooks("fiction");
      } catch (error) {
        console.error("Data loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

//   this showcases 10 books for each category when user click the category filter
  const loadCategoryBooks = async (categoryId) => {
    setCategoryLoading(true);
    try {
      const category = categories.find((c) => c.id === categoryId);
      if (!category || !category.query) {
        console.error("Category undefined:", categoryId);
        return;
      }

      setSelectedCategory(categoryId);

      let books = [];
      if (categoryId === "other") {
        const allBooks = await getBooksByCategory("books");
        books = allBooks
          .filter((book) => {
            const subjects = book.volumeInfo.categories || [];
            return !subjects.some((subject) =>
              categories
                .filter((c) => c.id !== "other")
                .some((cat) =>
                  subject.toLowerCase().includes(cat.name.toLowerCase())
                )
            );
          })
          .slice(0, 10);
      } else {
        books = await getBooksByCategory(category.query);
      }
      setCategoryBooks(books);
    } catch (error) {
      console.error("Category load error:", error);
    } finally {
      setCategoryLoading(false);
    }
  };

// show 4 books from the favorite list on the home page
  const filteredFavorites = favorites
    .filter(
      (book) =>
        (book.title?.toLowerCase() || "").includes(filter.toLowerCase()) ||
        (book.authors?.join(" ")?.toLowerCase() || "").includes(filter.toLowerCase())
    )
    .slice(0, 4);

// Search books, it also shows if the searching book is in the favorite list 
  const handleSearch = async () => {
    if (filter.trim() === "") return;
    try {
      const books = await searchBooks(filter);
      setSearchResults(books);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    }
  };

  const viewAllFavorites = () => {
    navigation.navigate("Favorites");
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => loadCategoryBooks(item.id)}
    >
      <Text style={styles.categoryHolder}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
// render book information 
  const renderBookItem = (bookItem) => {
    const book = {
      id: bookItem.id,
      title: bookItem.volumeInfo.title,
      authors: bookItem.volumeInfo.authors || ["Unknown"],
      thumbnail: bookItem.volumeInfo.imageLinks?.thumbnail,
      categories: bookItem.volumeInfo.categories || ["Uncategorized"],
    };

    return (
      <BookCard
        book={book}
        onPress={() =>
          navigation.navigate("BookDetail", {
            book: {
              ...book,
              description: bookItem.volumeInfo.description,
            },
          })
        }
      />
    );
  };

//   render the category book list 
  const renderCategoryBooks = () => {
    if (categoryLoading) {
      return <ActivityIndicator size="small" />;
    } else if (categoryBooks.length > 0) {
      return (
        <FlatList
          horizontal
          data={categoryBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderBookItem(item)}
          contentContainerStyle={styles.listContent}
          showsHorizontalScrollIndicator={false}
        />
      );
    } else {
      return (
        <Text style={styles.emptyText}>No books found in this category</Text>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          value={filter}
          onChangeText={setFilter}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

    {/* display search result  */}
      {searchResults.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            horizontal
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard
                book={{
                  id: item.id,
                  title: item.volumeInfo.title,
                  authors: item.volumeInfo.authors || ["Unknown"],
                  thumbnail: item.volumeInfo.imageLinks?.thumbnail,
                  categories: item.volumeInfo.categories || [],
                }}
                onPress={() =>
                  navigation.navigate("BookDetail", {
                    book: {
                      id: item.id,
                      title: item.volumeInfo.title,
                      authors: item.volumeInfo.authors || ["Unknown"],
                      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
                      categories: item.volumeInfo.categories || [],
                      description: item.volumeInfo.description,
                    },
                  })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Favorites</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={viewAllFavorites}
          >
            <Text style={styles.viewAllButtonText}>View All</Text>
          </TouchableOpacity>
        </View>
      {/* display favorite list */}
        {filteredFavorites.length > 0 ? (
          <FlatList
            horizontal
            data={filteredFavorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={() =>
                  navigation.navigate("BookDetail", { book: item })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            No favorites found. Try to add some books!
          </Text>
        )}
      </View>
{/* display category section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoriesContainer}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {categories.find((c) => c.id === selectedCategory)?.name} Books
          </Text>
        </View>
        {renderCategoryBooks()}
      </View>
{/* display popular book section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Books</Text>
        {popularBooks.length > 0 ? (
          <FlatList
            horizontal
            data={popularBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderBookItem(item)}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.emptyText}>Could not load popular books</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  viewAllButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 12,
  },
  favoriteCard: {
    width: 180,
    marginRight: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 16,
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryButton: {
    padding: 12,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: "#6200ee",
  },
  categoryHolder: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
  },
  selectedCategoryText: {
    color: "white",
  },
});

export default HomeScreen;

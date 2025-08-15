import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase";
import { useFocusEffect } from "@react-navigation/native";
import { getFavorites } from "../data/storage";
import { getPopularBooks, getBooksByCategory, searchBooks } from "../data/api";
import BookCard from "../components/BookCard";
import categories from "../data/categories";

export default function HomeScreen({ navigation }) {

  const [favorites, setFavorites] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("fiction");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Signin users will display the name on the header, if user is not signed in, it will display "you" instead 
  const userName =
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split("@")[0] ||
    "You";

  // Load favorites whenever user return to homescreen 
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const fav = await getFavorites();
          if (isActive) setFavorites(fav);
        } catch (err) {
          console.error("Error loading favorites:", err);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Load popular list and default category 
  useEffect(() => {
    (async () => {
      try {
        const popular = await getPopularBooks();
        setPopularBooks(popular);
        await loadCategoryBooks("fiction");
      } catch (err) {
        console.error("Data loading error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch books for a category
  const loadCategoryBooks = async (categoryId) => {
    setCategoryLoading(true);
    try {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat?.query) throw new Error("Invalid category");
      setSelectedCategory(categoryId);

      let books = [];
      if (categoryId === "other") {
        const all = await getBooksByCategory("books");
        books = all
          .filter((b) => {
            const subjects = b.volumeInfo.categories || [];
            return !subjects.some((s) =>
              categories
                .filter((c) => c.id !== "other")
                .some((c2) => s.toLowerCase().includes(c2.name.toLowerCase()))
            );
          })
          .slice(0, 10);
      } else {
        books = await getBooksByCategory(cat.query);
      }
      setCategoryBooks(books);
    } catch (err) {
      console.error("Category load error:", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Top-4 filtered favorites 
  const filteredFavorites = favorites
    .filter(
      (book) =>
        book.title.toLowerCase().includes(filter.toLowerCase()) ||
        book.authors.join(" ").toLowerCase().includes(filter.toLowerCase())
    )
    .slice(0, 4);

  // Show search result while searching
  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        if (showSearch && filter.trim()) {
          const books = await searchBooks(filter.trim());
          if (isActive) setSearchResults(books);
        } else {
          setSearchResults([]);
        }
      } catch {
        if (isActive) setSearchResults([]);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [filter, showSearch]);

  // Navigate to Favorites screen 
  const viewAllFavorites = () => navigation.navigate("Favorites");

  //  Render categories list 
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
        style={
          selectedCategory === item.id
            ? styles.selectedCategoryText
            : styles.categoryText
        }
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render books
  const renderBookItem = (b) => {
    const book = {
   id: b?.id,
   title: b?.title ?? b?.volumeInfo?.title ?? "Untitled",
   authors: b?.authors ?? b?.volumeInfo?.authors ?? ["Unknown"],
     thumbnail:
       b?.thumbnail ??
       b?.imageLinks?.thumbnail ??
       b?.volumeInfo?.imageLinks?.thumbnail ??
      null,
    categories: b?.categories ?? b?.volumeInfo?.categories ?? [],
     description: b?.description ?? b?.volumeInfo?.description ?? "",
   };
   return (
     <BookCard
       book={book}
      onPress={() => navigation.navigate("BookDetail", { book })}
     />
  );
}

// render category books
  const renderCategoryBooks = () =>
    categoryLoading ? (
      <ActivityIndicator size="small" />
    ) : categoryBooks.length > 0 ? (
      <FlatList
        horizontal
        data={categoryBooks}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => renderBookItem(item)}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
      />
    ) : (
      <Text style={styles.emptyText}>No books in this category</Text>
    );

  // Loading spinner 
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  //  The screen background
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#654d27", "#f2e6d4"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero and search icon */}
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greeting}>Hello, {userName}!</Text>
              <Text style={styles.subheading}>What are you reading today?</Text>
            </View>
            <TouchableOpacity onPress={() => setShowSearch(true)}>
              <Ionicons name="search" size={28} color="#c3b095ff" />
            </TouchableOpacity>
          </View>

          {/* Search input */}
          {showSearch && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search books..."
                value={filter}
                onChangeText={setFilter}
                autoFocus
                onBlur={() => setShowSearch(false)}
              />
            </View>
          )}

          {/* Search results */}
          {showSearch && searchResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <FlatList
                horizontal
                data={searchResults}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => renderBookItem(item)}
                contentContainerStyle={styles.listContent}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* No results message */}
          {showSearch &&
            filter.trim().length > 0 &&
            searchResults.length === 0 && (
              <Text style={styles.noBooksText}>No books available</Text>
            )}

          {/* Favorites Card  */}
          <View style={styles.featuredCard}>
            <Text style={styles.featuredTitle}>Your Favorite Books 🎉</Text>

            {filteredFavorites.length > 0 ? (
              <>
                <Text style={styles.featuredSubtitle}>
                  You’ve got {filteredFavorites.length} awesome{" "}
                  {filteredFavorites.length === 1 ? "pick" : "picks"} waiting!
                </Text>
                <FlatList
                  horizontal
                  data={filteredFavorites}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.favCardWrapper}>
                      <BookCard
                        book={item} 
                        onPress={() =>
                          navigation.navigate("BookDetail", { book: item })
                        }
                      />
                    </View>
                  )}
                  contentContainerStyle={styles.favListContent}
                  showsHorizontalScrollIndicator={false}
                />
              </>
            ) : (
              <Text style={styles.featuredSubtitle}>
                Your shelf is empty… Time to add some books! 📚
              </Text>
            )}

            <TouchableOpacity
              style={styles.readNowBtn}
              onPress={viewAllFavorites}
            >
              <Text style={styles.readNowText}>
                {filteredFavorites.length > 0
                  ? "Your Favorite List"
                  : "Browse Books"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Browse Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(i) => i.id}
              renderItem={renderCategory}
              contentContainerStyle={styles.categoriesContainer}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/*  Category Books  */}
          <View style={styles.section}>{renderCategoryBooks()}</View>

          {/*Popular Books */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular</Text>
            {popularBooks.length > 0 ? (
              <FlatList
                horizontal
                data={popularBooks}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => renderBookItem(item)}
                contentContainerStyle={styles.listContent}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <Text style={styles.emptyText}>Could not load popular books</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
  },

  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 26,
  },
  greeting: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
  },
  subheading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },

  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },

  noBooksText: {
    textAlign: "center",
    color: "#fff",
    marginBottom: 24,
    fontStyle: "italic",
  },

  featuredCard: {
    backgroundColor: "#e5ff6f",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: "fff",
    marginBottom: 12,
  },
  favListContent: {
    paddingVertical: 8,
  },
  favCardWrapper: {
    marginRight: 12,
  },
  readNowBtn: {
    backgroundColor: "#654d27",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  readNowText: {
    color: "#fff",
    fontWeight: "bold",
  },

  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#654d27",
  },

  listContent: {
    paddingBottom: 12,
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
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#dfef6d",
    borderRadius: 30,
  },
  selectedCategory: {
    backgroundColor: "#654d27",
  },
  categoryHolder: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontWeight: 800,
    marginRight: 4,
  },
  selectedCategoryText: {
    color: "#dfef6d",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
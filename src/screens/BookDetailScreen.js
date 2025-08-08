import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Button,
  Alert
} from 'react-native';
import { addFavorite, getFavorites } from '../data/storage';

const BookDetailScreen = ({ route }) => {
  const { book } = route.params;
  const [isSaved, setIsSaved] = useState(false);

   const thumb =
    book?.thumbnail ||
    book?.imageLinks?.thumbnail ||
    book?.volumeInfo?.imageLinks?.thumbnail ||
    null;

  useEffect(() => {
    const checkSaved = async () => {
      const favs = await getFavorites();
      const exists = favs.some(fav => fav.id === book.id);
      setIsSaved(exists);
    };
    checkSaved();
  }, []);

  const handleSave = async () => {
    await addFavorite(book);
    Alert.alert('Saved!', `${book.title} has been added to your favorites.`);
    setIsSaved(true);
  };

  return (
    <ScrollView style={styles.container}>
        {!!thumb && (
        <Image source={{ uri: thumb }} style={styles.thumbnail} />
      )}
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>
        by {book.authors?.join(', ') || 'Unknown Author'}
      </Text>

      <View style={styles.section}>
        {!isSaved ? (
          <Button title="Add to Favorites" onPress={handleSave} />
        ) : (
          <Text style={{ textAlign: 'center', color: '#4caf50' }}>
            ✅ Already in favorites
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {book.description || 'No description available.'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  thumbnail: {
    width: 200,
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default BookDetailScreen;

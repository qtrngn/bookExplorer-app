import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const BookCard = ({ book, onPress }) => {

  const title = book.title || book.volumeInfo?.title;
  const authors = book.authors || book.volumeInfo?.authors || [];
  const thumbnail = book.thumbnail || book.volumeInfo?.imageLinks?.thumbnail;
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {thumbnail ? (
        <>
          <Image
            source={{ uri: thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.overlay}
          />
        </>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="book-outline" size={40} color="#654d27" />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {authors.length > 0 ? authors.join(', ') : 'Unknown Author'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 220,
    marginRight: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  info: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  author: {
    color: '#ddd',
    fontSize: 12,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f2e6d4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});

export default BookCard;
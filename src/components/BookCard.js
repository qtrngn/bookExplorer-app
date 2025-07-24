import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const BookCard = ({ book, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image 
        source={{ uri: book.thumbnail }} 
        style={styles.thumbnail} 
      />
      <View style={styles.info}> 
        <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.authors?.join(', ') || 'Unknown Author'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: 15,
    marginBottom: 15,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  info: {
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#666',
  }
});

export default BookCard;
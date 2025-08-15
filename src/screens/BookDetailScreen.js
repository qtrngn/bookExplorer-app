import { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { addFavorite, getFavorites } from '../data/storage';
import { getBookDetails } from '../data/api'; 

const THEME = {
  bg: '#f2e6d4',
  surface: '#fff',
  text: '#654d27',
  muted: '#6b6b6b',
  primary: '#654d27',
  highlight: '#dfef6d',
  border: '#eee',
  radius: 20,
};

export default function BookDetailScreen({ route, navigation }) {
  const base = route?.params?.book ?? {};
  const [bookFull, setBookFull] = useState(base);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(true);

  // Hide header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

// Fetch extra detail by ID
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!base?.id) return;
        const data = await getBookDetails(base.id, base);
        if (alive && data) setBookFull(data);
      } finally {
        if (alive) setLoadingExtra(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [base?.id]);

  // Check if this book is already in favorites
  useEffect(() => {
    (async () => {
      const favs = (await getFavorites()) || [];
      const id = base?.id || bookFull?.id;
      setIsSaved(!!id && favs.some((f) => f.id === id));
    })();
  }, [base?.id, bookFull?.id]);

  // Ensure that there are safe fallbacks
  const title =
    bookFull?.title ??
    base?.title ??
    base?.volumeInfo?.title ??
    'Untitled';

  const authors =
    bookFull?.authors ??
    base?.authors ??
    base?.volumeInfo?.authors ??
    ['Unknown'];

  const description =
    bookFull?.description ??
    base?.description ??
    base?.volumeInfo?.description ??
    'No description available.';

  const thumb =
    bookFull?.thumbnail ??
    base?.thumbnail ??
    base?.imageLinks?.thumbnail ??
    base?.volumeInfo?.imageLinks?.thumbnail ??
    null;

  const publishedDate =
    bookFull?.publishedDate ??
    base?.publishedDate ??
    base?.volumeInfo?.publishedDate ??
    '';

  const language =
    (bookFull?.language ??
      base?.language ??
      base?.volumeInfo?.language ??
      '')
      .toUpperCase();

  const pages =
    bookFull?.pageCount ??
    base?.pageCount ??
    base?.volumeInfo?.pageCount ??
    null;

    // Preview link, I added this but never tested it because I use android simulator, I will get back to it late 
  const readerLink =
    bookFull?.readerLink ??
    bookFull?.webReaderLink ??
    bookFull?.previewLink ??
    bookFull?.infoLink ??
    bookFull?.canonicalVolumeLink ??
    null;

    // Save to favorite
  const handleSave = async () => {
    const toSave = { ...base, ...bookFull };
    await addFavorite(toSave);
    setIsSaved(true);
    Alert.alert('Saved!', `${title} has been added to your favorites.`);
  };

  // Open preview if it is available
  const openReader = async () => {
    if (!readerLink) return;
    const can = await Linking.canOpenURL(readerLink);
    if (can) Linking.openURL(readerLink);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: THEME.bg }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Close */}
      <Pressable
        onPress={navigation.goBack}
        style={styles.closeBtn}
        hitSlop={12}
      >
        <Text style={styles.closeTxt}>✕</Text>
      </Pressable>

      {/* Hero */}
      <View style={styles.hero}>
        {!!thumb && (
          <View style={styles.coverWrap}>
            <Image source={{ uri: thumb }} style={styles.cover} />
          </View>
        )}

        <Text style={styles.heroTitle}>{title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {(authors[0]?.[0] || '?').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.authorName}>{authors[0]}</Text>
          {!!publishedDate && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{publishedDate}</Text>
            </>
          )}
        </View>

        {/* Chips */}
        <View style={styles.chipsRow}>
          {!!publishedDate && <Chip>{publishedDate}</Chip>}
          {!!language && <Chip>{language}</Chip>}
          {!!pages && <Chip>{pages} pages</Chip>}
        </View>

        {/* Button */}
        <View style={styles.ctaRow}>
          {readerLink ? (
            <Pressable
              disabled={loadingExtra}
              onPress={openReader}
              style={[
                styles.ctaBtn,
                {
                  backgroundColor: THEME.highlight,
                  opacity: loadingExtra ? 0.6 : 1,
                },
              ]}
            >
              <Text style={[styles.ctaTxt, { color: THEME.primary }]}>
                Read Preview
              </Text>
            </Pressable>
          ) : null}

          {!isSaved ? (
            <Pressable
              style={[styles.ctaBtn, { backgroundColor: '#fff' }]}
              onPress={handleSave}
            >
              <Text style={[styles.ctaTxt, { color: THEME.primary }]}>
                ♡ Favorite
              </Text>
            </Pressable>
          ) : (
            <View
              style={[
                styles.ctaBtn,
                { backgroundColor: 'rgba(223,239,109,0.25)' },
              ]}
            >
              <Text style={[styles.ctaTxt, { color: THEME.highlight }]}>
                ✓ In favorites
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </ScrollView>
  );
}

function Chip({ children }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.txt}>{children}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  txt: {
    color: '#fff',
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },

  hero: {
    backgroundColor: THEME.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: THEME.radius,
    borderBottomRightRadius: THEME.radius,
  },

  coverWrap: {
    alignSelf: 'center',
    padding: 8,
    borderRadius: THEME.radius,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 16,
  },
  cover: {
    width: 180,
    height: 180,
    borderRadius: THEME.radius,
    backgroundColor: '#00000010',
  },

  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    color: THEME.primary,
    fontWeight: '700',
  },
  authorName: {
    color: '#fff',
    fontWeight: '600',
  },
  dot: {
    color: 'rgba(255,255,255,0.6)',
  },
  metaText: {
    color: 'rgba(255,255,255,0.8)',
  },

  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.radius,
  },
  ctaTxt: {
    fontWeight: '700',
  },

  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: THEME.text,
    fontSize: 15,
    lineHeight: 22,
  },
});

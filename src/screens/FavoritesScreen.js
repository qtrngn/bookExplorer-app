import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  PanResponder,
} from "react-native";
import { getFavorites, removeFavorite } from "../data/storage";

const THEME = {
  bg: "#f2e6d4",
  surface: "#fff",
  text: "#654d27",
  muted: "#666",
  primary: "#654d27",
  highlight: "#dfef6d",
  border: "#eee",
  radius: 20,
};

const SWIPE_WIDTH = 96;      // width of the red delete area
const SWIPE_THRESHOLD = 64;  // how far to trigger delete on release

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadFavorites);
    return unsub;
  }, [navigation, loadFavorites]);

  const handleRemove = async (id) => {
    const updated = await removeFavorite(id);
    setFavorites(updated || []);
  };

  const renderItem = ({ item }) => {
    const thumb =
      item?.thumbnail ||
      item?.imageLinks?.thumbnail ||
      item?.volumeInfo?.imageLinks?.thumbnail;

    return (
      <SwipeRow
        onDelete={() => handleRemove(item.id)}
        rightWidth={SWIPE_WIDTH}
        threshold={SWIPE_THRESHOLD}
      >
        <Pressable
          onPress={() => navigation.navigate("BookDetail", { book: item })}
          style={({ pressed }) => [styles.card, { opacity: pressed ? 0.96 : 1 }]}
        >
          {thumb ? (
            <Image source={{ uri: thumb }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]} />
          )}

          <View style={styles.info}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>
              {item?.title || "Untitled"}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.author}>
              {(item?.authors || ["Unknown"]).join(", ")}
            </Text>
          </View>
        </Pressable>
      </SwipeRow>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: THEME.muted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h1}>Favorites</Text>
        <Text style={styles.count}>{favorites.length}</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={[styles.center, { padding: 24 }]}>
          <Text style={{ color: THEME.muted }}>
            Add some books to your favorite list ♥
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          numColumns={1}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
        />
      )}
    </View>
  );
}

// I asked chat-gpt to help me with this delete swiping 
function SwipeRow({ children, onDelete, rightWidth = 96, threshold = 64 }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy), // horizontal intent
      onPanResponderMove: (_, { dx }) => {
        // clamp to the left, max reveal = -rightWidth
        if (dx <= 0) {
          translateX.setValue(Math.max(dx, -rightWidth));
        } else {
          translateX.setValue(dx * 0.15); // tiny stretch to the right
        }
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const shouldDelete = dx < -threshold || vx < -0.8;
        if (shouldDelete) {
          // snap open to show Delete, then call onDelete
          Animated.timing(translateX, {
            toValue: -rightWidth,
            duration: 120,
            useNativeDriver: true,
          }).start(() => {
            // small delay so the user sees it "commit"
            setTimeout(() => onDelete?.(), 50);
            // optionally: snap back after delete on next frame
            translateX.setValue(0);
          });
        } else {
          // snap back closed
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <View style={{}}>
   
      <View
        pointerEvents="box-none"
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.deleteContainer}>
          <Pressable onPress={onDelete} style={styles.deleteAction}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>

     
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    paddingHorizontal: 26,
    paddingTop: 70,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  h1: { fontSize: 22, fontWeight: "700", color: THEME.text },
  count: {
    fontSize: 20,
    color: THEME.text,
    backgroundColor: THEME.highlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.radius,
  },

  card: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: THEME.border,
    borderRadius: THEME.radius,
    padding: 10,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 120,
    height: 180,
    borderRadius: THEME.radius,
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  thumbFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: THEME.border,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.text,
    flexShrink: 1,
  },
  author: { fontSize: 13, color: THEME.muted, flexShrink: 1 },

  // Right-side delete UI (behind the row)
  deleteContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 16,
  },
  deleteAction: {
    width: SWIPE_WIDTH,
    height: 200,
    borderRadius: THEME.radius,
    backgroundColor: "#E11D48", 
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: { 
    color: "#fff", 
    fontWeight: "700" 
  },

  center: { 
    justifyContent: "center", 
    alignItems: "center", 
    flex: 1 
  },
});

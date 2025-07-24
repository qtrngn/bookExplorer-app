import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, Text } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import BookDetailScreen from "./src/screens/BookDetailScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#6200ee",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: "Book Explorer",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Favorites")}
              >
                <Text style={{ fontSize: 20, marginRight: 16 }}>❤️</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: "Favorites " }}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={({ route }) => ({
            title: route.params?.book?.title || "Book Details",
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
import "./src/firebase";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTab from "./src/components/BottomTab";
import BookDetailScreen from "./src/screens/BookDetailScreen";
import SignInScreen from "./src/screens/SigninScreen";
import { AuthProvider } from "./src/AuthProvider";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BottomTab">
          {/* Bottom tabs flow */}
          <Stack.Screen
            name="BottomTab"
            component={BottomTab}
            options={{ headerShown: false }}
          />

          {/* Book detail shows default dark header */}
          <Stack.Screen
            name="BookDetail"
            component={BookDetailScreen}
            options={({ route }) => ({
              title: route.params?.book?.title || "Book Details",
            })}
          />

          <Stack.Screen name="SignIn" component={SignInScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

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
         
          <Stack.Screen
            name="BottomTab"
            component={BottomTab}
            options={{ headerShown: false }}
          />
        
          <Stack.Screen
            name="BookDetail"
            component={BookDetailScreen}
          />

          <Stack.Screen name="SignIn" component={SignInScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

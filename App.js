import "./src/firebase";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTab from "./src/components/BottomTab";
import BookDetailScreen from "./src/screens/BookDetailScreen";
import SignInScreen from "./src/screens/SigninScreen";
import SignUpScreen from "./src/screens/SignupScreen";
import { AuthProvider, useAuth } from "./src/AuthProvider";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTab" component={BottomTab} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthGate />
      </NavigationContainer>
    </AuthProvider>
  );


  function AuthGate() {
    const { user, loaded } = useAuth();
    if (!loaded) return null; 
    return user ? <AppStack /> : <AuthStack />;
  }
}

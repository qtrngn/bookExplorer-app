import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Header from "../components/Header";
import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import SignIn from "../screens/SigninScreen"

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => <Header title={route.name} />,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,

        tabBarIcon: ({ focused }) => {
          let IconComp, iconName;

          if (route.name === "Home") {
            IconComp = Ionicons;
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Favorites") {
            IconComp = MaterialIcons;
            iconName = focused ? "favorite" : "favorite-border";
          } else {
            IconComp = Ionicons;
            iconName = focused ? "person" : "person-outline";
          }
          return (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <IconComp
                name={iconName}
                size={30}
                color={focused ? "#4f3713" : "#bfac8c"}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={SignIn} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 25,
    height: 70,
    marginLeft: 75,
    width: 280,
    borderRadius: 40,
    backgroundColor: "#4f3713",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 0,   
  },
  iconWrapper: {
    width: 60,
    height: 60,
    marginTop: 5,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
  },
  iconWrapperActive: {
    backgroundColor: "#654d27ff",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
});

export default BottomTab;

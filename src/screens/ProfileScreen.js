import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

import { auth } from "../firebase";
import { updateProfile, sendPasswordResetEmail, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const THEME = {
  bg: "#f2e6d4",
  text: "#654d27",
  primary: "#654d27",
  highlight: "#dfef6d",
  surface: "#fff",
  radius: 20,
};

export default function ProfileScreen() {
  const navigation = useNavigation();

  const user = auth.currentUser;
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initial = useMemo(() => {
    const base = (displayName || user?.email || "U").trim();
    return (base[0] || "U").toUpperCase();
  }, [displayName, user?.email]);

  useEffect(() => {
    setPhotoURL(user?.photoURL || "");
    setDisplayName(user?.displayName || "");
  }, [user?.photoURL, user?.displayName]);

  const pickAndUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: "images", 
      });
      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri || !user?.uid) return;

      setUploading(true);
      const storage = getStorage();
      const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
      const resp = await fetch(uri);
      const blob = await resp.blob();

      await uploadBytes(avatarRef, blob, { contentType: "image/jpeg" });
      const url = await getDownloadURL(avatarRef);

      await updateProfile(user, { photoURL: url });
      setPhotoURL(url);
      Alert.alert("Updated", "Profile photo changed.");
    } catch (e) {
      console.warn("Avatar update failed:", e);
      Alert.alert("Upload failed", "Could not change your photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      Alert.alert("No email", "This account doesn't have an email address.");
      return;
    }
    try {
      setResetting(true);
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("Email sent", "Check your inbox for the reset link.");
    } catch (e) {
      Alert.alert("Couldn’t send reset email", "Please try again later.");
    } finally {
      setResetting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
    } catch {
      Alert.alert("Sign out failed", "Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: THEME.bg }}>
      {/* HERO */}
      <View style={styles.hero}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={pickAndUpload}
          disabled={uploading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}

          {/* Camera button */}
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={pickAndUpload}
            disabled={uploading}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#654d27" />
            ) : (
              <Ionicons name="camera" size={18} color={THEME.primary} />
            )}
          </TouchableOpacity>
        </TouchableOpacity>

        <Text style={styles.nameText}>{displayName || "Your Profile"}</Text>
        {!!user?.email && <Text style={styles.emailText}>{user.email}</Text>}
      </View>

      {/* Reset password */}
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={resetting}
          style={[styles.btn, { backgroundColor: "#fff" }, resetting && { opacity: 0.7 }]}
        >
          <Ionicons name="key-outline" size={18} color={THEME.primary} />
          <Text style={[styles.btnTxt, { color: THEME.primary }]}>
            {resetting ? "Sending reset email…" : "Reset password"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          disabled={signingOut}
          style={[styles.btn, { backgroundColor: THEME.primary }, signingOut && { opacity: 0.7 }]}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={[styles.btnTxt, { color: "#fff" }]}>
            {signingOut ? "Signing out…" : "Sign out"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const AVATAR_SIZE = 120;

const styles = StyleSheet.create({
  hero: {
    backgroundColor: THEME.primary,
    paddingTop: 42,
    paddingBottom: 18,
    alignItems: "center",
    borderBottomLeftRadius: THEME.radius,
    borderBottomRightRadius: THEME.radius,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: THEME.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: AVATAR_SIZE / 2 },
  avatarFallback: {
    backgroundColor: "rgba(223,239,109,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: THEME.highlight, fontSize: 40, fontWeight: "800" },
  cameraBtn: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.highlight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
  },
  nameText: { color: THEME.highlight, fontWeight: "800", fontSize: 28, marginTop: 10 },
  emailText: { color: "rgba(255,255,255,0.9)", marginTop: 2 },

  card: {
    backgroundColor: THEME.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: THEME.radius,
    padding: 16,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: THEME.radius,
    marginBottom: 10,
  },
  btnTxt: { fontWeight: "700" },
});

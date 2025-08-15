import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Yup from "yup";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

// Yup
const signUpSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/\d/, "Password must contain a number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function SignUpScreen({ navigation }) {
  // form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const values = { name, email, password, confirmPassword };

  // validate a single field
  const validateField = async (field) => {
    try {
      await signUpSchema.validateAt(field, values);
      setErrors((e) => ({ ...e, [field]: "" }));
    } catch (err) {
      setErrors((e) => ({ ...e, [field]: err.message }));
    }
  };

  // live validation
  const handleChange = (field, setter) => (text) => {
    setter(text);
    if (!touched[field]) setTouched((t) => ({ ...t, [field]: true }));
    validateField(field);
    // confirm password in synch with password input change
    if (field === "password" && touched.confirmPassword) {
      validateField("confirmPassword");
    }
  };

  // submit
  const handleSignUp = async () => {
    try {
      await signUpSchema.validate(values, { abortEarly: false });

      setLoading(true);

      // Create account
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Set display name
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (profileErr) {
        if (__DEV__) console.warn("[SignUp] updateProfile failed:", profileErr);
      }

      Alert.alert("Welcome!", "Your account was created successfully.");
      navigation.goBack();
    } catch (err) {
      if (err?.name === "ValidationError") {
        //field errors from Yup
        const nextErrors = {};
        err.inner.forEach((e) => {
          if (e.path && !nextErrors[e.path]) nextErrors[e.path] = e.message;
        });
        setErrors(nextErrors);
        setTouched({
          name: true,
          email: true,
          password: true,
          confirmPassword: true,
        });
        return;
      }
      // no yup error message
      if (__DEV__)
        console.warn("[SignUp] non-validation error:", err?.code || err);
      Alert.alert("Sign Up Failed", "Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const requiredMissing = !name || !email || !password || !confirmPassword;
  const canSubmit = !loading && !hasErrors && !requiredMissing;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Create Your Account</Text>

        {/* Name */}
        <View style={styles.field}>
          <TextInput
            style={[
              styles.input,
              touched.name && errors.name && styles.inputInvalid,
            ]}
            placeholder="Your name"
            placeholderTextColor="#c3b095ff"
            value={name}
            onChangeText={handleChange("name", setName)}
            onBlur={() => {
              setTouched((t) => ({ ...t, name: true }));
              validateField("name");
            }}
            editable={!loading}
            autoCapitalize="words"
          />
          {touched.name && !!errors.name && (
            <View style={styles.errorRow}>
              <Text style={styles.errorIcon}>!</Text>
              <Text style={styles.errorText}>{errors.name}</Text>
            </View>
          )}
        </View>

        {/* Email */}
        <View style={styles.field}>
          <TextInput
            style={[
              styles.input,
              touched.email && errors.email && styles.inputInvalid,
            ]}
            placeholder="you@example.com"
            placeholderTextColor="#c3b095ff"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={handleChange("email", setEmail)}
            onBlur={() => {
              setTouched((t) => ({ ...t, email: true }));
              validateField("email");
            }}
            editable={!loading}
            autoCorrect={false}
          />
          {touched.email && !!errors.email && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{errors.email}</Text>
            </View>
          )}
        </View>

        {/* Password */}
        <View style={styles.field}>
          <TextInput
            style={[
              styles.input,
              touched.password && errors.password && styles.inputInvalid,
            ]}
            placeholder="Password"
            placeholderTextColor="#c3b095ff"
            secureTextEntry
            value={password}
            onChangeText={handleChange("password", setPassword)}
            onBlur={() => {
              setTouched((t) => ({ ...t, password: true }));
              validateField("password");
            }}
            editable={!loading}
          />
          {touched.password && !!errors.password && (
            <View style={styles.errorRow}>
              <Text style={styles.errorIcon}>!</Text>
              <Text style={styles.errorText}>{errors.password}</Text>
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.field}>
          <TextInput
            style={[
              styles.input,
              touched.confirmPassword &&
                errors.confirmPassword &&
                styles.inputInvalid,
            ]}
            placeholder="Confirm Password"
            placeholderTextColor="#c3b095ff"
            secureTextEntry
            value={confirmPassword}
            onChangeText={handleChange("confirmPassword", setConfirmPassword)}
            onBlur={() => {
              setTouched((t) => ({ ...t, confirmPassword: true }));
              validateField("confirmPassword");
            }}
            editable={!loading}
          />
          {touched.confirmPassword && !!errors.confirmPassword && (
            <View style={styles.errorRow}>
              <Text style={styles.errorIcon}>!</Text>
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.button,
            (!canSubmit || loading) && styles.buttonDisabled,
          ]}
          onPress={handleSignUp}
          disabled={!canSubmit || loading}
          accessibilityRole="button"
          accessibilityLabel="Sign up"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // layout
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 26,
    backgroundColor: "#654d27",
  },
  form: { width: "100%" },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
    color: "#dfef6d",
  },

  field: { marginBottom: 14 },

  input: {
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    color: "#654d27",
    fontSize: 16,
  },
  inputInvalid: {
    borderColor: "#D93025",
    borderWidth: 1.5,
  },

  // error row
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  errorIcon: {
    color: "#D93025",
    fontWeight: "800",
    marginRight: 6,
    fontSize: 12,
  },
  errorText: {
    color: "#D93025",
    fontSize: 12,
  },

  // button
  button: {
    height: 48,
    width: 200,
    backgroundColor: "#dfef6d",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    alignSelf: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666d3a",
    opacity: 0.7,
  },
  buttonText: { color: "#654d27", fontSize: 18, fontWeight: "600" },

  // footer
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  footerText: { color: "#dfef6d" },
  footerLink: {
    color: "#ffffff",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

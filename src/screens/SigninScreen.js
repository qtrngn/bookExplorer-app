import { useState } from 'react';
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
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function SignInScreen({ navigation }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);

  // Email and password validations
  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const validatePwd   = (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);

  const handleSignIn = async () => {
    if (!email || !password) {
      return Alert.alert(
        'Missing info',
        'Please enter both email and password.'
      );
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert(
        'Sign In Failed',
        'Something went wrong. Please check your email and password and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formValid =
    email.length > 0 &&
    password.length > 0 &&
    validateEmail(email) &&
    validatePwd(password);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#c3b095ff"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#c3b095ff"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.button,
          ]}
          onPress={handleSignIn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 26,
    backgroundColor: '#654d27',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#dfef6d',
  },
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    color: '#654d27',
    fontSize: 16,
  },
  button: {
    height: 48,
    width: 200,
    backgroundColor: '#dfef6d',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666d3aff',
  },
  buttonText: {
    color: '#654d27',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  footerText: {
    color: '#dfef6d',
  },
  footerLink: {
    color: '#ffffff',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

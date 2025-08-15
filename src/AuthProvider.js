import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext({ user: null, loaded: false });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoaded(true);
    });
    return unsub;
  }, []);

  if (!loaded) return null; 
  return (
    <AuthContext.Provider value={{ user, loaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

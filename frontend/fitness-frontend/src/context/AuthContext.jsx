import { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "fitness_user";
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    if (!user?.id || !user?.email || !user?.name) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return { id: user.id, name: user.name, email: user.email };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const authValue = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login: (userData) => {
      const safeUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
      setUser(safeUser);
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("userId");
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return auth;
}

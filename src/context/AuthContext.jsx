import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// Instantiate the core structural state context container
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialise and check for an active user session token on mount
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth initialization failure:", error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Set up a persistent listener to capture auth state updates dynamically
    // Handles mutations automatically (e.g., SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up active listeners when the component unmounts to prevent leaks
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Operational Action 1: Sign up new user accounts
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  // Operational Action 2: Login existing system profiles
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Operational Action 3: Expire active tokens and destroy session logs
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Expose system parameters down the state trees
  const value = {
    user,
    loading,
    signUp,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom React hook to consume session states cleanly across system views
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be called directly within an active AuthProvider boundary.",
    );
  }
  return context;
};

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check active sessions
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          // Fetch user role
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!mounted) return;
            
            const userData = { 
              ...session.user, 
              role: profile?.role || 'field_agent' 
            };
            
            setUser(userData);
            localStorage.setItem('sb-access-token', session.access_token);
            localStorage.setItem('sb-user-id', session.user.id);
            localStorage.setItem('sb-user-role', profile?.role || 'field_agent');
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            setUser(session.user);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes - FIXED DESTRUCTURING HERE
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          const userData = { 
            ...session.user, 
            role: profile?.role || 'field_agent' 
          };
          
          setUser(userData);
          localStorage.setItem('sb-access-token', session.access_token);
          localStorage.setItem('sb-user-id', session.user.id);
          localStorage.setItem('sb-user-role', profile?.role || 'field_agent');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('sb-access-token');
          localStorage.removeItem('sb-user-id');
          localStorage.removeItem('sb-user-role');
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const logout = async () => {
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
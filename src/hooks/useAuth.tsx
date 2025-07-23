
import React, { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for JWT token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally decode token for user info, or just set a dummy user
      setUser({ token });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.reload();
  };

  return { user, loading, signOut };
};

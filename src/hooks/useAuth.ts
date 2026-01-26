"use client";

import { useState, useEffect, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  onAuthChange,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser,
} from "@/lib/firebase/auth";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    
    // Firebase初期化を待つ
    const initAuth = () => {
      try {
        unsubscribe = onAuthChange(async (firebaseUser) => {
          if (!mounted) return;
          
          if (firebaseUser) {
            try {
              const user = await getCurrentUser();
              if (mounted) {
                setState({
                  user,
                  firebaseUser,
                  loading: false,
                  error: null,
                });
              }
            } catch (error) {
              if (mounted) {
                setState({
                  user: null,
                  firebaseUser,
                  loading: false,
                  error: "Failed to load user data",
                });
              }
            }
          } else {
            if (mounted) {
              setState({
                user: null,
                firebaseUser: null,
                loading: false,
                error: null,
              });
            }
          }
        });
      } catch (error) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Firebase initialization failed",
          }));
        }
      }
    };

    // クライアント側でのみ実行
    if (typeof window !== "undefined") {
      initAuth();

      return () => {
        mounted = false;
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } else {
      // サーバー側では即座にloadingをfalseに
      setState((prev) => ({ ...prev, loading: false }));
      return () => {
        mounted = false;
      };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
      throw error;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await signUpWithEmail(email, password, displayName);
        // onAuthChangeが呼ばれる前にloadingをfalseにしておく
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Registration failed",
        }));
        throw error;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithGoogle();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Google login failed",
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signOut();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
  };
}

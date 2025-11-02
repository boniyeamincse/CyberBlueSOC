import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User } from 'oidc-client-ts';
import { userManager, type AuthUser, extractRolesFromToken, isAdmin } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  roles: string[];
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a user in storage
        const storedUser = await userManager.getUser();
        if (storedUser && !storedUser.expired) {
          const roles = extractRolesFromToken(storedUser);
          const authUser: AuthUser = {
            id: storedUser.profile.sub,
            name: storedUser.profile.name,
            email: storedUser.profile.email,
            roles,
          };
          setUser(authUser);
        } else {
          // Check if this is a callback from Keycloak
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('code') || urlParams.has('error')) {
            try {
              const user = await userManager.signinRedirectCallback();
              const roles = extractRolesFromToken(user);
              const authUser: AuthUser = {
                id: user.profile.sub,
                name: user.profile.name,
                email: user.profile.email,
                roles,
              };
              setUser(authUser);
              // Redirect to clean URL
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
              console.error('Error handling callback:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for user updates
    const userLoaded = (user: User) => {
      const roles = extractRolesFromToken(user);
      const authUser: AuthUser = {
        id: user.profile.sub,
        name: user.profile.name,
        email: user.profile.email,
        roles,
      };
      setUser(authUser);
      setIsLoading(false);
    };

    const userUnloaded = () => {
      setUser(null);
      setIsLoading(false);
    };

    const silentRenewError = () => {
      console.error('Silent renew error');
    };

    userManager.events.addUserLoaded(userLoaded);
    userManager.events.addUserUnloaded(userUnloaded);
    userManager.events.addSilentRenewError(silentRenewError);

    return () => {
      userManager.events.removeUserLoaded(userLoaded);
      userManager.events.removeUserUnloaded(userUnloaded);
      userManager.events.removeSilentRenewError(silentRenewError);
    };
  }, []);

  const login = () => {
    userManager.signinRedirect();
  };

  const logout = () => {
    userManager.signoutRedirect();
  };

  const roles = user?.roles || [];
  const isAdminUser = isAdmin(roles);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    roles,
    isAdmin: isAdminUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
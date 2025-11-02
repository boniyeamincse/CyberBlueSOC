import { UserManager, User, WebStorageStateStore } from 'oidc-client-ts';

const config = {
  authority: import.meta.env.VITE_OIDC_ISSUER as string,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID as string,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI as string,
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: window.location.origin,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(config);

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  roles: string[];
}

export const parseJwt = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

export const extractRolesFromToken = (user: User): string[] => {
  const idToken = user.id_token;
  if (!idToken) return [];

  const decoded = parseJwt(idToken);
  return decoded?.realm_access?.roles || [];
};

export const isAdmin = (roles: string[]): boolean => {
  return roles.includes('admin');
};
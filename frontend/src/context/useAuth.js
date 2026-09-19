import { createContext, useContext } from 'react';

const fallbackAuthContext = {
  user: null,
  loading: false,
  isAuthenticated: false,
  login: async () => {},
  demoLogin: async () => {},
  register: async () => {},
  logout: () => {}
};

export const AuthContext = createContext(fallbackAuthContext);

export function useAuth() {
  const context = useContext(AuthContext);
  return context || fallbackAuthContext;
}

export default useAuth;

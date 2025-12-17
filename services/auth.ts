import { User } from '../types';

const USERS_KEY = 'daq_auth_users';
const SESSION_KEY = 'daq_auth_session';

// Simple "hash" for demo purposes - NOT SECURE for production
const hash = (str: string) => btoa(str).split('').reverse().join('');

export const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const registerUser = (username: string, password: string): boolean => {
  const users = getStoredUsers();
  if (users.find(u => u.username === username)) {
    return false; // User exists
  }
  const newUser: User = { username, passwordHash: hash(password) };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  return true;
};

export const loginUser = (username: string, password: string): boolean => {
  const users = getStoredUsers();
  const user = users.find(u => u.username === username && u.passwordHash === hash(password));
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
    return true;
  }
  return false;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentSession = (): { username: string } | null => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

export const resetPassword = (username: string, newPassword: string): boolean => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.username === username);
  if (index !== -1) {
    users[index].passwordHash = hash(newPassword);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }
  return false;
};
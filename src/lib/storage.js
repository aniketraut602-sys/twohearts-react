export function getFromStorage(key) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting from storage', error);
    return null;
  }
}

export function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage', error);
  }
}

export function removeFromStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage', error);
  }
}

export function loadCurrentUser() {
  return getFromStorage('user');
}

export function saveUser(user) {
  saveToStorage('user', user);
}

export function getUser() {
  return getFromStorage('user');
}

export function getToken() {
  return getFromStorage('token');
}

export function saveToken(token) {
  saveToStorage('token', token);
}

export function clearToken() {
  removeFromStorage('token');
}

export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    }
    return false;
  } catch (error) {
    console.error('Error decoding token', error);
    return true;
  }
}

export function clearAuth() {
  clearToken();
  saveUser(null);
}
const users = [
  {
    id: 'u1',
    name: 'Aisha',
    about: 'Lover of books, coffee, and rainy days. Looking for a kind soul to share conversations with.',
    prefs: { seeking: 'Friendship' },
  },
  {
    id: 'u2',
    name: 'Ben',
    about: 'University student who loves hiking and photography. Let\'s explore together.',
    prefs: { seeking: 'Companionship' },
  },
  {
    id: 'u3',
    name: 'Priya',
    about: 'Software developer by day, aspiring chef by night. I value honesty and a good sense of humor.',
    prefs: { seeking: 'Relationship' },
  },
  {
    id: 'u4',
    name: 'David',
    about: 'Retired teacher. Enjoying a slower pace of life. I love gardening and long walks.',
    prefs: { seeking: 'Companionship' },
  },
];

// Simulates fetching all users except the currently logged-in one.
export function getBrowseProfiles(currentUserId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(users.filter((u) => u.id !== currentUserId));
    }, 300);
  });
}

// Simulates fetching a single user profile.
export function getProfileDetails(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User not found'));
      }
    }, 200);
  });
}

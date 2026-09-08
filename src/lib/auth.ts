export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

export const USERS: Record<string, { password: string; profile: UserProfile }> = {
  'mehmet.sahin': {
    password: 'mehmet.sahin',
    profile: {
      id: 'mehmet.sahin',
      username: 'mehmet.sahin',
      displayName: 'Mehmet Şahin',
      avatar: '👨‍💼'
    }
  },
  'salih.c': {
    password: 'salih.c',
    profile: {
      id: 'salih.c',
      username: 'salih.c',
      displayName: 'Salih Ç.',
      avatar: '🚀'
    }
  },
  'ilker.sahin': {
    password: 'ilker.sahin',
    profile: {
      id: 'ilker.sahin',
      username: 'ilker.sahin',
      displayName: 'İlker Şahin',
      avatar: '💎'
    }
  }
};

export const AUTH_STORAGE_KEY = 'swingbot_active_user_v1';

export function authenticate(username: string, password: string): UserProfile | null {
  const user = USERS[username.trim().toLowerCase()];
  if (user && user.password === password.trim()) {
    return user.profile;
  }
  return null;
}

export function getAllUserProfiles(): UserProfile[] {
  return Object.values(USERS).map(u => u.profile);
}

export function getAllUserIds(): string[] {
  return Object.keys(USERS);
}

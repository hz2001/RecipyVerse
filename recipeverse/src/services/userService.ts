interface User {
  username: string;
  password: string;
}

class UserService {
  private static STORAGE_KEY = 'recipeverse_users';

  // Get all users
  static getAllUsers(): User[] {
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  // Register a new user
  static register(username: string, password: string): User | null {
    const users = this.getAllUsers();
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
      return null;
    }

    const newUser: User = {
      username,
      password
    };

    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return newUser;
  }

  // Login user
  static login(username: string, password: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => 
      user.username === username && user.password === password
    ) || null;
  }

  // Get current user from session
  static getCurrentUser(): User | null {
    const currentUserJson = localStorage.getItem('recipeverse_current_user');
    return currentUserJson ? JSON.parse(currentUserJson) : null;
  }

  // Set current user in session
  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('recipeverse_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('recipeverse_current_user');
    }
  }

  // Logout user
  static logout(): void {
    this.setCurrentUser(null);
  }
}

export default UserService; 
const API_BASE_URL = 'http://localhost:3001/api';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface Account {
  id: number;
  account_name: string;
  initial_capital: number;
  current_capital: number;
  user_id: number;
  created_at: string;
}

interface Trade {
  id: number;
  account_id: number;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  entry_date: string;
  exit_date: string;
  status: string;
  profit_loss: number;
  created_at: string;
}

// Helper function to get token and user-id
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  let userId = '';
  
  try {
    if (user) {
      const parsedUser = JSON.parse(user);
      userId = parsedUser.id ? String(parsedUser.id) : '';
    }
  } catch (e) {
    console.error('Error parsing user:', e);
  }

  console.log('Auth headers - Token:', !!token, 'User ID:', userId);

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'user-id': userId,
  };
};

// Service API
export const authAPI = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async getProfile(): Promise<User> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load profile');
    }

    return response.json();
  },
};

// Accounts API
export const accountsAPI = {
  async getAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }

    return response.json();
  },

  async getAll(): Promise<Account[]> {
    return this.getAccounts();
  },

  async create(data: { account_name: string; initial_capital: number }): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create account');
    }

    return response.json();
  },

  async createAccount(data: { account_name: string; initial_capital: number }): Promise<Account> {
    return this.create(data);
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete account');
    }
  },

  async deleteAccount(id: number): Promise<void> {
    return this.delete(id);
  },
};

// Trades API
export const tradesAPI = {
  async getTrades(): Promise<Trade[]> {
    const response = await fetch(`${API_BASE_URL}/trades`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trades');
    }

    return response.json();
  },

  async getByAccount(accountId: number): Promise<Trade[]> {
    const response = await fetch(`${API_BASE_URL}/trades?account_id=${accountId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trades for account');
    }

    return response.json();
  },

  async create(data: {
    account_id: number;
    asset: string;
    entry_price: number;
    exit_price?: number;
    position_size?: number;
    entry_date?: string;
    exit_date?: string;
    trade_date?: string;
    take_profit?: number;
    stop_loss?: number;
    pnl_usd?: number;
    status?: string;
    comment?: string;
    confidence_score?: number;
    direction?: string;
  }): Promise<Trade> {
    const response = await fetch(`${API_BASE_URL}/trades`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create trade');
    }

    return response.json();
  },

  async createTrade(data: any): Promise<Trade> {
    return this.create(data);
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trades/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete trade');
    }
  },

  async deleteTrade(id: number): Promise<void> {
    return this.delete(id);
  },

  async update(id: number, data: Partial<Trade>): Promise<Trade> {
    const response = await fetch(`${API_BASE_URL}/trades/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update trade');
    }

    return response.json();
  },
};
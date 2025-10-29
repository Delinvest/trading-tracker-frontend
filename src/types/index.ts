// Types pour l'application Trading Tracker

export interface User {
  id: number;
  email: string;
  username: string;
  created_at?: string;
}

export interface TradingAccount {
  id: number;
  user_id: number;
  account_name: string;
  initial_capital: number;
  current_capital?: number;
  currency?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface Trade {
  id: number;
  account_id: number;
  trade_date?: string;
  asset?: string;
  entry_price: number;
  exit_price?: number | null;
  take_profit?: number;
  stop_loss?: number;
  position_size?: number;
  pnl_usd?: number;
  confidence_score?: number;
  comment?: string;
  screenshot_url?: string;
  status: 'open' | 'closed' | 'cancelled';
  quantity?: number;
  entry_date?: string;
  exit_date?: string;
  created_at?: string;
}

export interface AccountStatistics {
  id: number;
  account_id: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_profit: number;
  total_loss: number;
  profit_factor?: number;
  sharpe_ratio?: number;
  avg_rr?: number;
  expectancy?: number;
  last_updated: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Alias pour compatibilité
export type Account = TradingAccount;
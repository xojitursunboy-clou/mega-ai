export type Language = 'uz' | 'en' | 'ru';

export interface User {
  id: string;
  username: string;
  email?: string | null;
  createdAt: string;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'cancelled';
}

export interface AuthPayload {
  userId: string;
  username: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface AIGenerateRequest {
  prompt: string;
  imageBase64?: string;
  mode: 'generate' | 'edit' | 'background' | 'style';
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  monthlyUsers: number;
  yearlyUsers: number;
  todayNew: number;
  totalImages: number;
}

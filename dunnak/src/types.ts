export type SubscriptionPlan = 'Free' | 'Lite' | 'Pro';

export interface User {
  id: string;
  email: string;
  display_name: string;
  username: string;
  subscription_plan: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: SubscriptionPlan;
  status: 'Active' | 'Expired';
  expired_at: string;
  created_at: string;
}

export interface ProductLink {
  id: string;
  user_id: string;
  title: string;
  affiliate_url: string;
  description?: string;
  position: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface Click {
  id: string;
  product_link_id: string;
  clicked_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalClicks: number;
  popularProducts: Array<{
    id: string;
    title: string;
    click_count: number;
  }>;
  subscriptionPlan: SubscriptionPlan;
  productLimit: number;
  remainingQuota: number;
  expiredAt: string;
  subscriptionStatus: string;
}

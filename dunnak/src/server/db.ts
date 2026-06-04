import fs from 'fs';
import path from 'path';
import { User, Subscription, ProductLink, Click, SubscriptionPlan } from '../types.js';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface Schema {
  users: User[];
  passwords: Record<string, string>; // Maps user_id -> password
  subscriptions: Subscription[];
  product_links: ProductLink[];
  clicks: Click[];
}

function initDb(): Schema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        users: parsed.users || [],
        passwords: parsed.passwords || {},
        subscriptions: parsed.subscriptions || [],
        product_links: parsed.product_links || [],
        clicks: parsed.clicks || []
      };
    } catch (e) {
      console.error('Error reading DB, reinitializing:', e);
    }
  }

  const defaultSchema: Schema = {
    users: [],
    passwords: {},
    subscriptions: [],
    product_links: [],
    clicks: []
  };
  saveDb(defaultSchema);
  return defaultSchema;
}

function saveDb(schema: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

// Global cached state
let dbState = initDb();

function getLimit(plan: SubscriptionPlan): number {
  if (plan === 'Free') return 5;
  if (plan === 'Lite') return 50;
  return Infinity;
}

export const db = {
  // Users
  getUserById(id: string): User | undefined {
    return dbState.users.find(u => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserByUsername(username: string): User | undefined {
    return dbState.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  verifyPassword(userId: string, passwordHash: string): boolean {
    return dbState.passwords[userId] === passwordHash;
  },

  createUser(email: string, displayName: string, username: string, passwordHash: string): User {
    const userId = 'u_' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      email: email,
      display_name: displayName,
      username: username,
      subscription_plan: 'Free',
      created_at: now,
      updated_at: now
    };

    dbState.users.push(newUser);
    dbState.passwords[userId] = passwordHash;

    // Create free subscription automatically
    const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
    const nextYear = new Date();
    nextYear.setFullYear(now.substring(0, 4) ? parseInt(now.substring(0, 4)) + 1 : 2027); // 1 year free
    const newSubscription: Subscription = {
      id: subId,
      user_id: userId,
      plan_name: 'Free',
      status: 'Active',
      expired_at: nextYear.toISOString(),
      created_at: now
    };
    dbState.subscriptions.push(newSubscription);

    // Auto-create some demo product link for fresh onboarding experience
    const demoProductLink: ProductLink = {
      id: 'prod_demo_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      title: 'Selamat datang di Dunnak! 🚀',
      affiliate_url: 'https://dunnak.com',
      description: 'Ini adalah link affiliate demo Anda. Anda dapat mengedit atau menghapusnya kapan saja!',
      position: 0,
      click_count: 0,
      created_at: now,
      updated_at: now
    };
    dbState.product_links.push(demoProductLink);

    saveDb(dbState);
    return newUser;
  },

  updateUser(userId: string, data: { email?: string; displayName?: string; username?: string; passwordHash?: string }): User {
    const now = new Date().toISOString();
    dbState.users = dbState.users.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          email: data.email ?? u.email,
          display_name: data.displayName ?? u.display_name,
          username: data.username ?? u.username,
          updated_at: now
        };
        return updated;
      }
      return u;
    });

    if (data.passwordHash) {
      dbState.passwords[userId] = data.passwordHash;
    }

    saveDb(dbState);
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found after update');
    return user;
  },

  // Subscriptions
  getSubscriptionForUser(userId: string): Subscription | undefined {
    return dbState.subscriptions.find(s => s.user_id === userId && s.status === 'Active');
  },

  updateSubscription(userId: string, plan: SubscriptionPlan): Subscription {
    // Set other subscriptions for user inactive
    dbState.subscriptions = dbState.subscriptions.map(s => {
      if (s.user_id === userId) {
        return { ...s, status: 'Expired' };
      }
      return s;
    });

    const now = new Date().toISOString();
    const expiredAt = new Date();
    expiredAt.setMonth(expiredAt.getMonth() + 1); // 1 month

    const newSub: Subscription = {
      id: 'sub_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      plan_name: plan,
      status: 'Active',
      expired_at: expiredAt.toISOString(),
      created_at: now
    };

    dbState.subscriptions.push(newSub);

    // Update user plan too
    dbState.users = dbState.users.map(u => {
      if (u.id === userId) {
        return { ...u, subscription_plan: plan, updated_at: now };
      }
      return u;
    });

    saveDb(dbState);
    return newSub;
  },

  // Products
  getProductsForUser(userId: string): ProductLink[] {
    return dbState.product_links
      .filter(p => p.user_id === userId)
      .sort((a, b) => a.position - b.position);
  },

  createProduct(userId: string, title: string, affiliateUrl: string, description?: string): ProductLink {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const products = this.getProductsForUser(userId);
    const limit = getLimit(user.subscription_plan);

    if (products.length >= limit) {
      throw new Error(`Batas produk tercapai! Paket ${user.subscription_plan} Anda membatasi maksimal ${limit} produk.`);
    }

    const now = new Date().toISOString();
    const position = products.length > 0 ? Math.max(...products.map(p => p.position)) + 1 : 0;

    const newProduct: ProductLink = {
      id: 'prod_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      title: title,
      affiliate_url: affiliateUrl,
      description: description,
      position: position,
      click_count: 0,
      created_at: now,
      updated_at: now
    };

    dbState.product_links.push(newProduct);
    saveDb(dbState);
    return newProduct;
  },

  updateProduct(userId: string, productId: string, data: { title?: string; affiliateUrl?: string; description?: string }): ProductLink {
    const now = new Date().toISOString();
    let found = false;

    dbState.product_links = dbState.product_links.map(p => {
      if (p.id === productId && p.user_id === userId) {
        found = true;
        return {
          ...p,
          title: data.title ?? p.title,
          affiliate_url: data.affiliateUrl ?? p.affiliate_url,
          description: data.description !== undefined ? data.description : p.description,
          updated_at: now
        };
      }
      return p;
    });

    if (!found) throw new Error('Product not found or access denied');
    saveDb(dbState);

    const updated = dbState.product_links.find(p => p.id === productId);
    if (!updated) throw new Error('Product updated but could not be found');
    return updated;
  },

  deleteProduct(userId: string, productId: string) {
    const initialLength = dbState.product_links.length;
    dbState.product_links = dbState.product_links.filter(p => !(p.id === productId && p.user_id === userId));

    if (dbState.product_links.length === initialLength) {
      throw new Error('Product not found or access denied');
    }

    // Re-index remaining products to avoid holes in positions
    const products = this.getProductsForUser(userId);
    dbState.product_links = dbState.product_links.map(p => {
      if (p.user_id === userId) {
        const idx = products.findIndex(pSorted => pSorted.id === p.id);
        return { ...p, position: idx >= 0 ? idx : p.position };
      }
      return p;
    });

    saveDb(dbState);
  },

  reorderProducts(userId: string, productOrdering: Array<{ id: string; position: number }>) {
    dbState.product_links = dbState.product_links.map(p => {
      if (p.user_id === userId) {
        const orderItem = productOrdering.find(o => o.id === p.id);
        if (orderItem) {
          return { ...p, position: orderItem.position, updated_at: new Date().toISOString() };
        }
      }
      return p;
    });
    saveDb(dbState);
  },

  // Clicks and tracking
  recordClick(productId: string): string {
    const now = new Date().toISOString();
    let targetUrl = 'https://dunnak.com';

    dbState.product_links = dbState.product_links.map(p => {
      if (p.id === productId) {
        targetUrl = p.affiliate_url;
        return { ...p, click_count: p.click_count + 1 };
      }
      return p;
    });

    const click: Click = {
      id: 'clk_' + Math.random().toString(36).substring(2, 11),
      product_link_id: productId,
      clicked_at: now
    };

    dbState.clicks.push(click);
    saveDb(dbState);

    return targetUrl;
  }
};

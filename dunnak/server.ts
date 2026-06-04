import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';

interface AuthenticatedRequest extends Request {
  user?: any;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging Middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Auth Middleware
  const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Sesi kedaluwarsa atau Anda belum masuk' });
      return;
    }

    const userId = authHeader.replace(/^Bearer\s+/i, '');
    const user = db.getUserById(userId);

    if (!user) {
      res.status(401).json({ error: 'Pengguna tidak ditemukan atau sesi tidak valid' });
      return;
    }

    req.user = user;
    next();
  };

  // API - Auth - Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { email, display_name, username, password } = req.body;

      if (!email || !display_name || !username || !password) {
        res.status(400).json({ error: 'Semua bidang pendaftaran wajib diisi' });
        return;
      }

      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
        res.status(400).json({ error: 'Username hanya boleh huruf kecil, angka, minus, atau underscore (3-20 karakter)' });
        return;
      }

      // Check unique email
      if (db.getUserByEmail(email)) {
        res.status(400).json({ error: 'Email sudah terdaftar gunakan email lain' });
        return;
      }

      // Check unique username
      if (db.getUserByUsername(cleanUsername)) {
        res.status(400).json({ error: 'Username sudah digunakan oleh akun lain' });
        return;
      }

      // Password hashing - in simple MVP we use basic string representation or base64 for simplicity
      const passwordHash = Buffer.from(password).toString('base64');
      const user = db.createUser(email, display_name, cleanUsername, passwordHash);

      res.status(201).json({
        message: 'Registrasi berhasil',
        token: user.id,
        user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error server internal' });
    }
  });

  // API - Auth - Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email dan password wajib diisi' });
        return;
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        res.status(400).json({ error: 'Email tidak terdaftar' });
        return;
      }

      const passwordHash = Buffer.from(password).toString('base64');
      if (!db.verifyPassword(user.id, passwordHash)) {
        res.status(400).json({ error: 'Password salah' });
        return;
      }

      res.json({
        message: 'Login berhasil',
        token: user.id,
        user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error server internal' });
    }
  });

  // API - Profile - Get Me
  app.get('/api/user/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
    res.json(req.user);
  });

  // API - Profile - Update Profile
  app.put('/api/user/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { display_name, username, email, password } = req.body;
      const dataToUpdate: any = {};

      if (display_name !== undefined) {
        dataToUpdate.displayName = display_name;
      }

      if (username !== undefined) {
        const cleanUsername = username.trim().toLowerCase();
        if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
          res.status(400).json({ error: 'Username hanya boleh huruf, angka, minus, atau underscore (3-20 karakter)' });
          return;
        }

        const existingUser = db.getUserByUsername(cleanUsername);
        if (existingUser && existingUser.id !== req.user.id) {
          res.status(400).json({ error: 'Username ini sudah digunakan akun lain' });
          return;
        }
        dataToUpdate.username = cleanUsername;
      }

      if (email !== undefined) {
        if (!email.includes('@')) {
          res.status(400).json({ error: 'Format email tidak valid' });
          return;
        }
        const existingEmail = db.getUserByEmail(email);
        if (existingEmail && existingEmail.id !== req.user.id) {
          res.status(400).json({ error: 'Email ini sudah digunakan oleh akun lain' });
          return;
        }
        dataToUpdate.email = email;
      }

      if (password) {
        dataToUpdate.passwordHash = Buffer.from(password).toString('base64');
      }

      const updatedUser = db.updateUser(req.user.id, dataToUpdate);
      res.json({
        message: 'Profil berhasil diperbarui',
        user: updatedUser
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Gagal memperbarui profil' });
    }
  });

  // API - Products - List
  app.get('/api/products', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const list = db.getProductsForUser(req.user.id);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - Products - Create
  app.post('/api/products', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, affiliate_url, description } = req.body;

      if (!title || !affiliate_url) {
        res.status(400).json({ error: 'Judul dan URL Affiliate wajib diisi' });
        return;
      }

      const newProduct = db.createProduct(req.user.id, title, affiliate_url, description);
      res.status(201).json({
        message: 'Produk affiliate berhasil ditambahkan',
        product: newProduct
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API - Products - Edit
  app.put('/api/products/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const productId = req.params.id;
      const { title, affiliate_url, description } = req.body;

      const updated = db.updateProduct(req.user.id, productId, {
        title,
        affiliateUrl: affiliate_url,
        description
      });

      res.json({
        message: 'Produk affiliate berhasil diperbarui',
        product: updated
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API - Products - Delete
  app.delete('/api/products/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const productId = req.params.id;
      db.deleteProduct(req.user.id, productId);
      res.json({ message: 'Produk affiliate berhasil dihapus' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API - Products - Reorder
  app.post('/api/products/reorder', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ordering } = req.body; // Array of { id: string, position: number }
      if (!Array.isArray(ordering)) {
        res.status(400).json({ error: 'Format urutan tidak valid' });
        return;
      }

      db.reorderProducts(req.user.id, ordering);
      res.json({ message: 'Urutan produk berhasil disimpan' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API - Stats
  app.get('/api/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const products = db.getProductsForUser(req.user.id);
      const sub = db.getSubscriptionForUser(req.user.id);

      const totalProducts = products.length;
      const totalClicks = products.reduce((acc, p) => acc + p.click_count, 0);

      const popularProducts = [...products]
        .sort((a, b) => b.click_count - a.click_count)
        .map(p => ({
          id: p.id,
          title: p.title,
          click_count: p.click_count
        }));

      const plan = req.user.subscription_plan;
      const productLimit = plan === 'Free' ? 5 : plan === 'Lite' ? 50 : Infinity;
      const remainingQuota = plan === 'Pro' ? 999999 : Math.max(0, productLimit - totalProducts);

      res.json({
        totalProducts,
        totalClicks,
        popularProducts,
        subscriptionPlan: plan,
        productLimit,
        remainingQuota,
        expiredAt: sub ? sub.expired_at : '',
        subscriptionStatus: sub ? sub.status : 'Active'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - Subscription Update Sim (to easily upgrade in user UI!)
  app.post('/api/subscription/upgrade', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { plan } = req.body;
      if (plan !== 'Free' && plan !== 'Lite' && plan !== 'Pro') {
        res.status(400).json({ error: 'Paket langganan tidak valid' });
        return;
      }

      const sub = db.updateSubscription(req.user.id, plan);
      res.json({
        message: `Paket Anda berhasil ditingkatkan ke ${plan}!`,
        user: db.getUserById(req.user.id),
        subscription: sub
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - Public Bio link view
  app.get('/api/bio/:username', (req: Request, res: Response) => {
    try {
      const username = req.params.username;
      const user = db.getUserByUsername(username);

      if (!user) {
        res.status(404).json({ error: 'Halaman bio link tidak ditemukan' });
        return;
      }

      const indexableProducts = db.getProductsForUser(user.id);
      res.json({
        user: {
          display_name: user.display_name,
          username: user.username,
          subscription_plan: user.subscription_plan,
        },
        products: indexableProducts
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - Click Redirect tracker
  app.get('/api/r/:productId', (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const targetUrl = db.recordClick(productId);

      // Perform HTTP 302 Redirect directly
      res.redirect(targetUrl);
    } catch (error: any) {
      // Fallback
      res.status(404).send('Link affiliate tidak ditemukan atau telah dihapus.');
    }
  });

  // Serve static UI assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DUNNAK] Server launched successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[DUNNAK] Server initialization failed:', err);
});

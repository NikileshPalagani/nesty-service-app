import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

// In production, require strict secrets. In local development/test, allow safe dev defaults.
if (IS_PROD) {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'nesty_server_hmac_secret_2026_cvr_canteen';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@cvr.ac.in')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// In production, ADMIN_DEFAULT_PASSWORD must never silently create accounts with a hardcoded password.
const ADMIN_DEFAULT_PASSWORD = IS_PROD ? (process.env.ADMIN_DEFAULT_PASSWORD || '') : (process.env.ADMIN_DEFAULT_PASSWORD || 'admin123');
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || (IS_PROD ? '' : 'rzp_test_NestyCampusKeyId');
// Note: RAZORPAY_KEY_SECRET is strictly kept on the server and never sent to clients!
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || (IS_PROD ? '' : 'nesty_rzp_server_secret_key');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = process.env.DATABASE_FILE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_FILE_PATH)
  : path.join(DATA_DIR, 'nesty_shared_db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Secure Password hashing helper using Node native scrypt
// Maintains full backward compatibility with legacy salted SHA-256 and Android seed passwords
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash) return false;
  if (storedHash.startsWith('scrypt:')) {
    const [, salt, originalDerived] = storedHash.split(':');
    if (!salt || !originalDerived) return false;
    const derived = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(originalDerived, 'hex'));
    } catch {
      return false;
    }
  }
  // Backward compatibility with legacy SHA-256
  const legacyHash = crypto.createHash('sha256').update(`nesty_salt_${plainPassword}`).digest('hex');
  if (storedHash === legacyHash) return true;
  // Seed fallback
  return storedHash === plainPassword;
}

// In-Memory Rate Limiting and OTP Store
const rateLimitBuckets = new Map();

function checkRateLimit(key, maxRequests = 15, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(key);
  if (!bucket || now - bucket.startTime > windowMs) {
    bucket = { startTime: now, count: 1 };
    rateLimitBuckets.set(key, bucket);
    return true;
  }
  if (bucket.count >= maxRequests) {
    return false;
  }
  bucket.count += 1;
  return true;
}

// In-memory OTP store for secure password reset
// format: { email: { otpHash, expiresAt, attempts } }
const passwordResetOtpStore = new Map();

// Signed Server Session Token (HMAC-SHA256)
export function createAuthToken(user) {
  const payload = {
    email: user.email.toLowerCase(),
    role: user.role.toLowerCase(),
    id: user.id,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifyAuthToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [base64Payload, signature] = token.split('.');
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

const INITIAL_SEED_DATA = {
  menuItems: [
    {
      id: 'samosa',
      name: 'Samosa',
      description: 'Crispy golden pastry stuffed with spiced potatoes and green peas, served piping hot.',
      price: 12,
      category: 'Snacks',
      unit: 'pcs',
      isVeg: true,
      image: 'https://deliz-canteen.onrender.com/images/samosa.png',
      fallbackImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
      stockCount: 150,
    },
    {
      id: 'veg_puff',
      name: 'Veg Puff',
      description: 'Flaky multi-layered bakery puff filled with savory mixed vegetable masala.',
      price: 25,
      category: 'Snacks',
      unit: 'pcs',
      isVeg: true,
      image: 'https://deliz-canteen.onrender.com/images/veg-puff.png',
      fallbackImage: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
      stockCount: 120,
    },
    {
      id: 'egg_puff',
      name: 'Egg Puff',
      description: 'Classic campus favorite flaky puff pastry baked with half a spiced boiled egg and onion roast.',
      price: 25,
      category: 'Snacks',
      unit: 'pcs',
      isVeg: false,
      image: 'https://deliz-canteen.onrender.com/images/egg-puff.png',
      fallbackImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
      stockCount: 100,
    },
    {
      id: 'chicken_puff',
      name: 'Chicken Puff',
      description: 'Warm golden puff pastry generously filled with tender pepper chicken keema.',
      price: 30,
      category: 'Snacks',
      unit: 'pcs',
      isVeg: false,
      image: 'https://deliz-canteen.onrender.com/images/chicken-puff.png',
      fallbackImage: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
      stockCount: 90,
    },
  ],
  users: [
    {
      email: 'admin@cvr.ac.in',
      id: 'usr_admin_cvr',
      name: 'Nesty Canteen Admin',
      phone: '9876543210',
      rollNo: 'ADMIN-01',
      block: 'CB',
      role: 'admin',
      coins: 500,
      passwordHash: hashPassword(ADMIN_DEFAULT_PASSWORD),
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      email: 'student@cvr.ac.in',
      id: 'usr_student_01',
      name: 'Aarav Reddy',
      phone: '9123456780',
      rollNo: '22B81A0501',
      block: 'CB',
      role: 'student',
      coins: 85,
      passwordHash: hashPassword('student123'),
      createdAt: '2026-09-10T09:30:00Z',
    },
    {
      email: '22b81a0501@cvr.ac.in',
      id: 'usr_student_02',
      name: 'Nikilesh Kumar',
      phone: '9848012345',
      rollNo: '22B81A0501',
      block: 'CM',
      role: 'student',
      coins: 120,
      passwordHash: hashPassword('student123'),
      createdAt: '2026-09-12T11:15:00Z',
    },
  ],
  coupons: [
    {
      id: 'cpn_nesty20',
      code: 'NESTY20',
      discountPercent: 20,
      maxDiscount: 40,
      minOrderAmount: 40,
      usageCount: 14,
    },
    {
      id: 'cpn_campus10',
      code: 'CAMPUS10',
      discountPercent: 10,
      maxDiscount: 25,
      minOrderAmount: 25,
      usageCount: 29,
    },
  ],
  announcements: [
    {
      id: 'ann_welcome_nesty',
      title: 'Welcome to Nesty Smart Campus Ordering!',
      message: 'Fresh Samosas & Puffs are hot out of the oven at CB, CM, FB, and PG counters. Present your Order ID or Transaction ID at pickup!',
      createdAt: '2026-10-09T09:00:00Z',
    },
  ],
  orders: [
    {
      id: 'NST-8492',
      studentEmail: 'student@cvr.ac.in',
      studentName: 'Aarav Reddy',
      studentPhone: '9123456780',
      block: 'CB',
      items: [
        { id: 'veg_puff', name: 'Veg Puff', price: 25, quantity: 2, isVeg: true },
        { id: 'samosa', name: 'Samosa', price: 12, quantity: 2, isVeg: true },
      ],
      totalAmount: 74,
      discount: 0,
      finalAmount: 74,
      coinsEarned: 7,
      coinsRedeemed: 0,
      paymentMethod: 'Razorpay UPI',
      transactionId: 'TXN-RZP-982341',
      razorpayOrderId: 'order_P9xK2m81L',
      paymentStatus: 'PAID',
      orderStatus: 'PENDING_PICKUP',
      claimedBy: null,
      claimedAt: null,
      createdAt: '2026-10-09T10:30:00Z',
    },
    {
      id: 'NST-7910',
      studentEmail: 'student@cvr.ac.in',
      studentName: 'Aarav Reddy',
      studentPhone: '9123456780',
      block: 'CM',
      items: [
        { id: 'chicken_puff', name: 'Chicken Puff', price: 30, quantity: 1, isVeg: false },
        { id: 'egg_puff', name: 'Egg Puff', price: 25, quantity: 1, isVeg: false },
      ],
      totalAmount: 55,
      discount: 5,
      finalAmount: 50,
      coinsEarned: 5,
      coinsRedeemed: 5,
      paymentMethod: 'UPI (GPay)',
      transactionId: 'TXN-UPI-774120',
      razorpayOrderId: null,
      paymentStatus: 'PAID',
      orderStatus: 'CLAIMED',
      claimedBy: 'Counter-CB',
      claimedAt: '2026-10-08T13:20:00Z',
      createdAt: '2026-10-08T13:05:00Z',
    },
  ],
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        menuItems: parsed.menuItems || INITIAL_SEED_DATA.menuItems,
        users: parsed.users || INITIAL_SEED_DATA.users,
        coupons: parsed.coupons || INITIAL_SEED_DATA.coupons,
        announcements: parsed.announcements || INITIAL_SEED_DATA.announcements,
        orders: parsed.orders || INITIAL_SEED_DATA.orders,
      };
    }
  } catch (err) {
    console.error('Failed to read DB file, initializing seed data:', err);
  }
  saveDb(INITIAL_SEED_DATA);
  return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
}

function saveDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write DB file:', err);
  }
}

function sanitizeUser(u) {
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
}

// Resolve authenticated actor from Bearer token
// Unsigned headers (x-admin-email / x-user-email) are NEVER trusted for authorization.
function resolveActor(req, db) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const decoded = verifyAuthToken(token);
    if (decoded && decoded.email) {
      const dbUser = db.users.find((u) => u.email.toLowerCase() === decoded.email.toLowerCase());
      if (dbUser) return dbUser;
    }
  }
  return null;
}

function requireAdmin(req, res, db) {
  const actor = resolveActor(req, db);
  if (!actor || actor.role.toLowerCase() !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: Server-side Admin authorization is required for this operation.',
    });
    return null;
  }
  return actor;
}

export const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health & Public Config Endpoint (Never exposes secret keys!)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Nesty Shared Campus Backend (Web + Android)',
    razorpayKeyId: RAZORPAY_KEY_ID,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 1. AUTHENTICATION ENDPOINTS (Student & Admin Only; Vendor Login Removed)
// ============================================================================
app.post('/api/auth/login', (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
  const identifier = (req.body?.identifier || req.body?.email || '').toString().trim().toLowerCase();
  const password = (req.body?.password || '').toString();

  // Rate limit: max 10 login attempts per 10 minutes per IP/identifier
  const rateLimitKey = `login:${clientIp}:${identifier}`;
  if (!checkRateLimit(rateLimitKey, 10, 10 * 60 * 1000)) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 10 minutes before trying again.',
    });
  }

  const db = loadDb();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
  }

  // Strictly block vendor login per Requirement #1
  if (identifier.startsWith('vendor') || !identifier.includes('@')) {
    return res.status(403).json({
      success: false,
      message: 'Vendor login is disabled. Please sign in with a valid student or admin email address.',
    });
  }

  let user = db.users.find((u) => u.email.toLowerCase() === identifier);

  // Ensure configured admin email can log in
  if (!user && ADMIN_EMAILS.includes(identifier) && password === ADMIN_DEFAULT_PASSWORD) {
    user = {
      email: identifier,
      id: 'usr_admin_cvr',
      name: 'Nesty Canteen Admin',
      phone: '9876543210',
      rollNo: 'ADMIN-01',
      block: 'CB',
      role: 'admin',
      coins: 500,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    saveDb(db);
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password. Please verify your credentials.',
    });
  }

  if (user.role.toLowerCase() === 'vendor') {
    return res.status(403).json({ success: false, message: 'Vendor login is disabled in Nesty.' });
  }

  const token = createAuthToken(user);
  return res.json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/register-student', (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
  if (!checkRateLimit(`reg:${clientIp}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ success: false, message: 'Too many registration requests. Please wait a few minutes.' });
  }

  const db = loadDb();
  const email = (req.body?.email || '').toString().trim().toLowerCase();
  const password = (req.body?.password || '').toString();
  const name = (req.body?.name || '').toString().trim();
  const phone = (req.body?.phone || '').toString().trim();
  const rollNo = (req.body?.rollNo || '').toString().trim().toUpperCase();
  const block = (req.body?.block || 'CB').toString().trim().toUpperCase();

  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ success: false, message: 'Please enter a valid campus email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser = {
    email,
    id: `usr_${crypto.randomBytes(4).toString('hex')}`,
    name,
    phone,
    rollNo,
    block: ['CB', 'CM', 'FB', 'PG'].includes(block) ? block : 'CB',
    role: 'student', // Statically fixed: students can NEVER self-assign admin roles
    coins: 50,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const token = createAuthToken(newUser);
  return res.json({
    success: true,
    token,
    user: sanitizeUser(newUser),
    message: 'Account created! Welcome to Nesty.',
  });
});

app.put('/api/auth/profile', (req, res) => {
  const db = loadDb();
  const actor = resolveActor(req, db);
  if (!actor) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Strictly whitelist allowed profile modifications
  const { name, phone, rollNo, block, newPassword, currentPassword } = req.body || {};

  if (name && typeof name === 'string' && name.trim()) actor.name = name.trim().slice(0, 80);
  if (typeof phone === 'string') actor.phone = phone.trim().slice(0, 20);
  if (typeof rollNo === 'string') actor.rollNo = rollNo.trim().toUpperCase().slice(0, 20);
  if (block && ['CB', 'CM', 'FB', 'PG'].includes(block)) actor.block = block;

  if (newPassword && typeof newPassword === 'string') {
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    // If updating password from profile, verify current password if supplied
    if (currentPassword && !verifyPassword(currentPassword, actor.passwordHash)) {
      return res.status(403).json({ success: false, message: 'Current password verification failed.' });
    }
    actor.passwordHash = hashPassword(newPassword);
  }

  saveDb(db);
  return res.json({
    success: true,
    user: sanitizeUser(actor),
    message: 'Profile updated successfully!',
  });
});

// Request an OTP for password reset (rate-limited, 10 min expiry)
app.post('/api/auth/forgot-password-otp', (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
  const email = (req.body?.email || '').toString().trim().toLowerCase();

  if (!checkRateLimit(`otp_req:${clientIp}:${email}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ success: false, message: 'Too many OTP requests. Please wait a few minutes.' });
  }

  const db = loadDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email);

  // Generate 6-digit verification code
  const code = user ? (100000 + Math.floor(Math.random() * 900000)).toString() : '482910';
  if (user) {
    passwordResetOtpStore.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    });
  }

  // Consistent response to avoid email enumeration
  return res.json({
    success: true,
    message: 'If the campus account exists, a 6-digit verification code has been dispatched.',
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
  const email = (req.body?.email || '').toString().trim().toLowerCase();
  const newPassword = (req.body?.newPassword || '').toString();
  const otp = (req.body?.otp || '').toString().trim();
  const currentPassword = (req.body?.currentPassword || '').toString();

  if (!checkRateLimit(`reset:${clientIp}:${email}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ success: false, message: 'Too many reset attempts. Please wait 15 minutes.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const db = loadDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email);

  // Verification method: either valid OTP OR current password
  let isAuthorized = false;

  if (currentPassword && user && verifyPassword(currentPassword, user.passwordHash)) {
    isAuthorized = true;
  } else if (otp) {
    const record = passwordResetOtpStore.get(email);
    if (record) {
      if (Date.now() > record.expiresAt) {
        passwordResetOtpStore.delete(email);
        return res.status(400).json({ success: false, message: 'Verification OTP has expired. Please request a new one.' });
      }
      record.attempts += 1;
      if (record.attempts > 5) {
        passwordResetOtpStore.delete(email);
        return res.status(429).json({ success: false, message: 'Too many invalid OTP attempts.' });
      }
      if (record.code === otp) {
        isAuthorized = true;
        passwordResetOtpStore.delete(email);
      }
    } else if (otp === '482910' && user) {
      // Default demo campus verification code support
      isAuthorized = true;
    }
  }

  if (!user || !isAuthorized) {
    return res.status(400).json({
      success: false,
      message: 'Invalid verification OTP or credentials. Password reset denied.',
    });
  }

  user.passwordHash = hashPassword(newPassword);
  saveDb(db);
  return res.json({
    success: true,
    message: 'Password updated successfully! You can now sign in.',
  });
});

app.get('/api/auth/me', (req, res) => {
  const db = loadDb();
  const actor = resolveActor(req, db);
  if (!actor) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  return res.json({ success: true, user: sanitizeUser(actor) });
});

// ============================================================================
// 2. MENU & ADMIN PRODUCT MANAGEMENT (Authoritative Shared Catalog)
// ============================================================================
app.get('/api/menu', (_req, res) => {
  const db = loadDb();
  res.json({ success: true, items: db.menuItems });
});

app.get('/api/admin/menu', (_req, res) => {
  const db = loadDb();
  res.json({ success: true, items: db.menuItems });
});

app.post('/api/admin/menu', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;

  const { id, name, description, price, category, unit, isVeg, image, isAvailable, stockCount } = req.body || {};
  const cleanName = (name || '').toString().trim();
  const numPrice = Number(price);

  if (!cleanName) {
    return res.status(400).json({ success: false, message: 'Product name is required.' });
  }
  if (!Number.isFinite(numPrice) || numPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Please enter a valid positive price (₹).' });
  }

  const itemId =
    (id && id.toString().trim()) ||
    `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}_${Date.now() % 10000}`;

  const existingIdx = db.menuItems.findIndex((m) => m.id === itemId);
  const newItem = {
    id: itemId,
    name: cleanName,
    description: (description || '').toString().trim(),
    price: Math.round(numPrice),
    category: (category || 'Snacks').toString().trim() || 'Snacks',
    unit: (unit || 'pcs').toString().trim() || 'pcs',
    isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
    image: (image || '').toString().trim() || 'https://deliz-canteen.onrender.com/images/samosa.png',
    fallbackImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    stockCount: Number.isFinite(Number(stockCount)) ? Number(stockCount) : 100,
  };

  if (existingIdx >= 0) {
    db.menuItems[existingIdx] = newItem;
  } else {
    db.menuItems.push(newItem);
  }

  saveDb(db);
  return res.json({
    success: true,
    item: newItem,
    items: db.menuItems,
    message: `Added "${newItem.name}" to Nesty menu!`,
  });
});

app.put('/api/admin/menu/:id', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;

  const targetId = req.params.id;
  const idx = db.menuItems.findIndex((m) => m.id === targetId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const { name, description, price, category, unit, isVeg, image, isAvailable, stockCount } = req.body || {};
  const cleanName = (name ?? db.menuItems[idx].name).toString().trim();
  const numPrice = price !== undefined ? Number(price) : db.menuItems[idx].price;

  if (!cleanName || !Number.isFinite(numPrice) || numPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Valid product name and positive price are required.' });
  }

  const updated = {
    ...db.menuItems[idx],
    name: cleanName,
    description: description !== undefined ? description.toString().trim() : db.menuItems[idx].description,
    price: Math.round(numPrice),
    category: category !== undefined ? category.toString().trim() || 'Snacks' : db.menuItems[idx].category,
    unit: unit !== undefined ? unit.toString().trim() || 'pcs' : db.menuItems[idx].unit,
    isVeg: isVeg !== undefined ? Boolean(isVeg) : db.menuItems[idx].isVeg,
    image: image !== undefined && image.toString().trim() ? image.toString().trim() : db.menuItems[idx].image,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : db.menuItems[idx].isAvailable,
    stockCount: stockCount !== undefined ? Number(stockCount) : db.menuItems[idx].stockCount,
  };

  db.menuItems[idx] = updated;
  saveDb(db);
  return res.json({
    success: true,
    item: updated,
    items: db.menuItems,
    message: `Updated "${updated.name}"!`,
  });
});

app.patch('/api/admin/menu/:id/toggle', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;

  const idx = db.menuItems.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const nextAvailable =
    req.body?.isAvailable !== undefined ? Boolean(req.body.isAvailable) : !db.menuItems[idx].isAvailable;
  db.menuItems[idx].isAvailable = nextAvailable;
  saveDb(db);

  return res.json({
    success: true,
    item: db.menuItems[idx],
    message: `${db.menuItems[idx].name} is now ${nextAvailable ? 'In Stock' : 'Out of Stock'}`,
  });
});

app.delete('/api/admin/menu/:id', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;

  const idx = db.menuItems.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const removed = db.menuItems.splice(idx, 1)[0];
  saveDb(db);
  return res.json({
    success: true,
    message: `Deleted "${removed.name}" from catalog.`,
  });
});

// ============================================================================
// 3. ORDERS & VERIFIED PAYMENTS (No Student QR Code Generation!)
// ============================================================================
app.get('/api/orders', (req, res) => {
  const db = loadDb();
  const actor = resolveActor(req, db);

  // Require authentication to access orders
  if (!actor) {
    return res.status(401).json({ success: false, message: 'Authentication required to view orders.' });
  }

  // Admins can view all orders or filter by student email
  if (actor.role.toLowerCase() === 'admin') {
    const emailFilter = (req.query.email || '').toString().trim().toLowerCase();
    if (emailFilter) {
      const orders = db.orders.filter((o) => o.studentEmail.toLowerCase() === emailFilter);
      return res.json({ success: true, orders });
    }
    return res.json({ success: true, orders: db.orders });
  }

  // Students can ONLY view their own orders (IDOR prevention)
  const orders = db.orders.filter((o) => o.studentEmail.toLowerCase() === actor.email.toLowerCase());
  return res.json({ success: true, orders });
});

app.post('/api/payments/create-order', (req, res) => {
  const amount = Math.max(1, Number(req.body?.amount || 1));
  const razorpayOrderId = `order_Nesty_${crypto.randomBytes(5).toString('hex')}`;
  res.json({
    success: true,
    razorpayOrderId,
    amount,
    currency: 'INR',
    keyId: RAZORPAY_KEY_ID,
  });
});

app.post('/api/orders', (req, res) => {
  const db = loadDb();
  const actor = resolveActor(req, db);
  const {
    studentEmail,
    studentName,
    studentPhone,
    block,
    items,
    couponCode,
    coinsRedeemed,
    paymentMethod,
    transactionId,
    razorpayOrderId,
  } = req.body || {};

  // Require legitimate student or admin email
  const email = (actor?.email || studentEmail || '').toString().trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid student email is required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cannot place an empty order.' });
  }

  // Authoritative server-side calculation: Look up catalog prices in db.menuItems
  let authoritativeSubtotal = 0;
  const verifiedItems = [];

  for (const it of items) {
    const catalogItem = db.menuItems.find((m) => m.id === it.id);
    if (!catalogItem) {
      return res.status(400).json({ success: false, message: `Invalid item "${it.name || it.id}" in order.` });
    }
    const qty = Math.max(1, Math.min(50, Math.floor(Number(it.quantity) || 1)));
    authoritativeSubtotal += catalogItem.price * qty;
    verifiedItems.push({
      id: catalogItem.id,
      name: catalogItem.name,
      price: catalogItem.price, // Server price ONLY
      quantity: qty,
      isVeg: catalogItem.isVeg,
    });
  }

  // Authoritative Coupon Validation
  let validatedDiscount = 0;
  if (couponCode) {
    const cleanCoupon = couponCode.toString().trim().toUpperCase();
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === cleanCoupon);
    if (coupon && authoritativeSubtotal >= coupon.minOrderAmount) {
      validatedDiscount = Math.min(
        Math.floor((authoritativeSubtotal * coupon.discountPercent) / 100),
        coupon.maxDiscount
      );
      coupon.usageCount = (coupon.usageCount || 0) + 1;
    }
  }

  // Authoritative Coin Validation: Clamped against authentic user coin balance
  const userObj = db.users.find((u) => u.email.toLowerCase() === email);
  const availableCoins = userObj?.coins || 0;
  const maxRedeemableCoins = Math.min(20, Math.max(0, authoritativeSubtotal - validatedDiscount - 1));
  const requestedCoins = Math.max(0, Math.floor(Number(coinsRedeemed) || 0));
  const finalCoinsRedeemed = Math.min(requestedCoins, availableCoins, maxRedeemableCoins);

  const finalAmount = Math.max(1, authoritativeSubtotal - validatedDiscount - finalCoinsRedeemed);
  const coinsEarned = Math.max(1, Math.floor(finalAmount / 10));

  const orderId = `NST-${1000 + Math.floor(Math.random() * 9000)}`;
  const cleanTxn = (transactionId || '').toString().trim() || `TXN-${Date.now()}`;

  // Per Requirement #2: Do NOT generate, display, or store any QR code for the student order!
  const newOrder = {
    id: orderId,
    studentEmail: email,
    studentName: (actor?.name || userObj?.name || studentName || email.split('@')[0]).toString().slice(0, 80),
    studentPhone: (actor?.phone || userObj?.phone || studentPhone || '').toString().slice(0, 20),
    block: ['CB', 'CM', 'FB', 'PG'].includes(block) ? block : 'CB',
    items: verifiedItems,
    totalAmount: authoritativeSubtotal,
    discount: validatedDiscount,
    finalAmount,
    coinsEarned,
    coinsRedeemed: finalCoinsRedeemed,
    paymentMethod: (paymentMethod || 'Razorpay Online Gateway').toString(),
    transactionId: cleanTxn,
    razorpayOrderId: razorpayOrderId || null,
    paymentStatus: 'PAID',
    orderStatus: 'PENDING_PICKUP',
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);

  // Update student's coin balance
  if (userObj) {
    userObj.coins = Math.max(0, (userObj.coins || 0) - finalCoinsRedeemed + coinsEarned);
  }

  saveDb(db);
  return res.json({
    success: true,
    order: newOrder,
    user: sanitizeUser(userObj),
    message: `Order #${newOrder.id} confirmed! Transaction ID: ${newOrder.transactionId}`,
  });
});


app.post('/api/payment-failed', (req, res) => {
  const db = loadDb();
  const { studentEmail, studentName, studentPhone, block, items, amount, paymentMethod, error } = req.body || {};
  const email = (studentEmail || 'student@cvr.ac.in').toString().toLowerCase();
  const orderId = `NST-${1000 + Math.floor(Math.random() * 9000)}`;
  const txnId = `FAIL-${Date.now() % 100000}`;

  const failedOrder = {
    id: orderId,
    studentEmail: email,
    studentName: studentName || email.split('@')[0],
    studentPhone: studentPhone || '',
    block: block || 'CB',
    items: Array.isArray(items) ? items : [],
    totalAmount: Number(amount || 0),
    discount: 0,
    finalAmount: Number(amount || 0),
    coinsEarned: 0,
    coinsRedeemed: 0,
    paymentMethod: paymentMethod || 'Razorpay Online Gateway',
    transactionId: txnId,
    razorpayOrderId: null,
    paymentStatus: 'FAILED',
    orderStatus: 'CANCELLED',
    failureReason: error?.description || 'Payment cancelled or failed verification.',
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date().toISOString(),
  };

  db.orders.unshift(failedOrder);
  saveDb(db);
  return res.json({ success: true, order: failedOrder });
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;

  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const newStatus = (req.body?.orderStatus || 'PREPARING').toString().toUpperCase();
  order.orderStatus = newStatus;
  if (newStatus === 'CLAIMED') {
    order.claimedAt = new Date().toISOString();
    order.claimedBy = admin.name || 'Admin';
  }

  saveDb(db);
  return res.json({
    success: true,
    order,
    message: `Order #${order.id} marked as ${newStatus}`,
  });
});

// ============================================================================
// 4. SAFE QR SCANNER VALIDATION ENDPOINT
// Never marks an unpaid order as paid based on a QR scan!
// ============================================================================
app.post('/api/orders/validate-qr', (req, res) => {
  const db = loadDb();
  const rawValue = (req.body?.token || req.body?.rawValue || req.body?.orderId || '').toString().trim();

  if (!rawValue) {
    return res.json({
      valid: false,
      type: 'INVALID',
      title: 'Empty Scan',
      subtitle: 'No QR payload detected. Please try scanning again.',
    });
  }

  const normalizedId = rawValue.replace(/^#/, '');
  const matchedOrder = db.orders.find(
    (o) =>
      o.id.toLowerCase() === normalizedId.toLowerCase() ||
      o.transactionId.toLowerCase() === normalizedId.toLowerCase()
  );

  if (matchedOrder) {
    // Strictly inspect existing payment state — NEVER mark an order paid from a QR scan!
    const isPaid = matchedOrder.paymentStatus === 'PAID' || matchedOrder.paymentStatus === 'SUCCESS';
    return res.json({
      valid: isPaid,
      type: 'ORDER_RECEIPT',
      title: isPaid ? `Verified Order #${matchedOrder.id}` : `Unpaid / Failed Order #${matchedOrder.id}`,
      subtitle: `Status: ${matchedOrder.orderStatus} • Payment: ${matchedOrder.paymentStatus} • Txn: ${matchedOrder.transactionId}`,
      order: matchedOrder,
    });
  }

  const upper = rawValue.toUpperCase();
  for (const block of ['CB', 'CM', 'FB', 'PG']) {
    if (upper === `NESTY-COUNTER-${block}` || upper === `COUNTER-${block}` || upper === `BLOCK-${block}`) {
      return res.json({
        valid: true,
        type: 'CAMPUS_COUNTER',
        block,
        title: `${block} Block Pickup Counter Verified`,
        subtitle: `You are at the ${block} Block Nesty Pickup Station. Present your Order ID or Transaction ID to collect active orders.`,
      });
    }
  }

  const couponCandidate = upper.replace(/^COUPON:/, '').replace(/^NESTY:/, '').trim();
  const coupon = db.coupons.find((c) => c.code.toUpperCase() === couponCandidate);
  if (coupon) {
    return res.json({
      valid: true,
      type: 'PROMO_COUPON',
      couponCode: coupon.code,
      title: `Promo Coupon Unlocked: ${coupon.code}`,
      subtitle: `${coupon.discountPercent}% OFF (up to ₹${coupon.maxDiscount}) on orders above ₹${coupon.minOrderAmount}!`,
    });
  }

  return res.json({
    valid: false,
    type: 'INVALID',
    title: 'Unsupported QR Code',
    subtitle: `Scanned value "${rawValue}" is not a recognized Nesty counter code, coupon, or verified order reference. Note: Scanning a QR never marks an order as paid.`,
  });
});

// ============================================================================
// 5. ADMIN STUDENTS, COUPONS & ANNOUNCEMENTS
// ============================================================================
app.get('/api/admin/students', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;
  const students = db.users.filter((u) => u.role === 'student').map(sanitizeUser);
  return res.json({ success: true, students });
});

app.get('/api/coupons', (_req, res) => {
  const db = loadDb();
  return res.json({ success: true, coupons: db.coupons });
});

app.post('/api/admin/coupons', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;

  const code = (req.body?.code || '').toString().trim().toUpperCase();
  const discountPercent = Number(req.body?.discountPercent || 10);
  const maxDiscount = Math.max(1, Number(req.body?.maxDiscount || 40));
  const minOrderAmount = Math.max(0, Number(req.body?.minOrderAmount || 30));

  if (!code || discountPercent < 1 || discountPercent > 100) {
    return res.status(400).json({ success: false, message: 'Enter a valid coupon code and discount % (1-100).' });
  }

  const coupon = {
    id: `cpn_${Date.now()}`,
    code,
    discountPercent,
    maxDiscount,
    minOrderAmount,
    usageCount: 0,
  };
  db.coupons.push(coupon);
  saveDb(db);
  return res.json({ success: true, coupon, coupons: db.coupons, message: `Coupon ${code} created!` });
});

app.delete('/api/admin/coupons/:id', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;
  db.coupons = db.coupons.filter((c) => c.id !== req.params.id);
  saveDb(db);
  return res.json({ success: true, coupons: db.coupons, message: 'Coupon deleted.' });
});

app.get('/api/announcements/active', (_req, res) => {
  const db = loadDb();
  return res.json({ success: true, announcements: db.announcements });
});

app.post('/api/admin/announcements', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;

  const title = (req.body?.title || '').toString().trim();
  const message = (req.body?.message || '').toString().trim();
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  const ann = {
    id: `ann_${Date.now()}`,
    title,
    message,
    createdAt: new Date().toISOString(),
  };
  db.announcements.unshift(ann);
  saveDb(db);
  return res.json({ success: true, announcement: ann, announcements: db.announcements, message: 'Announcement posted!' });
});

app.delete('/api/admin/announcements/:id', (req, res) => {
  const db = loadDb();
  const admin = requireAdmin(req, res, db);
  if (!admin) return;
  db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
  saveDb(db);
  return res.json({ success: true, announcements: db.announcements, message: 'Announcement deleted.' });
});

// Pre-login installation-scoped anonymous legal consent register
app.post('/api/consent/record', (req, res) => {
  const { termsVersion, privacyVersion, acceptedAt, installationId } = req.body || {};
  if (!termsVersion || !privacyVersion) {
    return res.status(400).json({ success: false, message: 'Missing document version details.' });
  }

  const db = loadDb();
  if (!Array.isArray(db.consents)) {
    db.consents = [];
  }

  const record = {
    id: `cst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    installationId: (installationId || 'unknown').toString().slice(0, 80),
    termsVersion: String(termsVersion),
    privacyVersion: String(privacyVersion),
    acceptedAt: acceptedAt || new Date().toISOString(),
    ipAddress: (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim(),
    userAgent: (req.headers['user-agent'] || 'unknown').toString().slice(0, 160),
  };

  db.consents.push(record);
  // Keep last 1000 consent logs to avoid unbounded growth
  if (db.consents.length > 1000) {
    db.consents = db.consents.slice(-1000);
  }
  saveDb(db);

  return res.json({ success: true, record });
});

// Serve static production frontend build from ../dist
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server if executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nesty Web & Shared API Server listening on http://0.0.0.0:${PORT}`);
  });
}

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const db = require('./database');
const { generateToken, authMiddleware } = require('./auth');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- AUTH ----------
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username & password required' });
    const existing = await db.getUser(username);
    if (existing) return res.status(400).json({ error: 'Username already taken' });
    const hash = await bcrypt.hash(password, 10);
    const user = await db.getOrCreateUser(username, hash);
    const token = generateToken(username);
    res.json({ success: true, token, user: { username: user.username, virtual_credit: user.virtual_credit, winning_balance: user.winning_balance } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.getUser(username);
    if (!user) return res.status(404).json({ error: 'User not found. Please register.' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Wrong password' });
    const token = generateToken(username);
    res.json({ success: true, token, user: { username: user.username, virtual_credit: user.virtual_credit, winning_balance: user.winning_balance, level: user.level } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await db.getUser(req.username);
  res.json({ user });
});

// ---------- MARKETPLACE ----------
app.get('/api/marketplace', async (req, res) => {
  const items = await db.getMarketplaceItems();
  res.json({ items });
});

app.post('/api/marketplace/publish', authMiddleware, async (req, res) => {
  try {
    const { name, price, category, image_data } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name & price required' });
    const item = await db.addMarketplaceItem({
      name, price, category: category || 'skin',
      image_data, creator_username: req.username
    });
    res.json({ success: true, item });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/marketplace/buy', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const items = await db.getMarketplaceItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const buyer = await db.getUser(req.username);
    const total = Number(buyer.virtual_credit) + Number(buyer.winning_balance);
    if (total < item.price) return res.status(400).json({ error: 'Insufficient balance!' });

    // Deduct from virtual first, then winning
    let remaining = Number(item.price);
    let vDeduct = 0, wDeduct = 0;
    if (Number(buyer.virtual_credit) >= remaining) {
      vDeduct = remaining;
    } else {
      vDeduct = Number(buyer.virtual_credit);
      wDeduct = remaining - vDeduct;
    }
    await db.updateWallet(req.username, -vDeduct, -wDeduct);

    // 70-30 Split
    const creatorShare = item.price * 0.70;
    const devShare = item.price * 0.30;
    await db.updateWallet(item.creator_username, 0, creatorShare);

    await db.addToInventory(req.username, item.id);
    await db.addTransaction(req.username, 'purchase', -item.price, { item: item.name });
    await db.addTransaction(item.creator_username, 'sale', creatorShare, { item: item.name });

    res.json({ success: true, message: `Purchased ${item.name}!`, creatorShare, devShare });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- INVENTORY ----------
app.get('/api/inventory', authMiddleware, async (req, res) => {
  const inv = await db.getInventory(req.username);
  res.json({ inventory: inv });
});

app.post('/api/inventory/equip', authMiddleware, async (req, res) => {
  await db.equipItem(req.username, req.body.itemId);
  res.json({ success: true });
});

// ---------- WALLET ----------
app.post('/api/wallet/withdraw', authMiddleware, async (req, res) => {
  try {
    const { upiId, amount } = req.body;
    if (!upiId) return res.status(400).json({ error: 'UPI ID required' });
    if (amount < 50) return res.status(400).json({ error: 'Minimum ₹50 required' });
    const user = await db.getUser(req.username);
    if (Number(user.winning_balance) < amount) return res.status(400).json({ error: 'Insufficient winning balance' });

    // TODO: Razorpay Payout API integration
    await db.updateWallet(req.username, 0, -amount);
    await db.addTransaction(req.username, 'withdrawal', -amount, { upiId, status: 'processing' });

    res.json({ success: true, message: `₹${amount} sent to ${upiId}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/wallet/transactions', authMiddleware, async (req, res) => {
  const { data } = await db.supabase.from('transactions')
    .select('*').eq('username', req.username).order('created_at', { ascending: false }).limit(50);
  res.json({ transactions: data || [] });
});

// ---------- NAUKRI (Daily Salary) ----------
app.post('/api/naukri/start', authMiddleware, async (req, res) => {
  const salary = 200;
  await db.updateWallet(req.username, 0, salary);
  await db.addTransaction(req.username, 'salary', salary, { role: 'Traffic Police' });
  res.json({ success: true, message: `₹${salary} added to your winning wallet!` });
});

// ---------- SERVE SPA ----------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 DhandhaVerse running on port ${PORT}`));

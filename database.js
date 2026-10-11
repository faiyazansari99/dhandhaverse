const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get or Create User
async function getOrCreateUser(username, passwordHash) {
  const { data, error } = await supabase
    .from('users').select('*').eq('username', username).single();
  if (error && error.code === 'PGRST116') {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ username, password_hash: passwordHash }])
      .select().single();
    if (insertError) throw insertError;
    return newUser;
  }
  if (error) throw error;
  return data;
}

async function getUser(username) {
  const { data, error } = await supabase
    .from('users').select('*').eq('username', username).single();
  if (error) return null;
  return data;
}

async function updateWallet(username, virtualDelta = 0, winningDelta = 0) {
  const user = await getUser(username);
  if (!user) throw new Error('User not found');
  const { data, error } = await supabase
    .from('users')
    .update({
      virtual_credit: Number(user.virtual_credit) + virtualDelta,
      winning_balance: Number(user.winning_balance) + winningDelta
    })
    .eq('username', username).select().single();
  if (error) throw error;
  return data;
}

async function addTransaction(username, type, amount, meta = {}) {
  await supabase.from('transactions').insert([{ username, type, amount, meta }]);
}

async function getMarketplaceItems() {
  const { data } = await supabase.from('marketplace_items')
    .select('*').order('created_at', { ascending: false });
  return data || [];
}

async function addMarketplaceItem(item) {
  const { data, error } = await supabase.from('marketplace_items')
    .insert([item]).select().single();
  if (error) throw error;
  return data;
}

async function getInventory(username) {
  const { data } = await supabase.from('inventory')
    .select('*, marketplace_items(*)').eq('username', username);
  return data || [];
}

async function addToInventory(username, itemId) {
  await supabase.from('inventory').insert([{ username, item_id: itemId }]);
}

async function equipItem(username, itemId) {
  await supabase.from('inventory').update({ equipped: false }).eq('username', username);
  await supabase.from('inventory').update({ equipped: true })
    .eq('username', username).eq('item_id', itemId);
}

module.exports = {
  supabase, getOrCreateUser, getUser, updateWallet, addTransaction,
  getMarketplaceItems, addMarketplaceItem, getInventory, addToInventory, equipItem
};

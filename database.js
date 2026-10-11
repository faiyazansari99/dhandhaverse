/**
 * DhandhaVerse - Supabase & PostgreSQL Database Client (v1.0)
 * Manages secure cloud connection for users, wallets, and UGC marketplace assets.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase Project Credentials (Aap apne Supabase dashboard se yahan keys dal sakte hain)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your-supabase-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Helper Database Functions for DhandhaVerse
 */

// 1. Get or Create User in Cloud DB
async function getOrCreateUser(username) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error && error.code === 'PGRST116') {
        // User not found, create new with ₹10 virtual bonus
        const { data: newUser, insertError } = await supabase
            .from('users')
            .insert([{ username: username, virtual_credit: 10.00, winning_balance: 0.00 }])
            .select()
            .single();
        
        if (insertError) throw insertError;
        return newUser;
    }
    if (error) throw error;
    return data;
}

// 2. Update Wallet Balance (70-30 Split execution)
async function updateWalletBalance(username, winningDelta) {
    const user = await getOrCreateUser(username);
    const newBalance = user.winning_balance + winningDelta;

    const { data, error } = await supabase
        .from('users')
        .update({ winning_balance: newBalance })
        .eq('username', username)
        .select()
        .single();

    if (error) throw error;
    return data;
}

module.exports = {
    supabase,
    getOrCreateUser,
    updateWalletBalance
};

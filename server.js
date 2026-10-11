/**
 * DhandhaVerse - Backend Server & 70-30 Economy Engine (v1.0)
 * Handles User Authentication, UGC Marketplace Transactions, and UPI Payouts.
 */

const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// In-Memory Database Simulation (Later to be replaced with Supabase / PostgreSQL)
let usersDatabase = {};
let marketplaceItems = [
    { id: 1, name: "Satara Gold Auto Skin", creator: "Gamer_Satara", price: 50, verified: true },
    { id: 2, name: "Bhaiya Vada Pav Emote", creator: "Creator_Rohit", price: 20, verified: true }
];

// 1. User Register / Login Endpoint
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username is required!" });
    }

    if (!usersDatabase[username]) {
        usersDatabase[username] = {
            username: username,
            virtualCredit: 10.00, // Free signup bonus (Non-withdrawable)
            winningBalance: 0.00, // Real cash
            upiId: "",
            inventory: []
        };
    }

    res.json({
        success: true,
        message: "Welcome to DhandhaVerse!",
        user: usersDatabase[username]
    });
});

// 2. Marketplace Buy Endpoint (Enforcing 70% Creator / 30% Dev Model)
app.post('/api/buy-item', (req, res) => {
    const { buyerUsername, itemId } = req.body;
    
    const item = marketplaceItems.find(i => i.id === itemId);
    if (!item) {
        return res.status(404).json({ error: "Item not found!" });
    }

    const buyer = usersDatabase[buyerUsername];
    if (!buyer) {
        return res.status(404).json({ error: "Buyer not found!" });
    }

    const price = item.price;
    
    // Calculate 70-30 Split
    const creatorShare = price * 0.70; // 70% to Creator
    const devCommission = price * 0.30;  // 30% to Developer (Platform Cut)

    // Update Creator Balance if registered
    if (usersDatabase[item.creator]) {
        usersDatabase[item.creator].winningBalance += creatorShare;
    }

    // Add item to buyer inventory
    buyer.inventory.push(item);

    res.json({
        success: true,
        message: `Successfully purchased ${item.name}!`,
        splitDetails: {
            itemPrice: price,
            creatorPayout: creatorShare,
            devCommission: devCommission
        },
        buyerWallet: buyer
    });
});

// 3. UPI Withdrawal Payout Endpoint
app.post('/api/withdraw', (req, res) => {
    const { username, upiId, amount } = req.body;

    const user = usersDatabase[username];
    if (!user) {
        return res.status(404).json({ error: "User not found!" });
    }

    if (amount < 50) {
        return res.status(400).json({ error: "Minimum withdrawal amount is ₹50!" });
    }

    if (user.winningBalance < amount) {
        return res.status(400).json({ error: "Insufficient winning balance!" });
    }

    // Deduct balance & update UPI ID
    user.winningBalance -= Number(amount);
    user.upiId = upiId;

    // Here manual or Razorpay Payout API trigger will execute
    res.json({
        success: true,
        message: `Payout of ₹${amount} successfully processed to UPI: ${upiId}`,
        remainingBalance: user.winningBalance
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`DhandhaVerse Server is running smoothly on port ${PORT}`);
});

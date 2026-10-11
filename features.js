/**
 * DhandhaVerse - Bawaal Features Controller (v1.0)
 * Handles Gully Builder, Sarkari Naukri, and KBC Event Popups.
 */

// Global Modal State Manager
function openFeatureModal(featureType) {
    // Check if modal container already exists, else create it dynamically
    let modalOverlay = document.getElementById('dynamic-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'dynamic-modal-overlay';
        modalOverlay.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4';
        document.body.appendChild(modalOverlay);
    }

    let modalContent = '';

    if (featureType === 'builder') {
        modalContent = `
            <div class="bg-slate-900 border border-slate-800 w-full max-w-sm p-5 rounded-3xl space-y-4 shadow-2xl">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2 text-amber-400">
                        <i data-lucide="hammer" class="w-5 h-5"></i>
                        <h2 class="text-sm font-bold text-white">Gully Builder Tool</h2>
                    </div>
                    <button onclick="closeModal()" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-[11px] text-slate-400">Mobile par 2 minute me skin, bike, ya ghar design karo aur marketplace par bech kar 70% cash pao!</p>
                <div class="space-y-2">
                    <input type="text" id="asset-name" placeholder="Item Name (e.g. Neo Rickshaw)" class="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500">
                    <input type="number" id="asset-price" placeholder="Selling Price (₹)" class="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500">
                </div>
                <button onclick="publishAsset()" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition">
                    Publish & Earn (70% Share)
                </button>
            </div>
        `;
    } else if (featureType === 'naukri') {
        modalContent = `
            <div class="bg-slate-900 border border-slate-800 w-full max-w-sm p-5 rounded-3xl space-y-4 shadow-2xl">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2 text-blue-400">
                        <i data-lucide="shield-check" class="w-5 h-5"></i>
                        <h2 class="text-sm font-bold text-white">Sarkari Naukri Mode</h2>
                    </div>
                    <button onclick="closeModal()" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-[11px] text-slate-400">Traffic Police ya Doctor bano. Daily duty poori karo aur fix salary pao!</p>
                <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div class="flex justify-between text-xs"><span class="text-slate-400">Role:</span> <span class="font-bold text-white">Traffic Police</span></div>
                    <div class="flex justify-between text-xs"><span class="text-slate-400">Shift:</span> <span class="font-bold text-white">4 Hours</span></div>
                    <div class="flex justify-between text-xs"><span class="text-slate-400">Daily Salary:</span> <span class="font-bold text-emerald-400">₹200.00</span></div>
                </div>
                <button onclick="startDuty()" class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition">
                    Duty Shuru Karo
                </button>
            </div>
        `;
    } else if (featureType === 'events') {
        modalContent = `
            <div class="bg-slate-900 border border-slate-800 w-full max-w-sm p-5 rounded-3xl space-y-4 shadow-2xl">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2 text-amber-400">
                        <i data-lucide="trophy" class="w-5 h-5"></i>
                        <h2 class="text-sm font-bold text-white">KBC Server Event</h2>
                    </div>
                    <button onclick="closeModal()" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-[11px] text-slate-400">Har Sunday live quiz khelo. Top 1000 users ko real cash rewards milenge. Entry free hai!</p>
                <div class="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-center space-y-1">
                    <div class="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Next Live Quiz in</div>
                    <div class="text-lg font-extrabold text-white" id="countdown-timer">02:15:34</div>
                </div>
                <button onclick="registerEvent()" class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition">
                    Muft Entry Register Karo
                </button>
            </div>
        `;
    }

    modalOverlay.innerHTML = modalContent;
    modalOverlay.style.display = 'flex';
    
    // Re-initialize icons inside modal
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('dynamic-modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}

function publishAsset() {
    const name = document.getElementById('asset-name').value.trim();
    const price = document.getElementById('asset-price').value.trim();
    if(!name || !price) {
        alert("Kripya item ka naam aur price sahi se bharein!");
        return;
    }
    alert("Aapka asset '" + name + "' marketplace par publish ho gaya hai! Bikne par 70% share aapke wallet me aayega.");
    closeModal();
}

function startDuty() {
    alert("Sarkari Naukri duty shuru ho gayi hai! Shift khatm hone par salary winning wallet me add ho jayegi.");
    closeModal();
}

function registerEvent() {
    alert("Aapne KBC Sunday Event ke liye successfully free register kar liya hai!");
    closeModal();
}

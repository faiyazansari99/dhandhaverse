const API = window.location.origin;
const token = () => localStorage.getItem('dv_token');
const username = () => localStorage.getItem('dv_username');

function setAuth(t, u) { localStorage.setItem('dv_token', t); localStorage.setItem('dv_username', u); }
function logout() { localStorage.clear(); location.href = 'index.html'; }

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token()) headers['Authorization'] = `Bearer ${token()}`;
  const res = await fetch(API + path, { ...options, headers });
  return res.json();
}

function toast(msg, type = 'success') {
  const div = document.createElement('div');
  div.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[999] px-4 py-3 rounded-xl text-xs font-bold shadow-2xl transition-all ${type==='success'?'bg-emerald-500 text-slate-950':'bg-red-500 text-white'}`;
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

async function handleAuth() {
  const u = document.getElementById('username-input').value.trim();
  const p = document.getElementById('password-input').value.trim();
  if (!u || !p) return toast('Bhai, dono field bharo!', 'error');
  const path = authMode === 'login' ? '/api/login' : '/api/register';
  const data = await apiFetch(path, { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
  if (data.error) return toast(data.error, 'error');
  setAuth(data.token, data.user.username);
  toast('Welcome ' + data.user.username + '!');
  setTimeout(() => location.href = 'index.html', 800);
}

async function loadUser() {
  if (!token()) { document.getElementById('login-screen').style.display = 'flex'; return; }
  document.getElementById('login-screen').style.display = 'none';
  const data = await apiFetch('/api/me');
  if (data.user) {
    document.getElementById('display-username').innerText = data.user.username;
    document.getElementById('user-avatar-initial').innerText = data.user.username.substring(0,2).toUpperCase();
    document.getElementById('virtual-wallet').innerText = '₹' + Number(data.user.virtual_credit).toFixed(2);
    document.getElementById('winning-wallet').innerText = '₹' + Number(data.user.winning_balance).toFixed(2);
  }
}

async function startNaukri() {
  const data = await apiFetch('/api/naukri/start', { method: 'POST' });
  if (data.error) return toast(data.error, 'error');
  toast(data.message);
  loadUser();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-screen')) loadUser();
  });
}

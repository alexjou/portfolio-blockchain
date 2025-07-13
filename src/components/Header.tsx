
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import '../styles/animations.css';

const NAV_LINKS = [
  { to: '/seedguard', label: '1. SeedGuard', icon: '🛡️' },
  { to: '/kipubank', label: '2. KipuBank', icon: '🏦' },
  { to: '/cofre', label: '3. Cofre', icon: '💰' },
];

const Header: React.FC = () => {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const atualizarWallet = async () => {
      if (!(window as any).ethereum) {
        setWalletName('');
        setWalletBalance('');
        setIsConnected(false);
        return;
      }
      try {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          // Busca nome e saldo
          const provider = new ethers.BrowserProvider(eth);
          const balance = await provider.getBalance(accounts[0]);
          setWalletBalance(parseFloat(ethers.formatEther(balance)).toFixed(4) + ' ETH');
          // Busca nome ENS
          let ensName: string | null = '';
          try {
            ensName = await provider.lookupAddress(accounts[0]);
          } catch { }
          setWalletName((ensName ?? '') || accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4));
        } else {
          setIsConnected(false);
          setWalletName('');
          setWalletBalance('');
        }
      } catch {
        setIsConnected(false);
        setWalletName('');
        setWalletBalance('');
      }
    };
    atualizarWallet();
    window.addEventListener('walletUpdated', atualizarWallet);
    return () => {
      window.removeEventListener('walletUpdated', atualizarWallet);
    };
  }, []);

  return (
    <header className="w-full py-4 px-4 bg-black/40 backdrop-blur-lg shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">
        {/* Logo e nome */}
        <div className="flex flex-row items-center gap-3">
          <Link to="/">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-purple-700 flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-lg">EK</span>
            </div>
          </Link>
          <div className="text-sm text-white/70">Álex • Blockchain • Recife</div>
        </div>

        {/* Navegação centralizada (desktop) */}
        <nav className="hidden md:flex flex-row justify-center items-center gap-8 flex-1">
          {NAV_LINKS.map((link) => (
            <div key={link.to} className="relative">
              <Link
                to={link.to}
                className={`px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-700 to-blue-700 hover:from-yellow-400 hover:to-purple-600 transition-colors shadow-md flex items-center gap-2 ${location.pathname === link.to ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </div>
          ))}
        </nav>

        {/* Botão hamburger (mobile) */}
        <div className="flex md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label="Abrir menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Conta/metamask */}
        <div className="flex items-center justify-end min-w-[180px]">
          {isConnected ? (
            <button className="relative bg-gradient-to-r from-yellow-400 to-purple-700 text-white px-4 py-2 rounded-md flex items-center shadow-md font-semibold gap-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {walletName}
                <span className="ml-2 text-yellow-300 font-mono text-sm">{walletBalance}</span>
              </span>
              <span className="bg-green-500 h-3 w-3 rounded-full inline-block relative ml-2"></span>
            </button>
          ) : (
            <button className="bg-gradient-to-r from-yellow-400 to-purple-700 text-white px-6 py-2 rounded-md shadow-md font-semibold">
              Conectar Carteira
            </button>
          )}
        </div>
      </div>
      {/* Drawer mobile */}
      <AnimatePresence>
        {mobileMenu && (
          <nav className="fixed top-0 right-0 w-64 h-full bg-gradient-to-b from-purple-900 to-blue-900 shadow-2xl z-50 flex flex-col p-8 gap-6">
            <button
              className="self-end text-white mb-8"
              onClick={() => setMobileMenu(false)}
              aria-label="Fechar menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-700 to-blue-700 hover:from-yellow-400 hover:to-purple-600 transition-colors shadow-md flex items-center gap-3 text-lg ${location.pathname === link.to ? 'ring-2 ring-yellow-400' : ''}`}
                onClick={() => setMobileMenu(false)}
              >
                <span className="text-2xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

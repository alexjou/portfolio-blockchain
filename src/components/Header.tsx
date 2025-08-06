
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import '../styles/animations.css';
import logoEther from '../assets/logoEther.png';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import LanguageSwitcherCompact from './LanguageSwitcherCompact';

const getNavLinks = (t: any) => [
  { to: '/seedguard', label: `1. ${t('projects.seedGuard')}`, icon: '🛡️' },
  { to: '/kipubank', label: `2. ${t('projects.kipuBank')}`, icon: '🏦' },
  { to: '/cofre', label: `3. ${t('projects.cofre')}`, icon: '💰' },
  { to: '/simpledex', label: `4. ${t('projects.simpleDex')}`, icon: '🔄' },
];

const Header: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  // Função para conectar carteira
  const conectarCarteira = async () => {
    if (!(window as any).ethereum) {
      alert(t('wallet.metamask_not_found'));
      return;
    }
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        const provider = new ethers.BrowserProvider(eth);
        const balance = await provider.getBalance(accounts[0]);
        setWalletBalance(parseFloat(ethers.formatEther(balance)).toFixed(4) + ' ETH');
        let ensName: string | null = '';
        try {
          ensName = await provider.lookupAddress(accounts[0]);
        } catch { }
        setWalletName((ensName ?? '') || accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4));
        // Dispara evento para atualizar outros componentes se necessário
        window.dispatchEvent(new Event('walletUpdated'));
      }
    } catch (err) {
      alert(t('wallet.connect_error'));
    }
  };

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
    <header className="w-full py-4 px-4 bg-black/70 backdrop-blur-lg shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4 relative">
        {/* Logo e nome */}
        <div className="flex flex-row items-center gap-3">
          <Link to="/">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <img src={logoEther} alt="Logo Ethereum" className="w-20 h-20 object-contain animate-spin-coin" />
              <style>{`
        @keyframes spin-coin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-spin-coin {
          animation: spin-coin 2.5s linear infinite;
          transform-style: preserve-3d;
        }
      `}</style>
            </div>
          </Link>
          <div className="text-sm text-white/70">Álex Joubert • Blockchain</div>
        </div>

        {/* Navegação centralizada (desktop) */}
        <nav className="hidden md:flex flex-row justify-center items-center gap-8 flex-1">
          {getNavLinks(t).map((link) => (
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

          {/* Seletor de idioma */}
          <div className="hidden md:flex ml-4">
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Botão hamburger e seletor de idioma (mobile) alinhados à direita */}
        <div className="flex md:hidden absolute right-0 top-0 h-full items-center pr-2 gap-2">
          <LanguageSwitcherCompact />
          <button
            className="text-white focus:outline-none"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label={t('header.open_menu')}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Conta/metamask */}
        <div className="hidden md:flex items-center justify-end min-w-[180px]">
          {!mobileMenu && (
            isConnected ? (
              <button className="relative bg-gradient-to-r from-green-400 to-blue-700 text-white px-4 py-2 rounded-md flex items-center shadow-md font-semibold gap-2">
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
              <button
                className="bg-gradient-to-r from-yellow-400 to-purple-700 text-white px-6 py-2 rounded-md shadow-md font-semibold cursor-pointer transition-transform active:scale-95 hover:brightness-110"
                onClick={conectarCarteira}
                type="button"
                title="Conectar carteira Ethereum"
              >
                Conectar Carteira
              </button>
            )
          )}
        </div>
      </div>
      {/* Drawer mobile */}
      <AnimatePresence>
        {mobileMenu && (
          <nav className="fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-lg z-50 flex flex-col items-center justify-start pt-8">
            <div className="w-full flex justify-between items-center px-6 mb-8">
              <div className="text-white font-bold text-lg">Álex Joubert • Blockchain</div>
              <button
                className="text-white"
                onClick={() => setMobileMenu(false)}
                aria-label="Fechar menu"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="bg-black/80 rounded-xl p-4 w-4/5 max-w-xs flex flex-col items-center gap-6">
                {getNavLinks(t).map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-700 to-blue-700 hover:from-yellow-400 hover:to-purple-600 transition-colors shadow-md flex items-center gap-3 text-lg justify-center ${location.pathname === link.to ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setMobileMenu(false)}
                  >
                    <span className="text-2xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}

                {/* Botão/metamask dentro do menu mobile */}
                {isConnected ? (
                  <button className="mt-8 relative bg-gradient-to-r from-green-400 to-blue-700 text-white px-4 py-3 rounded-lg flex items-center shadow-md font-semibold gap-2 w-full">
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
                  <button
                    className="mt-8 bg-gradient-to-r from-yellow-400 to-purple-700 text-white px-6 py-3 rounded-lg shadow-md font-semibold cursor-pointer transition-transform active:scale-95 hover:brightness-110 w-full"
                    onClick={conectarCarteira}
                    type="button"
                    title={t('wallet.connect')}
                  >
                    {t('wallet.connect')}
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

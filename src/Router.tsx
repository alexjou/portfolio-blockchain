
import { createHashRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SeedGuardPage from './pages/SeedGuard';
import Header from './components/Header';
import { useWallet } from './hooks/useWallet';
import React, { createContext } from 'react';
import type { UseWalletReturn } from './types/interfaces';

// Contexto para carteira
export const WalletContext = createContext<UseWalletReturn | undefined>(undefined);

// Layout base com Header e provider do hook de carteira
const LayoutBase = ({ children }: { children: React.ReactNode }) => {
  const wallet = useWallet();
  return (
    <WalletContext.Provider value={wallet}>
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
        <Header />
        {children}
      </div>
    </WalletContext.Provider>
  );
};



import KipuBankPage from './pages/KipuBank';
import Cofre from './pages/Cofre';
import BlockChain3D from "./pages/BlockChain3D";
import SimpleDex from "./pages/SimpleDex";

const router = createHashRouter([
  {
    path: '/',
    element: (
      <LayoutBase>
        <HomePage />
      </LayoutBase>
    ),
  },
  {
    path: '/seedguard',
    element: (
      <LayoutBase>
        <SeedGuardPage />
      </LayoutBase>
    ),
  },
  {
    path: '/kipubank',
    element: (
      <LayoutBase>
        <KipuBankPage />
      </LayoutBase>
    ),
  },
  {
    path: '/cofre',
    element: (
      <LayoutBase>
        <Cofre />
      </LayoutBase>
    ),
  },
  {
    path: '/blockchain3d',
    element: (
      <LayoutBase>
        <BlockChain3D />
      </LayoutBase>
    ),
  },
  {
    path: '/simpledex',
    element: (
      <LayoutBase>
        <SimpleDex />
      </LayoutBase>
    ),
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;

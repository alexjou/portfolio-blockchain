import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import type { UseWalletReturn } from '../types/interfaces';

export const useWallet = (): UseWalletReturn => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connect = async () => {
    if (!window.ethereum) {
      alert('MetaMask não encontrada! Instale a extensão MetaMask para continuar.');
      return;
    }

    try {
      setIsConnecting(true);
      const ethereumProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const network = await ethereumProvider.getNetwork();
      const account = accounts[0];
      const balance = await ethereumProvider.getBalance(account);

      setProvider(ethereumProvider);
      setAccount(account);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Erro ao conectar à carteira:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance('0');
    setChainId(null);
    setProvider(null);
  };

  // Efeito para atualizar informações quando mudar de conta
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (args: unknown[]) => {
      const accounts = args as string[];
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = (args: unknown[]) => {
      const chainId = args[0] as string;
      setChainId(parseInt(chainId, 16));
    };

    const updateBalance = async (address: string) => {
      if (!provider) return;
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider]);

  return {
    account,
    balance,
    chainId,
    connect,
    disconnect,
    isConnected: !!account,
    isConnecting,
    provider
  };
};

// A tipagem para window.ethereum está definida em types/interfaces.ts

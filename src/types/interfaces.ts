import { ethers } from 'ethers';
import { Vector3 } from 'three';

// Interface para o hook useWallet
export interface UseWalletReturn {
  account: string | null;
  balance: string;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
}

// Tipagem para window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (eventName: string, handler: (args: unknown[]) => void) => void;
      removeListener: (eventName: string, handler: (args: unknown[]) => void) => void;
    };
  }
}

// Interfaces para componentes 3D
export interface EthereumModelProps {
  position?: [number, number, number];
  scale?: [number, number, number];
}

export interface FloatingTextProps {
  position: Vector3;
  text: string;
}

// Interfaces para cards de projeto
export interface ProjectCardProps {
  title: string;
  description: string;
  icon: string;
  to: string;
}

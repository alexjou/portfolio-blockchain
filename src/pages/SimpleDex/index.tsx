

import React, { useState, useEffect } from "react";
import { NumericFormat } from "react-number-format";
import type { NumberFormatValues } from "react-number-format";
import { ethers } from "ethers";
import Footer from "../../components/Footer";
import { useNotification } from "../../context/NotificationContext";
import simpleDexAbiJson from "./SimpleDEX.abi.json";
import tokenAAbiJson from "./TokenA.abi.json";
import tokenBAbiJson from "./TokenB.abi.json";
import { useTranslation } from 'react-i18next';

// Função utilitária para validar endereço Ethereum
const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

const LOCAL_STORAGE_KEY = "simpleDexCustomAddresses";

const DEFAULT_ADDRESSES = {
  SIMPLE_DEX_ADDRESS: "0xAcCF736f18a8E78c1CBC2F808E5c735538EaAA10",
  TOKEN_A_ADDRESS: "0x61Cfcf1919756e61B4bAE0b65c0458b467F5031F",
  TOKEN_B_ADDRESS: "0xa91B3ccb46365003Ca83B6145908f44Bd2ebd21a"
};

// Função utilitária para formatar valores de token
const formatarValorToken = (valor: string | number) => {
  const num = Number(valor);
  if (isNaN(num)) return valor;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const SimpleDex: React.FC = () => {
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  const [precoTokenA, setPrecoTokenA] = useState<string | null>(null);
  const [precoTokenB, setPrecoTokenB] = useState<string | null>(null);

  // Estados para liquidez
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [amountARemove, setAmountARemove] = useState("");
  const [amountBRemove, setAmountBRemove] = useState("");

  // Estados para swap
  const [amountAIn, setAmountAIn] = useState("");
  const [amountBIn, setAmountBIn] = useState("");

  // Estados para mint/burn
  const [mintAmountA, setMintAmountA] = useState("");
  const [mintAmountB, setMintAmountB] = useState("");
  const [burnAmountA, setBurnAmountA] = useState("");
  const [burnAmountB, setBurnAmountB] = useState("");

  // Estados de controle
  const [statusMsg, setStatusMsg] = useState(t('simpledex.wallet_not_connected'));
  const [showStatus, setShowStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState<string>("");

  // Estados para saldos
  const [tokenABalance, setTokenABalance] = useState("0");
  const [tokenBBalance, setTokenBBalance] = useState("0");
  const [reserveA, setReserveA] = useState("0");
  const [reserveB, setReserveB] = useState("0");
  const [isOwner, setIsOwner] = useState(false);

  // Estados para exibir os contratos .sol
  const [showSimpleDexCode, setShowSimpleDexCode] = useState(false);
  const [showTokenACode, setShowTokenACode] = useState(false);
  const [showTokenBCode, setShowTokenBCode] = useState(false);
  const [simpleDexCode, setSimpleDexCode] = useState('');
  const [tokenACode, setTokenACode] = useState('');
  const [tokenBCode, setTokenBCode] = useState('');

  // Estados para endereços customizáveis
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES;
  });
  const [editMode, setEditMode] = useState(false);
  const [editAddresses, setEditAddresses] = useState(addresses);
  const [validating, setValidating] = useState(false);

  // Atualizar estados dependentes dos endereços
  const SIMPLE_DEX_ADDRESS = addresses.SIMPLE_DEX_ADDRESS;
  const TOKEN_A_ADDRESS = addresses.TOKEN_A_ADDRESS;
  const TOKEN_B_ADDRESS = addresses.TOKEN_B_ADDRESS;

  // Notificação
  const mostrarToastAviso = (mensagem: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    showNotification(mensagem, tipo);
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(""), 1200);
  };

  // Função para verificar saldos
  const checkBalances = async (signer: any) => {
    try {
      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, tokenAAbiJson, signer);
      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, tokenBAbiJson, signer);
      const address = await signer.getAddress();

      const balanceA = await tokenA.balanceOf(address);
      const balanceB = await tokenB.balanceOf(address);

      setTokenABalance(ethers.formatUnits(balanceA, 18));
      setTokenBBalance(ethers.formatUnits(balanceB, 18));
    } catch (error) {
      console.error("Erro ao verificar saldos:", error);
    }
  };

  // Função para verificar reservas do DEX
  const checkReserves = async () => {
    try {
      if (!contract) return;

      const reserveAValue = await contract.reserveA();
      const reserveBValue = await contract.reserveB();

      setReserveA(ethers.formatUnits(reserveAValue, 18));
      setReserveB(ethers.formatUnits(reserveBValue, 18));
    } catch (error) {
      console.error("Erro ao verificar reservas:", error);
    }
  };

  // Função para mint TokenA
  const mintTokenA = async () => {
    if (!mintAmountA || parseFloat(mintAmountA) <= 0) {
      mostrarToastAviso(t('simpledex.valid_value'), 'warning');
      return;
    }

    setLoading(true);
    try {
      // Obter signer de forma robusta
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log(t('simpledex.error_signer'), error);
        }
      }

      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }

      if (!signer) {
        mostrarToastAviso("Não foi possível obter o signer", 'error');
        setLoading(false);
        return;
      }

      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, tokenAAbiJson, signer);
      const address = await signer.getAddress();

      console.log("Mintando TokenA:", mintAmountA, "para endereço:", address);
      const tx = await tokenA.mint(address, ethers.parseUnits(mintAmountA, 18));
      mostrarToastAviso(`Mintando TokenA... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("TokenA mintado com sucesso!", 'success');

      // Atualizar saldos
      await checkBalances(signer);
    } catch (err: any) {
      console.error("Erro ao mintar TokenA:", err);
      mostrarToastAviso("Erro ao mintar TokenA: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  // Função para mint TokenB
  const mintTokenB = async () => {
    if (!mintAmountB || parseFloat(mintAmountB) <= 0) {
      mostrarToastAviso("Insira um valor válido para mint!", 'warning');
      return;
    }

    setLoading(true);
    try {
      // Obter signer de forma robusta
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log("Erro ao obter signer do contrato:", error);
        }
      }

      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }

      if (!signer) {
        mostrarToastAviso("Não foi possível obter o signer", 'error');
        setLoading(false);
        return;
      }

      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, tokenBAbiJson, signer);
      const address = await signer.getAddress();

      console.log("Mintando TokenB:", mintAmountB, "para endereço:", address);
      const tx = await tokenB.mint(address, ethers.parseUnits(mintAmountB, 18));
      mostrarToastAviso(`Mintando TokenB... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("TokenB mintado com sucesso!", 'success');

      // Atualizar saldos
      await checkBalances(signer);
    } catch (err: any) {
      console.error("Erro ao mintar TokenB:", err);
      mostrarToastAviso("Erro ao mintar TokenB: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  // Função para burn TokenA
  const burnTokenA = async () => {
    if (!burnAmountA || parseFloat(burnAmountA) <= 0) {
      mostrarToastAviso("Insira um valor válido para burn!", 'warning');
      return;
    }

    const burnAmountFloat = parseFloat(burnAmountA);
    const balanceAFloat = parseFloat(tokenABalance);

    if (burnAmountFloat > balanceAFloat) {
      mostrarToastAviso(`Saldo insuficiente de TokenA. Disponível: ${tokenABalance}`, 'error');
      return;
    }

    setLoading(true);
    try {
      // Obter signer de forma robusta
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log("Erro ao obter signer do contrato:", error);
        }
      }

      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }

      if (!signer) {
        mostrarToastAviso("Não foi possível obter o signer", 'error');
        setLoading(false);
        return;
      }

      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, tokenAAbiJson, signer);

      const tx = await tokenA.burn(ethers.parseUnits(burnAmountA, 18));
      mostrarToastAviso(`Queimando TokenA... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("TokenA queimado com sucesso!", 'success');

      // Atualizar saldos
      await checkBalances(signer);
    } catch (err: any) {
      mostrarToastAviso("Erro ao queimar TokenA: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  // Função para burn TokenB
  const burnTokenB = async () => {
    if (!burnAmountB || parseFloat(burnAmountB) <= 0) {
      mostrarToastAviso("Insira um valor válido para burn!", 'warning');
      return;
    }

    const burnAmountFloat = parseFloat(burnAmountB);
    const balanceBFloat = parseFloat(tokenBBalance);

    if (burnAmountFloat > balanceBFloat) {
      mostrarToastAviso(`Saldo insuficiente de TokenB. Disponível: ${tokenBBalance}`, 'error');
      return;
    }

    setLoading(true);
    try {
      // Obter signer de forma robusta
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log("Erro ao obter signer do contrato:", error);
        }
      }

      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }

      if (!signer) {
        mostrarToastAviso("Não foi possível obter o signer", 'error');
        setLoading(false);
        return;
      }

      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, tokenBAbiJson, signer);

      const tx = await tokenB.burn(ethers.parseUnits(burnAmountB, 18));
      mostrarToastAviso(`Queimando TokenB... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("TokenB queimado com sucesso!", 'success');

      // Atualizar saldos
      await checkBalances(signer);
    } catch (err: any) {
      mostrarToastAviso("Erro ao queimar TokenB: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  // Carrega o conteúdo dos contratos Solidity
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    fetch(base + 'SimpleDEX.sol')
      .then(res => res.text())
      .then(text => setSimpleDexCode(text))
      .catch(() => setSimpleDexCode('// Erro ao carregar SimpleDEX.sol'));
    fetch(base + 'TokenA.sol')
      .then(res => res.text())
      .then(text => setTokenACode(text))
      .catch(() => setTokenACode('// Erro ao carregar TokenA.sol'));
    fetch(base + 'TokenB.sol')
      .then(res => res.text())
      .then(text => setTokenBCode(text))
      .catch(() => setTokenBCode('// Erro ao carregar TokenB.sol'));
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (!(window as any).ethereum) {
          setStatusMsg("MetaMask não detectado.");
          setShowStatus(true);
          return;
        }
        setLoading(true);
        const eth = (window as any).ethereum;
        await eth.request({ method: "eth_requestAccounts" });
        const _provider = new ethers.BrowserProvider(eth);
        const _signer = await _provider.getSigner();

        // Verificar se está na rede Sepolia
        const network = await _provider.getNetwork();
        if (network.chainId !== 11155111n) {
          throw new Error('Conecte à rede Sepolia!');
        }

        // Verificar se o contrato existe na rede
        const contractCode = await _provider.getCode(SIMPLE_DEX_ADDRESS);
        if (contractCode === '0x') {
          throw new Error('Contrato não encontrado na rede Sepolia!');
        }

        const _contract = new ethers.Contract(SIMPLE_DEX_ADDRESS, simpleDexAbiJson, _signer);

        console.log("Contrato inicializado:", _contract);
        console.log("Endereço do contrato:", SIMPLE_DEX_ADDRESS);
        console.log("Código do contrato existe:", contractCode !== '0x');
        console.log("Signer:", _signer);
        console.log("Signer tem getAddress?", typeof _signer.getAddress === 'function');

        const userAddress = await _signer.getAddress();
        console.log("Usuário conectado:", userAddress);

        setContract(_contract);
        setConnected(true);
        setStatusMsg(`Carteira conectada! Endereço: ${userAddress}`);
        setShowStatus(true);

        console.log("Estado do contrato salvo:", _contract);
        console.log("Contrato tem signer?", _contract.signer);

        // Verificar saldos e reservas
        await checkBalances(_signer);
        await checkReserves();
        await handleVerificarOwner(_contract);
        setLoading(false);
      } catch (error: any) {
        console.error("Erro na inicialização:", error);
        setLoading(false);
        setStatusMsg(error.message || "Erro ao conectar");
        setShowStatus(true);
      }
    };
    init();
  }, []);

  // Atualizar localStorage quando endereços mudam
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  // Validação dos endereços customizados
  const validateAddresses = async (addrs: typeof addresses) => {
    if (!isValidAddress(addrs.SIMPLE_DEX_ADDRESS) || !isValidAddress(addrs.TOKEN_A_ADDRESS) || !isValidAddress(addrs.TOKEN_B_ADDRESS)) {
      mostrarToastAviso("Endereço inválido!", 'error');
      return false;
    }
    try {
      setValidating(true);
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("MetaMask não detectado");
      const provider = new ethers.BrowserProvider(eth);
      // Verifica se há código nos contratos
      const codeDex = await provider.getCode(addrs.SIMPLE_DEX_ADDRESS);
      const codeA = await provider.getCode(addrs.TOKEN_A_ADDRESS);
      const codeB = await provider.getCode(addrs.TOKEN_B_ADDRESS);
      if (codeDex === '0x' || codeA === '0x' || codeB === '0x') {
        mostrarToastAviso("Um ou mais endereços não possuem contrato implantado!", 'error');
        setValidating(false);
        return false;
      }
      // Verifica se responde à ABI (ex: owner())
      const contractDex = new ethers.Contract(addrs.SIMPLE_DEX_ADDRESS, simpleDexAbiJson, provider);
      await contractDex.owner();
      setValidating(false);
      return true;
    } catch (err: any) {
      mostrarToastAviso("Erro ao validar contratos: " + (err.message || "Erro desconhecido"), 'error');
      setValidating(false);
      return false;
    }
  };

  // Handlers do formulário de edição
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditAddresses({ ...editAddresses, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    if (await validateAddresses(editAddresses)) {
      setAddresses(editAddresses);
      setEditMode(false);
      mostrarToastAviso("Endereços atualizados com sucesso!", 'success');
      window.location.reload(); // Força recarregar para reinicializar contratos
    }
  };
  const handleEditCancel = () => {
    setEditAddresses(addresses);
    setEditMode(false);
  };
  const handleRestoreDefaults = () => {
    setAddresses(DEFAULT_ADDRESSES);
    setEditAddresses(DEFAULT_ADDRESSES);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    mostrarToastAviso("Endereços restaurados para o padrão!", 'info');
    window.location.reload();
  };

  const adicionarLiquidez = async () => {
    if (!contract) {
      mostrarToastAviso("Conecte sua carteira!", 'error');
      return;
    }
    if (!isOwner) {
      mostrarToastAviso("Apenas o proprietário do contrato pode adicionar liquidez!", 'error');
      return;
    }
    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      mostrarToastAviso("Insira valores válidos para ambos os tokens!", 'warning');
      return;
    }

    // Verificar se tem saldo suficiente
    const amountAFloat = parseFloat(amountA);
    const amountBFloat = parseFloat(amountB);
    const balanceAFloat = parseFloat(tokenABalance);
    const balanceBFloat = parseFloat(tokenBBalance);

    if (amountAFloat > balanceAFloat) {
      mostrarToastAviso(`Saldo insuficiente de TokenA. Disponível: ${tokenABalance}`, 'error');
      return;
    }
    if (amountBFloat > balanceBFloat) {
      mostrarToastAviso(`Saldo insuficiente de TokenB. Disponível: ${tokenBBalance}`, 'error');
      return;
    }

    setLoading(true);
    try {
      // Obter signer de forma robusta
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log("Erro ao obter signer do contrato:", error);
        }
      }
      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }
      if (!signer) {
        mostrarToastAviso("Não foi possível obter o signer", 'error');
        setLoading(false);
        return;
      }
      // Aprovar TokenA
      const tokenAContract = new ethers.Contract(TOKEN_A_ADDRESS, tokenAAbiJson, signer);
      const txA = await tokenAContract.approve(SIMPLE_DEX_ADDRESS, ethers.parseUnits(amountA, 18));
      mostrarToastAviso(`Aprovando TokenA... Hash: ${txA.hash}`, 'info');
      await txA.wait();
      // Aprovar TokenB
      const tokenBContract = new ethers.Contract(TOKEN_B_ADDRESS, tokenBAbiJson, signer);
      const txB = await tokenBContract.approve(SIMPLE_DEX_ADDRESS, ethers.parseUnits(amountB, 18));
      mostrarToastAviso(`Aprovando TokenB... Hash: ${txB.hash}`, 'info');
      await txB.wait();
      // Agora sim, adicionar liquidez
      const tx = await contract.addLiquidity(
        ethers.parseUnits(amountA, 18),
        ethers.parseUnits(amountB, 18)
      );
      mostrarToastAviso(`Adicionando liquidez... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("Liquidez adicionada com sucesso!", 'success');
      // Atualizar saldos e reservas
      await checkBalances(signer);
      await checkReserves();
    } catch (err: any) {
      mostrarToastAviso("Erro ao adicionar liquidez: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  const removerLiquidez = async () => {
    if (!contract) {
      mostrarToastAviso("Conecte sua carteira!", 'error');
      return;
    }
    if (!isOwner) {
      mostrarToastAviso("Apenas o proprietário do contrato pode remover liquidez!", 'error');
      return;
    }
    if (!amountARemove || !amountBRemove || parseFloat(amountARemove) <= 0 || parseFloat(amountBRemove) <= 0) {
      mostrarToastAviso("Insira valores válidos para ambos os tokens!", 'warning');
      return;
    }

    // Verificar se há reservas suficientes
    const amountARemoveFloat = parseFloat(amountARemove);
    const amountBRemoveFloat = parseFloat(amountBRemove);
    const reserveAFloat = parseFloat(reserveA);
    const reserveBFloat = parseFloat(reserveB);

    if (amountARemoveFloat > reserveAFloat) {
      mostrarToastAviso(`Reserva insuficiente de TokenA. Disponível: ${reserveA}`, 'error');
      return;
    }
    if (amountBRemoveFloat > reserveBFloat) {
      mostrarToastAviso(`Reserva insuficiente de TokenB. Disponível: ${reserveB}`, 'error');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.removeLiquidity(
        ethers.parseUnits(amountARemove, 18),
        ethers.parseUnits(amountBRemove, 18)
      );
      mostrarToastAviso(`Removendo liquidez... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("Liquidez removida com sucesso!", 'success');

      // Atualizar saldos e reservas
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log("Erro ao obter signer do contrato:", error);
        }
      }

      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }

      if (signer) {
        await checkBalances(signer);
      }
      await checkReserves();
    } catch (err: any) {
      mostrarToastAviso("Erro ao remover liquidez: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  const swapAforB = async () => {
    if (!contract) {
      mostrarToastAviso("Conecte sua carteira!", 'error');
      return;
    }
    if (!amountAIn || parseFloat(amountAIn) <= 0) {
      mostrarToastAviso("Insira um valor válido para TokenA!", 'warning');
      return;
    }

    // Verificar se tem saldo suficiente
    const amountAInFloat = parseFloat(amountAIn);
    const balanceAFloat = parseFloat(tokenABalance);

    if (amountAInFloat > balanceAFloat) {
      mostrarToastAviso(`Saldo insuficiente de TokenA. Disponível: ${tokenABalance}`, 'error');
      return;
    }

    // Verificar se há liquidez suficiente
    if (parseFloat(reserveB) <= 0) {
      mostrarToastAviso("Não há liquidez suficiente para realizar o swap!", 'warning');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.swapAforB(ethers.parseUnits(amountAIn, 18));
      mostrarToastAviso(`Realizando swap A por B... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("Swap A por B realizado com sucesso!", 'success');

      // Atualizar saldos e reservas
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log("Erro ao obter signer do contrato:", error);
        }
      }

      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }

      if (signer) {
        await checkBalances(signer);
      }
      await checkReserves();
    } catch (err: any) {
      mostrarToastAviso("Erro no swap: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  const swapBforA = async () => {
    if (!contract) {
      mostrarToastAviso("Conecte sua carteira!", 'error');
      return;
    }
    if (!amountBIn || parseFloat(amountBIn) <= 0) {
      mostrarToastAviso("Insira um valor válido para TokenB!", 'warning');
      return;
    }

    // Verificar se tem saldo suficiente
    const amountBInFloat = parseFloat(amountBIn);
    const balanceBFloat = parseFloat(tokenBBalance);

    if (amountBInFloat > balanceBFloat) {
      mostrarToastAviso(`Saldo insuficiente de TokenB. Disponível: ${tokenBBalance}`, 'error');
      return;
    }

    // Verificar se há liquidez suficiente
    if (parseFloat(reserveA) <= 0) {
      mostrarToastAviso("Não há liquidez suficiente para realizar o swap!", 'warning');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.swapBforA(ethers.parseUnits(amountBIn, 18));
      mostrarToastAviso(`Realizando swap B por A... Hash: ${tx.hash}`, 'info');
      await tx.wait();
      mostrarToastAviso("Swap B por A realizado com sucesso!", 'success');

      // Atualizar saldos e reservas
      let signer = null;
      if (contract && contract.signer) {
        try {
          signer = await contract.signer;
        } catch (error) {
          console.log("Erro ao obter signer do contrato:", error);
        }
      }

      if (!signer && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          signer = await provider.getSigner();
        } catch (error) {
          console.log("Erro ao obter signer do provider:", error);
        }
      }

      if (signer) {
        await checkBalances(signer);
      }
      await checkReserves();
    } catch (err: any) {
      mostrarToastAviso("Erro no swap: " + (err.message || "Erro desconhecido"), 'error');
    }
    setLoading(false);
  };

  const verPreco = async (tokenAddress: string) => {
    if (!contract) {
      mostrarToastAviso("Conecte sua carteira!", 'error');
      return;
    }
    setLoading(true);
    try {
      const price = await contract.getPrice(tokenAddress);
      const priceFormatted = ethers.formatUnits(price, 18);
      const tokenName = tokenAddress === TOKEN_A_ADDRESS ? "TokenA" : "TokenB";
      mostrarToastAviso(`Preço do ${tokenName}: ${priceFormatted}`, 'info');
      if (tokenAddress === TOKEN_A_ADDRESS) setPrecoTokenA(priceFormatted);
      if (tokenAddress === TOKEN_B_ADDRESS) setPrecoTokenB(priceFormatted);
    } catch (err: any) {
      if (err.message && err.message.includes("No liquidity")) {
        mostrarToastAviso("Não há liquidez suficiente para calcular o preço. Adicione liquidez primeiro.", 'warning');
        if (tokenAddress === TOKEN_A_ADDRESS) setPrecoTokenA(null);
        if (tokenAddress === TOKEN_B_ADDRESS) setPrecoTokenB(null);
      } else {
        mostrarToastAviso("Erro ao consultar preço: " + (err.message || "Erro desconhecido"), 'error');
      }
    }
    setLoading(false);
  };

  const handleCopySimpleDex = () => handleCopy(SIMPLE_DEX_ADDRESS);
  const handleCopyTokenA = () => handleCopy(TOKEN_A_ADDRESS);
  const handleCopyTokenB = () => handleCopy(TOKEN_B_ADDRESS);
  const toggleShowSimpleDexCode = () => setShowSimpleDexCode(prev => !prev);
  const toggleShowTokenACode = () => setShowTokenACode(prev => !prev);
  const toggleShowTokenBCode = () => setShowTokenBCode(prev => !prev);

  // Adicione a função fora do JSX
  const handleVerificarOwner = async (contract: any) => {
    try {
      console.log("=== TESTE DE VERIFICAÇÃO DE OWNER ===");
      if (!contract) {
        console.log("Contrato não disponível");
        mostrarToastAviso("Contrato não disponível", 'error');
        return;
      }
      const ownerAddress = await contract.owner();
      console.log("Owner do contrato:", ownerAddress);
      let userAddress = null;
      if (contract.signer) {
        try {
          const signer = await contract.signer;
          if (signer && typeof signer.getAddress === 'function') {
            userAddress = await signer.getAddress();
            console.log("Método 1 - Endereço do usuário:", userAddress);
          }
        } catch (error) {
          console.log("Método 1 falhou:", error);
        }
      }
      if (!userAddress && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const globalSigner = await provider.getSigner();
          userAddress = await globalSigner.getAddress();
          console.log("Método 2 - Endereço do usuário:", userAddress);
        } catch (error) {
          console.log("Método 2 falhou:", error);
        }
      }
      if (!userAddress) {
        console.log("Não foi possível obter o endereço do usuário");
        mostrarToastAviso("Não foi possível obter o endereço do usuário", 'error');
        return;
      }
      console.log("Endereço final do usuário:", userAddress);
      console.log("São iguais?", ownerAddress.toLowerCase() === userAddress.toLowerCase());
      const isOwnerResult = ownerAddress.toLowerCase() === userAddress.toLowerCase();
      setIsOwner(isOwnerResult);
      mostrarToastAviso(`Owner: ${ownerAddress}, Usuário: ${userAddress}, É Owner: ${isOwnerResult}`, 'info');
    } catch (error: any) {
      console.error("Erro no teste:", error);
      mostrarToastAviso("Erro ao verificar owner: " + (error.message || "Erro desconhecido"), 'error');
    }
  };

  // Atualizar os handlers de onValueChange para amountA e amountB
  const handleAmountAChange = (values: NumberFormatValues) => {
    setAmountA(values.value);
    // Só calcular se já houver liquidez
    if (parseFloat(reserveA) > 0 && parseFloat(reserveB) > 0 && values.value) {
      const proporcao = parseFloat(reserveB) / parseFloat(reserveA);
      setAmountB((parseFloat(values.value) * proporcao).toString());
    }
  };
  const handleAmountBChange = (values: NumberFormatValues) => {
    setAmountB(values.value);
    if (parseFloat(reserveA) > 0 && parseFloat(reserveB) > 0 && values.value) {
      const proporcao = parseFloat(reserveA) / parseFloat(reserveB);
      setAmountA((parseFloat(values.value) * proporcao).toString());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center py-5 px-2">
        <div className="max-w-6xl w-full mx-auto bg-gray-800/80 p-8 rounded-xl shadow-lg">
          <h1 className="text-center mb-2 text-4xl font-bold text-white">🔄 SimpleDEX</h1>
          <p className="text-center mb-8 italic text-gray-200">Exchange Descentralizada com Pools de Liquidez</p>

          {/* Informações dos Contratos */}
          <div className="contract-info bg-gray-900/80 p-5 rounded-xl mb-8 text-center text-sm break-words text-gray-100">
            <strong className="text-white">Endereços dos Contratos:</strong><br />
            {!editMode ? (
              <>
                {/* Exibição normal dos endereços */}
                <div className="my-2 flex flex-col items-center">
                  <span className="font-semibold text-blue-400">SimpleDEX:</span><br />
                  <div className="flex items-center gap-2 justify-center">
                    <a
                      className="text-blue-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded"
                      href={`https://sepolia.etherscan.io/address/${SIMPLE_DEX_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Endereço do contrato SimpleDEX: ${SIMPLE_DEX_ADDRESS}`}
                    >
                      {SIMPLE_DEX_ADDRESS}
                    </a>
                    <button
                      className="ml-1 px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-900 active:bg-blue-950 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={handleCopySimpleDex}
                      title="Copiar endereço"
                    >
                      {copied === SIMPLE_DEX_ADDRESS ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
                <div className="my-2 flex flex-col items-center">
                  <span className="font-semibold text-green-400">TokenA:</span><br />
                  <div className="flex items-center gap-2 justify-center">
                    <a
                      className="text-green-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded"
                      href={`https://sepolia.etherscan.io/address/${TOKEN_A_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Endereço do contrato TokenA: ${TOKEN_A_ADDRESS}`}
                    >
                      {TOKEN_A_ADDRESS}
                    </a>
                    <button
                      className="ml-1 px-2 py-1 bg-green-700 text-white rounded hover:bg-green-900 active:bg-green-950 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={handleCopyTokenA}
                      title="Copiar endereço"
                    >
                      {copied === TOKEN_A_ADDRESS ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
                <div className="my-2 flex flex-col items-center">
                  <span className="font-semibold text-purple-400">TokenB:</span><br />
                  <div className="flex items-center gap-2 justify-center">
                    <a
                      className="text-purple-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded"
                      href={`https://sepolia.etherscan.io/address/${TOKEN_B_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Endereço do contrato TokenB: ${TOKEN_B_ADDRESS}`}
                    >
                      {TOKEN_B_ADDRESS}
                    </a>
                    <button
                      className="ml-1 px-2 py-1 bg-purple-700 text-white rounded hover:bg-purple-900 active:bg-purple-950 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={handleCopyTokenB}
                      title="Copiar endereço"
                    >
                      {copied === TOKEN_B_ADDRESS ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
                <div className="text-xs mt-1 text-gray-300">(Clique para visualizar no Etherscan)</div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    className="px-4 py-1 bg-blue-700 text-white rounded hover:bg-blue-900 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setEditMode(true)}
                  >
                    Alterar endereços
                  </button>
                  {JSON.stringify(addresses) !== JSON.stringify(DEFAULT_ADDRESSES) && (
                    <button
                      className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-900 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={handleRestoreDefaults}
                    >
                      Restaurar endereços padrão
                    </button>
                  )}
                </div>
              </>
            ) : (
              <form className="flex flex-col gap-2 items-center mt-4">
                <div className="flex flex-col gap-1 w-full max-w-md">
                  <label className="text-left text-xs text-blue-300">SimpleDEX</label>
                  <input
                    type="text"
                    name="SIMPLE_DEX_ADDRESS"
                    value={editAddresses.SIMPLE_DEX_ADDRESS}
                    onChange={handleEditChange}
                    className="w-full py-2 px-3 border-2 border-blue-700 rounded-lg text-base text-gray-900 bg-gray-100 mb-1"
                    disabled={validating}
                  />
                </div>
                <div className="flex flex-col gap-1 w-full max-w-md">
                  <label className="text-left text-xs text-green-300">TokenA</label>
                  <input
                    type="text"
                    name="TOKEN_A_ADDRESS"
                    value={editAddresses.TOKEN_A_ADDRESS}
                    onChange={handleEditChange}
                    className="w-full py-2 px-3 border-2 border-green-700 rounded-lg text-base text-gray-900 bg-gray-100 mb-1"
                    disabled={validating}
                  />
                </div>
                <div className="flex flex-col gap-1 w-full max-w-md">
                  <label className="text-left text-xs text-purple-300">TokenB</label>
                  <input
                    type="text"
                    name="TOKEN_B_ADDRESS"
                    value={editAddresses.TOKEN_B_ADDRESS}
                    onChange={handleEditChange}
                    className="w-full py-2 px-3 border-2 border-purple-700 rounded-lg text-base text-gray-900 bg-gray-100 mb-1"
                    disabled={validating}
                  />
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    className="px-4 py-1 bg-green-700 text-white rounded hover:bg-green-900 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={handleEditSave}
                    disabled={validating}
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-1 bg-red-700 text-white rounded hover:bg-red-900 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={handleEditCancel}
                    disabled={validating}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Status da Conexão */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold text-white">🔗 Status da Conexão</h2>
            <div className="flex flex-col gap-2">
              <div className={`status font-semibold p-4 rounded-lg ${connected ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}`} style={{ display: showStatus ? 'block' : 'none' }}>
                <a
                  className="text-green-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded"

                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {statusMsg}
                </a>
              </div>
              {connected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-900/80 p-4 rounded-xl">
                    <h3 className="text-green-400 font-semibold mb-2">Seus Saldos:</h3>
                    <p className="text-sm">TokenA: <span className="text-green-300">{formatarValorToken(tokenABalance)}</span></p>
                    <p className="text-sm">TokenB: <span className="text-purple-300">{formatarValorToken(tokenBBalance)}</span></p>
                  </div>
                  <div className="bg-gray-900/80 p-4 rounded-xl">
                    <h3 className="text-blue-400 font-semibold mb-2">Reservas do DEX:</h3>
                    <p className="text-sm">TokenA: <span className="text-green-300">{formatarValorToken(reserveA)}</span></p>
                    <p className="text-sm">TokenB: <span className="text-purple-300">{formatarValorToken(reserveB)}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gestão de Tokens (Mint/Burn) */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-orange-500 text-xl font-semibold text-white">💵 Gestão de Tokens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mint Tokens */}
              <div className="bg-gray-900/80 p-4 rounded-xl border border-orange-700">
                <h3 className="mb-3 text-lg font-semibold text-orange-400">Mint Tokens</h3>

                {/* Mint TokenA */}
                <div className="mb-4">
                  <h4 className="text-green-400 font-semibold mb-2">Mint TokenA:</h4>
                  <NumericFormat
                    value={mintAmountA}
                    onValueChange={(values: NumberFormatValues) => setMintAmountA(values.value)}
                    thousandSeparator={false}
                    decimalScale={18}
                    allowNegative={false}
                    placeholder="Quantidade para mintar"
                    className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                    disabled={loading}
                  />
                  <button
                    className={`bg-gradient-to-r from-green-500 to-green-700 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-green-600 hover:to-green-800'}`}
                    onClick={mintTokenA}
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Mint TokenA'}
                  </button>
                </div>

                {/* Mint TokenB */}
                <div>
                  <h4 className="text-purple-400 font-semibold mb-2">Mint TokenB:</h4>
                  <NumericFormat
                    value={mintAmountB}
                    onValueChange={(values: NumberFormatValues) => setMintAmountB(values.value)}
                    thousandSeparator={false}
                    decimalScale={18}
                    allowNegative={false}
                    placeholder="Quantidade para mintar"
                    className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                    disabled={loading}
                  />
                  <button
                    className={`bg-gradient-to-r from-purple-500 to-purple-700 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-purple-600 hover:to-purple-800'}`}
                    onClick={mintTokenB}
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Mint TokenB'}
                  </button>
                </div>
              </div>

              {/* Burn Tokens */}
              <div className="bg-gray-900/80 p-4 rounded-xl border border-red-700">
                <h3 className="mb-3 text-lg font-semibold text-red-400">Burn Tokens</h3>

                {/* Burn TokenA */}
                <div className="mb-4">
                  <h4 className="text-green-400 font-semibold mb-2">Burn TokenA:</h4>
                  <NumericFormat
                    value={burnAmountA}
                    onValueChange={(values: NumberFormatValues) => setBurnAmountA(values.value)}
                    thousandSeparator={false}
                    decimalScale={18}
                    allowNegative={false}
                    placeholder="Quantidade para queimar"
                    className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                    disabled={loading}
                  />
                  <button
                    className={`bg-gradient-to-r from-red-500 to-red-700 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-red-600 hover:to-red-800'}`}
                    onClick={burnTokenA}
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Burn TokenA'}
                  </button>
                </div>

                {/* Burn TokenB */}
                <div>
                  <h4 className="text-purple-400 font-semibold mb-2">Burn TokenB:</h4>
                  <NumericFormat
                    value={burnAmountB}
                    onValueChange={(values: NumberFormatValues) => setBurnAmountB(values.value)}
                    thousandSeparator={false}
                    decimalScale={18}
                    allowNegative={false}
                    placeholder="Quantidade para queimar"
                    className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                    disabled={loading}
                  />
                  <button
                    className={`bg-gradient-to-r from-red-500 to-red-700 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-red-600 hover:to-red-800'}`}
                    onClick={burnTokenB}
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Burn TokenB'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gestão de Liquidez */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-purple-500 text-xl font-semibold text-white">💼 Gestão de Liquidez</h2>

            {/* Informações sobre permissões */}
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <h3 className="text-blue-300 font-semibold mb-2">📋 Regras de Permissão:</h3>
              <ul className="text-sm text-gray-200 space-y-1">
                <li>• <span className="text-yellow-300">Adicionar Liquidez:</span> Apenas o proprietário do contrato</li>
                <li>• <span className="text-green-300">Trocar Tokens:</span> Todos os usuários podem trocar</li>
                <li>• <span className="text-red-300">Retirar Liquidez:</span> Apenas o proprietário do contrato</li>
              </ul>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-300">Status Owner:</span>
                <span className={`text-sm font-semibold ${isOwner ? 'text-green-400' : 'text-red-400'}`}>
                  {isOwner ? '✅ É Owner' : '❌ Não é Owner'}
                </span>
              </div>
              {isOwner && (
                <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded text-green-200 text-sm">
                  ✅ Você é o proprietário do contrato e pode gerenciar a liquidez
                </div>
              )}
              {!isOwner && (
                <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-200 text-sm">
                  ⚠️ Você não é o proprietário. Apenas pode trocar tokens.
                </div>
              )}
            </div>

            {/* Adicionar Liquidez */}
            <div className="flex flex-col gap-2 bg-gray-900/80 p-4 rounded-xl border border-blue-700 mb-6">
              <h3 className="mb-2 text-lg font-semibold text-blue-400">Adicionar Liquidez</h3>
              {!isOwner && (
                <div className="mb-3 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
                  ⚠️ Apenas o proprietário do contrato pode adicionar liquidez
                </div>
              )}
              <NumericFormat
                value={amountA}
                onValueChange={handleAmountAChange}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenA"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading || !isOwner}
              />
              <NumericFormat
                value={amountB}
                onValueChange={handleAmountBChange}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenB"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading || !isOwner}
              />
              <button
                className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading || !isOwner ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-blue-600 hover:to-blue-800'}`}
                onClick={adicionarLiquidez}
                disabled={loading || !isOwner}
              >
                {loading ? 'Processando...' : !isOwner ? 'Apenas Owner' : 'Adicionar Liquidez'}
              </button>
            </div>

            {/* Remover Liquidez */}
            <div className="flex flex-col gap-2 bg-gray-900/80 p-4 rounded-xl border border-red-700">
              <h3 className="mb-2 text-lg font-semibold text-red-400">Remover Liquidez</h3>
              {!isOwner && (
                <div className="mb-3 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
                  ⚠️ Apenas o proprietário do contrato pode remover liquidez
                </div>
              )}
              <NumericFormat
                value={amountARemove}
                onValueChange={(values: NumberFormatValues) => setAmountARemove(values.value)}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenA"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading || !isOwner}
              />
              <NumericFormat
                value={amountBRemove}
                onValueChange={(values: NumberFormatValues) => setAmountBRemove(values.value)}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenB"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading || !isOwner}
              />
              <button
                className={`bg-gradient-to-r from-red-500 to-red-700 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading || !isOwner ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-red-600 hover:to-red-800'}`}
                onClick={removerLiquidez}
                disabled={loading || !isOwner}
              >
                {loading ? 'Processando...' : !isOwner ? 'Apenas Owner' : 'Remover Liquidez'}
              </button>
            </div>
          </div>

          {/* Swap de Tokens */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-yellow-500 text-xl font-semibold text-white">🔄 Swap de Tokens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-yellow-400">Swap TokenA por TokenB</h3>
                <NumericFormat
                  value={amountAIn}
                  onValueChange={(values: NumberFormatValues) => setAmountAIn(values.value)}
                  thousandSeparator={false}
                  decimalScale={18}
                  allowNegative={false}
                  placeholder="Quantidade de TokenA"
                  className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                  disabled={loading}
                />
                <button
                  className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-yellow-500 hover:to-yellow-700'}`}
                  onClick={swapAforB}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Swap A por B'}
                </button>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-yellow-400">Swap TokenB por TokenA</h3>
                <NumericFormat
                  value={amountBIn}
                  onValueChange={(values: NumberFormatValues) => setAmountBIn(values.value)}
                  thousandSeparator={false}
                  decimalScale={18}
                  allowNegative={false}
                  placeholder="Quantidade de TokenB"
                  className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                  disabled={loading}
                />
                <button
                  className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-yellow-500 hover:to-yellow-700'}`}
                  onClick={swapBforA}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Swap B por A'}
                </button>
              </div>
            </div>
          </div>

          {/* Consultar Preço */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-green-500 text-xl font-semibold text-white">💲 Consultar Preço</h2>
            <div className="flex gap-4 justify-center mb-4">
              <button
                className={`bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-green-600 hover:to-green-800'}`}
                onClick={() => verPreco(TOKEN_A_ADDRESS)}
                disabled={loading}
              >
                Preço TokenA
              </button>
              <button
                className={`bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:from-purple-600 hover:to-purple-800'}`}
                onClick={() => verPreco(TOKEN_B_ADDRESS)}
                disabled={loading}
              >
                Preço TokenB
              </button>
            </div>
            <div className="flex flex-col items-center gap-2 mb-4">
              {precoTokenA !== null && (
                <div className="bg-green-900/40 border border-green-600 rounded px-4 py-2 text-green-200 font-mono text-sm w-full text-center">
                  Preço TokenA: <span className="font-bold">{formatarValorToken(precoTokenA)}</span>
                </div>
              )}
              {precoTokenB !== null && (
                <div className="bg-purple-900/40 border border-purple-600 rounded px-4 py-2 text-purple-200 font-mono text-sm w-full text-center">
                  Preço TokenB: <span className="font-bold">{formatarValorToken(precoTokenB)}</span>
                </div>
              )}
            </div>
          </div>



          {/* Exibir código dos contratos .sol */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex gap-4 justify-center mb-4 flex-wrap">
              <button
                className="mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 cursor-pointer hover:from-purple-600 hover:to-indigo-700"
                onClick={toggleShowSimpleDexCode}
              >
                {showSimpleDexCode ? 'Ocultar SimpleDEX.sol' : 'Mostrar SimpleDEX.sol'}
              </button>
              <button
                className="mb-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 cursor-pointer hover:from-green-600 hover:to-green-800"
                onClick={toggleShowTokenACode}
              >
                {showTokenACode ? 'Ocultar TokenA.sol' : 'Mostrar TokenA.sol'}
              </button>
              <button
                className="mb-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 cursor-pointer hover:from-purple-600 hover:to-purple-800"
                onClick={toggleShowTokenBCode}
              >
                {showTokenBCode ? 'Ocultar TokenB.sol' : 'Mostrar TokenB.sol'}
              </button>
            </div>
            {showSimpleDexCode && (
              <div className="mb-6 bg-gray-900 text-blue-200 rounded-lg p-4 overflow-auto max-h-96 border-2 border-blue-700 w-full">
                <h3 className="font-bold mb-2 text-blue-400">SimpleDEX.sol</h3>
                <pre className="text-xs whitespace-pre-wrap">{simpleDexCode}</pre>
              </div>
            )}
            {showTokenACode && (
              <div className="mb-6 bg-gray-900 text-green-200 rounded-lg p-4 overflow-auto max-h-96 border-2 border-green-700 w-full">
                <h3 className="font-bold mb-2 text-green-400">TokenA.sol</h3>
                <pre className="text-xs whitespace-pre-wrap">{tokenACode}</pre>
              </div>
            )}
            {showTokenBCode && (
              <div className="mb-6 bg-gray-900 text-purple-200 rounded-lg p-4 overflow-auto max-h-96 border-2 border-purple-700 w-full">
                <h3 className="font-bold mb-2 text-purple-400">TokenB.sol</h3>
                <pre className="text-xs whitespace-pre-wrap">{tokenBCode}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SimpleDex;

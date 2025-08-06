import React, { useState, useEffect } from 'react';
import DarkCard from '../../components/DarkCard';
import { NumericFormat } from 'react-number-format';
import { useNotification } from '../../context/NotificationContext';
import Footer from "../../components/Footer";
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

const contratoAddress = "0xd2f44f2edccbbac4b1d058c6ddaebfb203681bd6";
const contratoABI: any[] = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_bankCap", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "balance", "type": "uint256" }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "FailedDeposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "FailedWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "balance", "type": "uint256" }
    ],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "inputs": [], "name": "bankCap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function"
  },
  {
    "inputs": [], "name": "getBankBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "getBankCap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "getUserBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "totalDeposits", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "newCap", "type": "uint256" }], "name": "updateBankCap", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userBalances", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  }
];

function formatarETH(valor: any, casasDecimais = 8) {
  if (typeof valor === 'bigint' || typeof valor === 'object') {
    const valorStr = parseFloat(ethers.formatEther(valor)).toFixed(casasDecimais);
    return valorStr.replace(/\.?0+$/, '') + ' ETH';
  } else {
    const valorStr = parseFloat(valor).toFixed(casasDecimais);
    return valorStr.replace(/\.?0+$/, '') + ' ETH';
  }
}

const KipuBank: React.FC = () => {
  // Hook de tradução
  const { t } = useTranslation();

  // Estados simulados para exibição inicial
  const { showNotification } = useNotification();
  const [connected, setConnected] = useState(false);
  const [userBalance, setUserBalance] = useState('0.0 ETH');
  const [bankBalance, setBankBalance] = useState('0.0 ETH');
  const [bankCap, setBankCap] = useState('0.0 ETH');
  const [availableSpace, setAvailableSpace] = useState(t('kipuBank.loadingAvailableSpace'));
  const [depositValue, setDepositValue] = useState('');
  // ...existing code...
  const [withdrawValue, setWithdrawValue] = useState('');
  const [newCap, setNewCap] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [statusMsg, setStatusMsg] = useState(t('kipuBank.walletNotConnected'));
  const [showStatus, setShowStatus] = useState(false);
  const [statusTransacao, setStatusTransacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [contrato, setContrato] = useState<any>(null);
  // Estados para exibir o contrato .sol
  const [showContract, setShowContract] = useState(false);
  const [contractCode, setContractCode] = useState('');


  // Carrega o conteúdo do contrato Solidity
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    fetch(base + 'KipuBank.sol')
      .then(res => res.text())
      .then(text => setContractCode(text))
      .catch(() => setContractCode('// Erro ao carregar o contrato Solidity.'));
  }, []);

  // Detecta conexão automática da carteira ao montar
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const eth = (window as any).ethereum;
        if (!eth) return;
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          // Executa o mesmo fluxo do handleConnect, mas sem setLoading nem notificações duplicadas
          const _provider = new ethers.BrowserProvider(eth);
          const _signer = await _provider.getSigner();
          const network = await _provider.getNetwork();
          if (network.chainId !== 11155111n) return;
          const address = await _signer.getAddress();
          const contractCode = await _provider.getCode(contratoAddress);
          if (contractCode === '0x') return;
          const _contrato = new ethers.Contract(contratoAddress, contratoABI, _signer);
          setContrato(_contrato);
          setConnected(true);
          setStatusMsg(`${t('kipuBank.connected')}: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
          setShowStatus(true);
          window.dispatchEvent(new Event('walletUpdated'));
          // Verifica se é owner
          const owner = await _contrato.owner();
          setIsOwner(owner.toLowerCase() === address.toLowerCase());
          await atualizarInformacoesBanco(_contrato);
        }
      } catch { }
    };
    checkWallet();
  }, []);

  // Notificação
  const mostrarToastAviso = (mensagem: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    showNotification(mensagem, tipo);
  };

  // Conectar carteira/metamask
  const handleConnect = async () => {
    try {
      if (!(window as any).ethereum) {
        mostrarToastAviso(t('kipuBank.metamaskNotInstalled'), 'error');
        return;
      }
      setLoading(true);
      const eth = (window as any).ethereum;
      await eth.request({ method: 'eth_requestAccounts' });
      const _provider = new ethers.BrowserProvider(eth);
      const _signer = await _provider.getSigner();
      const network = await _provider.getNetwork();
      if (network.chainId !== 11155111n) {
        mostrarToastAviso(t('kipuBank.connectToSepolia'), 'error');
        setLoading(false);
        return;
      }
      const address = await _signer.getAddress();
      const contractCode = await _provider.getCode(contratoAddress);
      if (contractCode === '0x') {
        mostrarToastAviso(t('kipuBank.contractNotFound'), 'error');
        setLoading(false);
        return;
      }
      const _contrato = new ethers.Contract(contratoAddress, contratoABI, _signer);
      setContrato(_contrato);
      setConnected(true);
      setStatusMsg(`${t('kipuBank.connected')}: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      setShowStatus(true);
      window.dispatchEvent(new Event('walletUpdated'));
      // Verifica se é owner
      const owner = await _contrato.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
      await atualizarInformacoesBanco(_contrato);
      setLoading(false);
      mostrarToastAviso(t('kipuBank.walletConnectedSuccess'), 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || t('kipuBank.errorConnecting'), 'error');
    }
  };

  // Atualizar saldos e limites
  const atualizarInformacoesBanco = async (_contrato?: any) => {
    try {
      const contratoRef = _contrato || contrato;
      if (!contratoRef) return;
      const userBal = await contratoRef.getUserBalance();
      setUserBalance(formatarETH(userBal));
      const bankBal = await contratoRef.getBankBalance();
      setBankBalance(formatarETH(bankBal));
      const cap = await contratoRef.getBankCap();
      setBankCap(formatarETH(cap));
      const espaco = cap - bankBal;
      setAvailableSpace(formatarETH(espaco));
    } catch (error: any) {
      mostrarToastAviso('Erro ao atualizar saldos!', 'error');
    }
  };

  // Depositar ETH
  const handleDepositar = async () => {
    try {
      if (!contrato) {
        mostrarToastAviso(t('kipuBank.connectYourWallet'), 'error');
        return;
      }
      if (!depositValue || parseFloat(depositValue) <= 0) {
        mostrarToastAviso(t('kipuBank.enterValidValue'), 'warning');
        return;
      }
      setLoading(true);
      const valor = ethers.parseEther(depositValue);
      const tx = await contrato.deposit({ value: valor });
      setStatusTransacao(`${t('kipuBank.depositInProgress')}... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao(`${t('kipuBank.depositSuccessful')}!`);
      setDepositValue('');
      await atualizarInformacoesBanco();
      setLoading(false);
      mostrarToastAviso(t('kipuBank.depositSuccessful'), 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || t('kipuBank.errorDepositing'), 'error');
      setStatusTransacao(`${t('kipuBank.depositError')}: ${error.message || t('kipuBank.unknownError')}`);
    }
  };

  // Sacar ETH
  const handleSacar = async () => {
    try {
      if (!contrato) {
        mostrarToastAviso(t('kipuBank.connectYourWallet'), 'error');
        return;
      }
      if (!withdrawValue || parseFloat(withdrawValue) <= 0) {
        mostrarToastAviso(t('kipuBank.enterValidValue'), 'warning');
        return;
      }
      setLoading(true);
      const valor = ethers.parseEther(withdrawValue);
      const tx = await contrato.withdraw(valor);
      setStatusTransacao(`${t('kipuBank.withdrawalInProgress')}... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao(`${t('kipuBank.withdrawalSuccessful')}!`);
      setWithdrawValue('');
      await atualizarInformacoesBanco();
      setLoading(false);
      mostrarToastAviso(t('kipuBank.withdrawalSuccessful'), 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || t('kipuBank.errorWithdrawing'), 'error');
      setStatusTransacao(`${t('kipuBank.withdrawalError')}: ${error.message || t('kipuBank.unknownError')}`);
    }
  };

  // Atualizar limite do banco
  const handleAtualizarCap = async () => {
    try {
      if (!contrato) {
        mostrarToastAviso(t('kipuBank.connectYourWallet'), 'error');
        return;
      }
      if (!newCap || parseFloat(newCap) <= 0) {
        mostrarToastAviso(t('kipuBank.enterValidValue'), 'warning');
        return;
      }
      setLoading(true);
      const valor = ethers.parseEther(newCap);
      const tx = await contrato.updateBankCap(valor);
      setStatusTransacao(`${t('kipuBank.limitUpdateInProgress')}... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao(t('kipuBank.bankLimitUpdated'));
      setNewCap('');
      await atualizarInformacoesBanco();
      setLoading(false);
      mostrarToastAviso(t('kipuBank.bankLimitUpdated'), 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || t('kipuBank.errorUpdatingLimit'), 'error');
      setStatusTransacao(`${t('kipuBank.updateError')}: ${error.message || t('kipuBank.unknownError')}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center py-5 px-2">
        <DarkCard className="max-w-4xl w-full mx-auto">
          <h1 className="text-center mb-2 text-4xl font-bold">🏦 {t('kipuBank.title')}</h1>
          <p className="text-center mb-8 italic text-gray-500">{t('kipuBank.subtitle')}</p>

          <div className="contract-info bg-gray-800/80 p-5 rounded-xl mb-8 text-center text-sm break-words text-gray-100">
            <strong className="text-white">{t('kipuBank.contractOnNetwork')}:</strong><br />
            <a
              id="contract-link"
              className="text-blue-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded mt-1"
              href={`https://sepolia.etherscan.io/address/${contratoAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`${t('kipuBank.contractAddress')}: ${contratoAddress}`}
            >
              {contratoAddress}
            </a>
            <div className="text-xs mt-1 text-gray-300">({t('kipuBank.clickToView')})</div>
          </div>

          {/* Conexão */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold text-white">🔗 {t('kipuBank.connectWallet')}</h2>
            <button
              id="btn-conectar"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-4 px-8 rounded-lg text-lg font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleConnect}
              disabled={connected || loading}
            >
              {connected ? t('kipuBank.walletConnected') : t('kipuBank.connectMetamask')}
            </button>
            <div
              id="status-conexao"
              className={`status font-semibold mt-4 p-4 rounded-lg ${connected ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-green-100 text-green-800 border-2 border-green-200'}`}
              style={{ display: showStatus ? 'block' : 'none' }}
            >
              <div className="overflow-hidden text-ellipsis whitespace-normal break-words">{statusMsg}</div>
            </div>
          </div>

          {/* Informações do Banco */}
          <div id="secao-operacoes" className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100" style={{ display: connected ? 'block' : 'none' }}>
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold text-white">🏦 {t('kipuBank.bankInfo')}</h2>

            <div className="info-grid grid md:grid-cols-2 gap-4 mb-5 flex-col md:flex-row">
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-gray-700 break-words">
                <strong className="block mb-1 text-gray-200">{t('kipuBank.yourBalance')}:</strong>
                <span className="text-lg font-bold text-green-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{userBalance}</span>
              </div>
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-gray-700 break-words">
                <strong className="block mb-1 text-gray-200">{t('kipuBank.totalBankBalance')}:</strong>
                <span className="text-lg font-bold text-green-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{bankBalance}</span>
              </div>
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-gray-700 break-words">
                <strong className="block mb-1 text-gray-200">{t('kipuBank.bankLimit')}:</strong>
                <span className="text-lg font-bold text-green-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{bankCap}</span>
              </div>
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-blue-700 break-words">
                <strong className="block mb-1 text-blue-300">{t('kipuBank.availableSpace')}:</strong>
                <span id="espaco-disponivel" className="text-lg font-bold text-blue-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{availableSpace}</span>
              </div>
            </div>
            <div className="text-center bg-transparent border-none flex items-center justify-center">
              <button
                id="btn-atualizar"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-5 rounded-lg font-semibold w-auto transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={async () => {
                  await atualizarInformacoesBanco();
                  mostrarToastAviso(t('kipuBank.balancesUpdated'), 'success');
                }}
                disabled={loading}
              >
                🔄 {t('kipuBank.updateBalances')}
              </button>
            </div>
            <div id="status-transacao" className="status mt-6" style={{ display: statusTransacao ? 'block' : 'none', backgroundColor: statusTransacao.includes('sucesso') ? '#d4edda' : statusTransacao.includes('Erro') ? '#f8d7da' : undefined }}>
              {statusTransacao}
            </div>

            {/* Depósitos */}
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold mt-8 text-white">💰 {t('kipuBank.deposit')}</h2>
            <div className="input-group mb-5">
              <label htmlFor="valor-deposito" className="block mb-2 font-semibold text-gray-200">{t('kipuBank.amountToDeposit')} (ETH):</label>
              <NumericFormat
                value={depositValue}
                onValueChange={values => setDepositValue(values.value)}
                placeholder={t('kipuBank.example')}
                disabled={loading}
                decimalScale={18}
                allowNegative={false}
                thousandSeparator={false}
                className="w-full py-4 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
                inputMode="decimal"
              />
            </div>
            <button
              id="btn-depositar"
              className={`bg-gradient-to-r from-green-500 to-green-700 text-white border-none py-4 px-8 rounded-lg text-lg font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleDepositar}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  {t('kipuBank.processing')}
                </span>
              ) : t('kipuBank.depositETH')}
            </button>

            {/* Saques */}
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold mt-8 text-white">💸 {t('kipuBank.withdrawal')}</h2>
            <div className="input-group mb-5">
              <label htmlFor="valor-saque" className="block mb-2 font-semibold text-gray-200">{t('kipuBank.amountToWithdraw')} (ETH):</label>
              <NumericFormat
                value={withdrawValue}
                onValueChange={values => setWithdrawValue(values.value)}
                placeholder={t('kipuBank.example')}
                disabled={loading}
                decimalScale={18}
                allowNegative={false}
                thousandSeparator={false}
                className="w-full py-4 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
                inputMode="decimal"
              />
            </div>
            <button
              id="btn-sacar"
              className={`bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none py-4 px-8 rounded-lg text-lg font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleSacar}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  {t('kipuBank.processing')}
                </span>
              ) : t('kipuBank.withdrawETH')}
            </button>

            {/* Atualização de Limite (apenas para o proprietário) */}
            <div id="secao-admin" className="mt-8 border-t-2 border-dashed border-gray-300 pt-6" style={{ display: isOwner ? 'block' : 'none' }}>
              <h2 className="mb-3 pb-2 text-xl font-semibold text-white">🔒 {t('kipuBank.adminSection')}</h2>
              <p className="mb-4 text-gray-300 italic">{t('kipuBank.adminOptionsAvailable')}</p>

              <h3 className="text-lg font-semibold mb-2">📝 {t('kipuBank.updateBankLimit')}</h3>
              <div className="input-group mb-5">
                <label htmlFor="novo-limite" className="block mb-2 font-semibold text-gray-200">{t('kipuBank.newLimit')} (ETH):</label>
                <NumericFormat
                  value={newCap}
                  onValueChange={values => setNewCap(values.value)}
                  placeholder={t('kipuBank.limitExample')}
                  disabled={loading}
                  decimalScale={18}
                  allowNegative={false}
                  thousandSeparator={false}
                  className="w-full py-4 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
                  inputMode="decimal"
                />
              </div>
              <button
                id="btn-atualizar-cap"
                className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 border-none py-4 px-8 rounded-lg text-lg font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleAtualizarCap}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    {t('kipuBank.processing')}
                  </span>
                ) : t('kipuBank.updateBankLimit')}
              </button>
            </div>
          </div>

          {/* Exibir código do contrato .sol na parte de baixo, fonte preta */}
          <div className="mt-8 flex flex-col items-center">
            <button
              className="mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all"
              onClick={() => setShowContract(prev => !prev)}
            >
              {showContract ? t('kipuBank.hideContractCode') : t('kipuBank.showContractCode')}
            </button>
            {showContract && (
              <div className="w-full max-w-3xl mb-6 bg-gray-900 text-purple-200 rounded-lg p-4 overflow-auto max-h-96 border-2 border-purple-700">
                <h3 className="font-bold mb-2 text-purple-400">KipuBank.sol</h3>
                <pre className="text-xs whitespace-pre-wrap">{contractCode}</pre>
              </div>
            )}
          </div>
        </DarkCard>
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

export default KipuBank;

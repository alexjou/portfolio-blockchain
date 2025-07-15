import React, { useState, useEffect } from 'react';
import DarkCard from '../../components/DarkCard';
import { NumericFormat } from 'react-number-format';
import { useNotification } from '../../context/NotificationContext';
import Footer from "../../components/Footer";
import { ethers } from 'ethers';

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
  // Estados simulados para exibição inicial
  const { showNotification } = useNotification();
  const [connected, setConnected] = useState(false);
  const [userBalance, setUserBalance] = useState('0.0 ETH');
  const [bankBalance, setBankBalance] = useState('0.0 ETH');
  const [bankCap, setBankCap] = useState('0.0 ETH');
  const [availableSpace, setAvailableSpace] = useState('Carregando espaço disponível...');
  const [depositValue, setDepositValue] = useState('');
  // ...existing code...
  const [withdrawValue, setWithdrawValue] = useState('');
  const [newCap, setNewCap] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Carteira não conectada');
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
          setStatusMsg(`Carteira conectada! Endereço: ${address}`);
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
        mostrarToastAviso('MetaMask não está instalada!', 'error');
        return;
      }
      setLoading(true);
      const eth = (window as any).ethereum;
      await eth.request({ method: 'eth_requestAccounts' });
      const _provider = new ethers.BrowserProvider(eth);
      const _signer = await _provider.getSigner();
      const network = await _provider.getNetwork();
      if (network.chainId !== 11155111n) {
        mostrarToastAviso('Conecte à rede Sepolia!', 'error');
        setLoading(false);
        return;
      }
      const address = await _signer.getAddress();
      const contractCode = await _provider.getCode(contratoAddress);
      if (contractCode === '0x') {
        mostrarToastAviso('Contrato não encontrado na rede Sepolia!', 'error');
        setLoading(false);
        return;
      }
      const _contrato = new ethers.Contract(contratoAddress, contratoABI, _signer);
      setContrato(_contrato);
      setConnected(true);
      setStatusMsg(`Carteira conectada! Endereço: ${address}`);
      setShowStatus(true);
      window.dispatchEvent(new Event('walletUpdated'));
      // Verifica se é owner
      const owner = await _contrato.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
      await atualizarInformacoesBanco(_contrato);
      setLoading(false);
      mostrarToastAviso('Carteira conectada com sucesso!', 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || 'Erro ao conectar', 'error');
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
        mostrarToastAviso('Conecte sua carteira!', 'error');
        return;
      }
      if (!depositValue || parseFloat(depositValue) <= 0) {
        mostrarToastAviso('Insira um valor válido!', 'warning');
        return;
      }
      setLoading(true);
      const valor = ethers.parseEther(depositValue);
      const tx = await contrato.deposit({ value: valor });
      setStatusTransacao(`Depósito em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao(`Depósito realizado com sucesso!`);
      setDepositValue('');
      await atualizarInformacoesBanco();
      setLoading(false);
      mostrarToastAviso('Depósito realizado com sucesso!', 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || 'Erro ao depositar', 'error');
      setStatusTransacao(`Erro no depósito: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Sacar ETH
  const handleSacar = async () => {
    try {
      if (!contrato) {
        mostrarToastAviso('Conecte sua carteira!', 'error');
        return;
      }
      if (!withdrawValue || parseFloat(withdrawValue) <= 0) {
        mostrarToastAviso('Insira um valor válido!', 'warning');
        return;
      }
      setLoading(true);
      const valor = ethers.parseEther(withdrawValue);
      const tx = await contrato.withdraw(valor);
      setStatusTransacao(`Saque em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao(`Saque realizado com sucesso!`);
      setWithdrawValue('');
      await atualizarInformacoesBanco();
      setLoading(false);
      mostrarToastAviso('Saque realizado com sucesso!', 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || 'Erro ao sacar', 'error');
      setStatusTransacao(`Erro no saque: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Atualizar limite do banco
  const handleAtualizarCap = async () => {
    try {
      if (!contrato) {
        mostrarToastAviso('Conecte sua carteira!', 'error');
        return;
      }
      if (!newCap || parseFloat(newCap) <= 0) {
        mostrarToastAviso('Insira um valor válido!', 'warning');
        return;
      }
      setLoading(true);
      const valor = ethers.parseEther(newCap);
      const tx = await contrato.updateBankCap(valor);
      setStatusTransacao(`Atualização de limite em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao('Limite do banco atualizado com sucesso!');
      setNewCap('');
      await atualizarInformacoesBanco();
      setLoading(false);
      mostrarToastAviso('Limite do banco atualizado com sucesso!', 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || 'Erro ao atualizar limite', 'error');
      setStatusTransacao(`Erro na atualização: ${error.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center py-5 px-2">
        <DarkCard className="max-w-4xl w-full mx-auto">
          <h1 className="text-center mb-2 text-4xl font-bold">🏦 KipuBank</h1>
          <p className="text-center mb-8 italic text-gray-500">Banco digital seguro na blockchain Ethereum</p>

          <div className="contract-info bg-gray-800/80 p-5 rounded-xl mb-8 text-center text-sm break-words text-gray-100">
            <strong className="text-white">Contrato na Rede Sepolia:</strong><br />
            <a
              id="contract-link"
              className="text-blue-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded mt-1"
              href={`https://sepolia.etherscan.io/address/${contratoAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Endereço do contrato: ${contratoAddress}`}
            >
              {contratoAddress}
            </a>
            <div className="text-xs mt-1 text-gray-300">(Clique no endereço para visualizar no Etherscan)</div>
          </div>

          {/* Conexão */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold text-white">🔗 Conectar Carteira</h2>
            <button
              id="btn-conectar"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-4 px-8 rounded-lg text-lg font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleConnect}
              disabled={connected || loading}
            >
              {connected ? 'Carteira Conectada ✓' : 'Conectar MetaMask'}
            </button>
            <div
              id="status-conexao"
              className={`status font-semibold mt-4 p-4 rounded-lg ${connected ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-green-100 text-green-800 border-2 border-green-200'}`}
              style={{ display: showStatus ? 'block' : 'none' }}
            >
              {statusMsg}
            </div>
          </div>

          {/* Informações do Banco */}
          <div id="secao-operacoes" className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100" style={{ display: connected ? 'block' : 'none' }}>
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold text-white">🏦 Informações do Banco</h2>

            <div className="info-grid grid md:grid-cols-2 gap-4 mb-5 flex-col md:flex-row">
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-gray-700 break-words">
                <strong className="block mb-1 text-gray-200">Seu Saldo:</strong>
                <span className="text-lg font-bold text-green-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{userBalance}</span>
              </div>
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-gray-700 break-words">
                <strong className="block mb-1 text-gray-200">Saldo Total do Banco:</strong>
                <span className="text-lg font-bold text-green-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{bankBalance}</span>
              </div>
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-gray-700 break-words">
                <strong className="block mb-1 text-gray-200">Limite do Banco (Cap):</strong>
                <span className="text-lg font-bold text-green-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{bankCap}</span>
              </div>
              <div className="info-item bg-gray-900/80 p-4 rounded-lg border border-blue-700 break-words">
                <strong className="block mb-1 text-blue-300">Espaço Disponível:</strong>
                <span id="espaco-disponivel" className="text-lg font-bold text-blue-400 block p-2 bg-gray-900 bg-opacity-60 rounded mt-1">{availableSpace}</span>
              </div>
            </div>
            <div className="text-center bg-transparent border-none flex items-center justify-center">
              <button
                id="btn-atualizar"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-5 rounded-lg font-semibold w-auto transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={async () => {
                  await atualizarInformacoesBanco();
                  mostrarToastAviso('Saldos atualizados!', 'success');
                }}
                disabled={loading}
              >
                🔄 Atualizar Saldos
              </button>
            </div>
            <div id="status-transacao" className="status mt-6" style={{ display: statusTransacao ? 'block' : 'none', backgroundColor: statusTransacao.includes('sucesso') ? '#d4edda' : statusTransacao.includes('Erro') ? '#f8d7da' : undefined }}>
              {statusTransacao}
            </div>

            {/* Depósitos */}
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold mt-8 text-white">💰 Depósito</h2>
            <div className="input-group mb-5">
              <label htmlFor="valor-deposito" className="block mb-2 font-semibold text-gray-200">Valor a depositar (ETH):</label>
              <NumericFormat
                value={depositValue}
                onValueChange={values => setDepositValue(values.value)}
                placeholder="Ex: 0.01"
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
                  Processando...
                </span>
              ) : 'Depositar ETH'}
            </button>

            {/* Saques */}
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold mt-8 text-white">💸 Saque</h2>
            <div className="input-group mb-5">
              <label htmlFor="valor-saque" className="block mb-2 font-semibold text-gray-200">Valor a sacar (ETH):</label>
              <NumericFormat
                value={withdrawValue}
                onValueChange={values => setWithdrawValue(values.value)}
                placeholder="Ex: 0.01"
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
                  Processando...
                </span>
              ) : 'Sacar ETH'}
            </button>

            {/* Atualização de Limite (apenas para o proprietário) */}
            <div id="secao-admin" className="mt-8 border-t-2 border-dashed border-gray-300 pt-6" style={{ display: isOwner ? 'block' : 'none' }}>
              <h2 className="mb-3 pb-2 text-xl font-semibold text-white">🔒 Administração (Apenas Proprietário)</h2>
              <p className="mb-4 text-gray-300 italic">Estas opções estão disponíveis apenas para o proprietário do contrato.</p>

              <h3 className="text-lg font-semibold mb-2">📝 Atualizar Limite do Banco</h3>
              <div className="input-group mb-5">
                <label htmlFor="novo-limite" className="block mb-2 font-semibold text-gray-200">Novo limite (ETH):</label>
                <NumericFormat
                  value={newCap}
                  onValueChange={values => setNewCap(values.value)}
                  placeholder="Ex: 5.0"
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
                    Processando...
                  </span>
                ) : 'Atualizar Limite do Banco'}
              </button>
            </div>
          </div>

          {/* Exibir código do contrato .sol na parte de baixo, fonte preta */}
          <div className="mt-8 flex flex-col items-center">
            <button
              className="mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all"
              onClick={() => setShowContract(prev => !prev)}
            >
              {showContract ? 'Ocultar código do contrato' : 'Exibir código do contrato'}
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

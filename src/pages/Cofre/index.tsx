import React, { useEffect, useState } from 'react';
import DarkCard from '../../components/DarkCard';
import { NumericFormat } from 'react-number-format';
import { ethers } from 'ethers';
import { getInternalTxs, getContractEvents } from '../../services/etherscanService';
import { useNotification } from '../../context/NotificationContext';
import InteractionScene3D from '../../components/InteractionScene3D';

const Cofre: React.FC = () => {
  // Estados para mostrar código dos contratos
  const [copiedCliente, setCopiedCliente] = useState(false);
  const [copiedCofre, setCopiedCofre] = useState(false);
  const [showClienteCode, setShowClienteCode] = useState(false);
  const [showCofreCode, setShowCofreCode] = useState(false);
  const [clienteCode, setClienteCode] = useState('');
  const [cofreCode, setCofreCode] = useState('');
  const [transacoesCofre, setTransacoesCofre] = useState<any[]>([]);
  const [eventosCofre, setEventosCofre] = useState<any[]>([]);
  const [loadingTransacoes, setLoadingTransacoes] = useState(false);
  // 'cofre' = transações internas do Cofre, 'cliente' = transações internas do Cliente
  const [tipoTransacao, setTipoTransacao] = useState<'cofre' | 'cliente'>('cofre');

  // Endereço do contrato Cliente (deve ser ajustado conforme o deploy)
  const cofreEndereco = '0x10f965B5c5ab96d9d49d1c71D7D64844A3Db3533';
  const clienteAddress = "0x13cD34Ce931da65db0B61544D77A6aEc9BA90fAD";
  const clienteABI: any[] = [
    { "inputs": [], "name": "depositar", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "valor", "type": "uint256" }], "name": "sacar", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "_cofre", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "ownerAddr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "valor", "type": "uint256" }], "name": "DepositoDoOwner", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "ownerAddr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "valor", "type": "uint256" }], "name": "SaqueDoOwner", "type": "event" },
    { "stateMutability": "payable", "type": "receive" },
    { "inputs": [], "name": "cofreEndereco", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "consultarMeuSaldoNoCofre", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
  ];


  const { showNotification } = useNotification();
  const [connected, setConnected] = useState(false);
  const [saldoNoCofre, setSaldoNoCofre] = useState('0.0 ETH');
  const [depositValue, setDepositValue] = useState('');
  const [withdrawValue, setWithdrawValue] = useState('');
  const [statusMsg, setStatusMsg] = useState('Carteira não conectada');
  const [showStatus, setShowStatus] = useState(false);
  const [statusTransacao, setStatusTransacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [contrato, setContrato] = useState<any>(null);


  function formatarETH(valor: any, casasDecimais = 8) {
    if (typeof valor === 'bigint' || typeof valor === 'object') {
      const valorStr = parseFloat(ethers.formatEther(valor)).toFixed(casasDecimais);
      return valorStr.replace(/\.?0+$/, '') + ' ETH';
    } else {
      const valorStr = parseFloat(valor).toFixed(casasDecimais);
      return valorStr.replace(/\.?0+$/, '') + ' ETH';
    }
  }
  // Buscar e armazenar transações internas e eventos do Cofre apenas uma vez
  const buscarDadosCofre = async () => {
    setLoadingTransacoes(true);
    try {
      const [txs, eventos] = await Promise.all([
        getInternalTxs(cofreEndereco),
        getContractEvents(cofreEndereco)
      ]);
      setTransacoesCofre(txs);
      setEventosCofre(eventos);
      setLoadingTransacoes(false);
    } catch (error) {
      setTransacoesCofre([]);
      setEventosCofre([]);
      setLoadingTransacoes(false);
    }
  };

  const mostrarToastAviso = (mensagem: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    showNotification(mensagem, tipo);
  };

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
      const address = await _signer.getAddress();
      const contractCode = await _provider.getCode(clienteAddress);
      if (contractCode === '0x') {
        mostrarToastAviso('Contrato Cliente não encontrado!', 'error');
        setLoading(false);
        return;
      }
      const _contrato = new ethers.Contract(clienteAddress, clienteABI, _signer);
      setContrato(_contrato);
      setConnected(true);
      setStatusMsg(`Carteira conectada! Endereço: ${address}`);
      setShowStatus(true);
      window.dispatchEvent(new Event('walletUpdated'));
      // Verifica se é owner
      await atualizarSaldoNoCofre(_contrato);
      setLoading(false);
      mostrarToastAviso('Carteira conectada com sucesso!', 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || 'Erro ao conectar', 'error');
    }
  };

  const atualizarSaldoNoCofre = async (_contrato?: any) => {
    try {
      const contratoRef = _contrato || contrato;
      if (!contratoRef) return;
      const saldo = await contratoRef.consultarMeuSaldoNoCofre();
      setSaldoNoCofre(formatarETH(saldo));
    } catch (error: any) {
      mostrarToastAviso('Erro ao consultar saldo no Cofre!', 'error');
    }
  };

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
      const tx = await contrato.depositar({ value: valor });
      setStatusTransacao(`Depósito em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao(`Depósito realizado com sucesso!`);
      setDepositValue('');
      await atualizarSaldoNoCofre();
      setLoading(false);
      mostrarToastAviso('Depósito realizado com sucesso!', 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || 'Erro ao depositar', 'error');
      setStatusTransacao(`Erro no depósito: ${error.message || 'Erro desconhecido'}`);
    }
  };

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
      const tx = await contrato.sacar(valor);
      setStatusTransacao(`Saque em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setStatusTransacao(`Saque realizado com sucesso!`);
      setWithdrawValue('');
      await atualizarSaldoNoCofre();
      setLoading(false);
      mostrarToastAviso('Saque realizado com sucesso!', 'success');
    } catch (error: any) {
      setLoading(false);
      mostrarToastAviso(error.message || 'Erro ao sacar', 'error');
      setStatusTransacao(`Erro no saque: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Busca dados do Cofre apenas uma vez por refresh/conexão
  useEffect(() => {
    if (!connected) return;
    buscarDadosCofre();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // Carrega o conteúdo dos contratos Solidity
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    fetch(base + 'Cliente.sol')
      .then(res => res.text())
      .then(text => setClienteCode(text))
      .catch(() => setClienteCode('// Erro ao carregar Cliente.sol'));
    fetch(base + 'Cofre.sol')
      .then(res => res.text())
      .then(text => setCofreCode(text))
      .catch(() => setCofreCode('// Erro ao carregar Cofre.sol'));
  }, []);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const eth = (window as any).ethereum;
        if (!eth) return;
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const _provider = new ethers.BrowserProvider(eth);
          const _signer = await _provider.getSigner();
          const address = await _signer.getAddress();
          const contractCode = await _provider.getCode(clienteAddress);
          if (contractCode === '0x') return;
          const _contrato = new ethers.Contract(clienteAddress, clienteABI, _signer);
          setContrato(_contrato);
          setConnected(true);
          setStatusMsg(`Carteira conectada! Endereço: ${address}`);
          setShowStatus(true);
          window.dispatchEvent(new Event('walletUpdated'));
          // Verifica se é owner
          await atualizarSaldoNoCofre(_contrato);
        }
      } catch { }
    };
    checkWallet();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      <div className="flex justify-center m-8">
        <InteractionScene3D eventosCofre={eventosCofre} />
      </div>
      <main className="flex-1 flex items-center justify-center py-5 px-2">
        <DarkCard className="max-w-4xl w-full mx-auto">
          <h1 className="text-center mb-2 text-4xl font-bold text-white">🔐 Cofre</h1>
          <p className="text-center mb-8 italic text-gray-200">Gerencie o saldo do Cliente no Cofre (interação entre contratos)</p>
          {/* Adiciona Scene3D logo abaixo da mensagem de introdução */}
          <div className="contract-info bg-gray-800/80 p-5 rounded-xl mb-8 text-center text-sm break-words text-gray-100">
            <strong className="text-white">Contrato Cliente:</strong><br />
            <div className="flex items-center justify-center gap-2 mt-1">
              <a
                id="contract-link"
                className="text-blue-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded"
                href={`https://sepolia.etherscan.io/address/${clienteAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Endereço do contrato Cliente: ${clienteAddress}`}
              >
                {clienteAddress}
              </a>
              <button
                className={`ml-1 px-2 py-1 rounded flex items-center transition-colors duration-200 ${copiedCliente ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                title="Copiar endereço Cliente"
                onClick={() => {
                  navigator.clipboard.writeText(clienteAddress);
                  setCopiedCliente(true);
                  setTimeout(() => setCopiedCliente(false), 1000);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="#fff" strokeWidth="2" /><rect x="3" y="3" width="13" height="13" rx="2" fill="#fff" fillOpacity="0.2" stroke="#fff" strokeWidth="2" /></svg>
              </button>
            </div>
            <div className="text-xs mt-1 text-gray-300">(Clique para visualizar no Etherscan)</div>
            <div className="mt-2">
              <strong className="text-white">Contrato Cofre:</strong>
              <br />
              <div className="flex items-center justify-center gap-2 mt-1">
                <a
                  id="contract-link"
                  className="text-blue-600 hover:underline font-mono break-all text-base inline-block max-w-full px-2 py-1 bg-gray-200 rounded"
                  href={`https://sepolia.etherscan.io/address/${cofreEndereco}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Endereço do contrato Cofre: ${cofreEndereco}`}
                >
                  {cofreEndereco}
                </a>
                <button
                  className={`ml-1 px-2 py-1 rounded flex items-center transition-colors duration-200 ${copiedCofre ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                  title="Copiar endereço Cofre"
                  onClick={() => {
                    navigator.clipboard.writeText(cofreEndereco);
                    setCopiedCofre(true);
                    setTimeout(() => setCopiedCofre(false), 1000);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="#fff" strokeWidth="2" /><rect x="3" y="3" width="13" height="13" rx="2" fill="#fff" fillOpacity="0.2" stroke="#fff" strokeWidth="2" /></svg>
                </button>
              </div>
            </div>
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
              {connected ? 'Conectado' : loading ? 'Conectando...' : 'Conectar Carteira'}
            </button>
            <div
              id="status-conexao"
              className={`status font-semibold mt-4 p-4 rounded-lg ${connected ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-green-100 text-green-800 border-2 border-green-200'}`}
              style={{ display: showStatus ? 'block' : 'none' }}
            >
              {statusMsg}
            </div>
          </div>

          {/* Informações do Cofre */}
          <div id="secao-operacoes" className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100" style={{ display: connected ? 'block' : 'none' }}>
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold text-white">💼 Saldo do Cliente no Cofre</h2>
            <div className="info-grid grid gap-4 mb-5">
              <div className="bg-gray-900/80 rounded-lg p-4 shadow text-center">
                <span className="block text-lg font-bold text-blue-400">{saldoNoCofre}</span>
                <span className="block text-xs text-gray-200">Saldo do Cliente no Cofre</span>
              </div>
            </div>
            <div id="status-transacao" className="status mt-6" style={{ display: statusTransacao ? 'block' : 'none', backgroundColor: statusTransacao.includes('sucesso') ? '#d4edda' : statusTransacao.includes('Erro') ? '#f8d7da' : undefined }}>
              {statusTransacao}
            </div>

            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold mt-8 text-white">💰 Depósito no Cofre</h2>
            <div className="input-group mb-5">
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
              {loading ? 'Processando...' : 'Depositar no Cofre'}
            </button>

            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold mt-8 text-white">💸 Saque do Cofre</h2>
            <div className="input-group mb-5">
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
              {loading ? 'Processando...' : 'Sacar do Cofre'}
            </button>
          </div>

          {/* Sessão: Listar transações do Cofre */}
          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100" style={{ display: connected ? 'block' : 'none' }}>
            <h2 className="mb-5 pb-2 border-b-4 border-purple-500 text-xl font-semibold text-white">📜 Transações do Cofre</h2>
            <div className="mb-4 flex gap-2">
              <button
                className={`px-4 py-2 rounded font-semibold transition-all ${tipoTransacao === 'cofre' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-blue-800'}`}
                onClick={() => setTipoTransacao('cofre')}
                disabled={tipoTransacao === 'cofre'}
              >
                Transações Cofre
              </button>
              <button
                className={`px-4 py-2 rounded font-semibold transition-all ${tipoTransacao === 'cliente' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-blue-800'}`}
                onClick={() => setTipoTransacao('cliente')}
                disabled={tipoTransacao === 'cliente'}
              >
                Transações Cliente
              </button>
            </div>
            {loadingTransacoes ? (
              <div className="text-gray-400 text-sm">Carregando transações...</div>
            ) : (transacoesCofre.length === 0 && eventosCofre.length === 0) ? (
              <div className="text-gray-400 text-sm">Nenhuma transação encontrada ou não foi possível buscar.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="py-2 pr-4">Hash<br /><span className="text-gray-400 font-normal">Identificador único da transação</span></th>
                      <th className="py-2 pr-4">De<br /><span className="text-gray-400 font-normal">Endereço de origem</span></th>
                      <th className="py-2 pr-4">Para<br /><span className="text-gray-400 font-normal">Endereço de destino</span></th>
                      <th className="py-2 pr-4">Valor (ETH)<br /><span className="text-gray-400 font-normal">Valor transferido</span></th>
                      <th className="py-2 pr-4">Tipo<br /><span className="text-gray-400 font-normal">Depósito ou Saque</span></th>
                      <th className="py-2 pr-4">Etherscan<br /><span className="text-gray-400 font-normal">Ver detalhes</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Unifica e ordena por bloco, sem duplicar hash */}
                    {(() => {
                      // Decodifica eventos relevantes (DepositoDoOwner, SaqueDoOwner)
                      const eventosFormatados = eventosCofre.map(ev => {
                        const topics = ev.topics || [];
                        let tipo = '-';
                        if (topics[0] === '0x453529dac6ef979a41d67fbeabdfae29903c185f64d77aa690df9eca5f1aaa60') tipo = 'Depósito';
                        if (topics[0] === '0x014a0fee2e4f4636f4defb7c3c3662226d3d28152c5708f9ad50ef2e02a9b278') tipo = 'Saque';
                        const from = '0x' + topics[1]?.slice(-40);
                        const value = ev.data ? ethers.formatEther(BigInt(ev.data)) : '0.0000';
                        return {
                          hash: ev.transactionHash,
                          from,
                          to: cofreEndereco,
                          value,
                          tipo,
                          isEvent: true,
                          blockNumber: ev.blockNumber ? parseInt(ev.blockNumber) : 0,
                        };
                      });
                      // Transações internas
                      const txsFormatados = transacoesCofre.map(tx => ({
                        ...tx,
                        value: ethers.formatEther(tx.value || tx.amount || '0'),
                        tipo: (tx.to && tx.to.toLowerCase() === cofreEndereco.toLowerCase()) ? 'Depósito' : (tx.from && tx.from.toLowerCase() === cofreEndereco.toLowerCase()) ? 'Saque' : '-',
                        isEvent: false,
                        blockNumber: tx.blockNumber ? parseInt(tx.blockNumber) : 0,
                      }));

                      // Filtro por endereço
                      let todas: any[] = [];
                      if (tipoTransacao === 'cofre') {
                        // Só transações/eventos onde o endereço do Cofre está envolvido
                        todas = [...txsFormatados, ...eventosFormatados].filter(tx =>
                          (tx.from && tx.from.toLowerCase() === cofreEndereco.toLowerCase()) ||
                          (tx.to && tx.to.toLowerCase() === cofreEndereco.toLowerCase())
                        );
                      } else {
                        // Só transações/eventos onde o endereço do Cliente está envolvido
                        todas = [...txsFormatados, ...eventosFormatados].filter(tx =>
                          (tx.from && tx.from.toLowerCase() === clienteAddress.toLowerCase()) ||
                          (tx.to && tx.to.toLowerCase() === clienteAddress.toLowerCase())
                        );
                      }
                      // Unifica por hash (prioriza transação interna, senão evento)
                      const hashSet = new Set();
                      todas = todas.filter(tx => {
                        if (hashSet.has(tx.hash)) return false;
                        hashSet.add(tx.hash);
                        return true;
                      }).sort((a, b) => b.blockNumber - a.blockNumber);
                      return todas.map(tx => (
                        <tr key={tx.hash} className="border-b border-gray-800 hover:bg-gray-900/40">
                          <td className="py-1 pr-4 font-mono text-blue-300 max-w-[120px] truncate">
                            <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}</a>
                          </td>
                          <td className="py-1 pr-4 font-mono text-green-300 max-w-[120px] truncate">
                            <a href={`https://sepolia.etherscan.io/address/${tx.from}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{tx.from ? `${tx.from.slice(0, 5)}...${tx.from.slice(-4)}` : ''}</a>
                          </td>
                          <td className="py-1 pr-4 font-mono text-yellow-300 max-w-[120px] truncate">
                            {tx.to ? (
                              <a href={`https://sepolia.etherscan.io/address/${tx.to}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{`${tx.to.slice(0, 5)}...${tx.to.slice(-4)}`}</a>
                            ) : <span className="text-gray-400">(Contrato)</span>}
                          </td>
                          <td className="py-1 pr-4">
                            {parseFloat(tx.value).toFixed(18)}
                          </td>
                          <td className="py-1 pr-4">
                            {tx.tipo || '-'}
                          </td>
                          <td className="py-1 pr-4">
                            <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Ver</a>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                <div className="text-xs mt-2 text-gray-400">* Mostrando o histórico das transações internas e eventos do contrato Cofre. Os dados são fornecidos pela API do Etherscan.</div>
              </div>
            )}
          </div>

          {/* Botões e exibição dos contratos no final da página */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex gap-4 justify-center mb-4">
              <button
                className="mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all"
                onClick={() => setShowClienteCode(v => !v)}
              >
                {showClienteCode ? 'Ocultar Cliente.sol' : 'Mostrar Cliente.sol'}
              </button>
              <button
                className="mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all"
                onClick={() => setShowCofreCode(v => !v)}
              >
                {showCofreCode ? 'Ocultar Cofre.sol' : 'Mostrar Cofre.sol'}
              </button>
            </div>
            {showClienteCode && (
              <div className="mb-6 bg-gray-900 text-green-200 rounded-lg p-4 overflow-auto max-h-96 border-2 border-green-700 w-full">
                <h3 className="font-bold mb-2 text-green-400">Cliente.sol</h3>
                <pre className="text-xs whitespace-pre-wrap">{clienteCode}</pre>
              </div>
            )}
            {showCofreCode && (
              <div className="mb-6 bg-gray-900 text-blue-200 rounded-lg p-4 overflow-auto max-h-96 border-2 border-blue-700 w-full">
                <h3 className="font-bold mb-2 text-blue-400">Cofre.sol</h3>
                <pre className="text-xs whitespace-pre-wrap">{cofreCode}</pre>
              </div>
            )}
          </div>

        </DarkCard>
      </main>
      <footer className="mt-auto py-6 text-center text-gray-400">
        &copy; {new Date().getFullYear()} Portfólio Blockchain ETH-KIPU + UFPE. Todos os direitos reservados.
      </footer>
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

export default Cofre;

import React, { useState, useEffect } from 'react';
import DarkCard from '../../components/DarkCard';
import Footer from "../../components/Footer";
import { ethers } from 'ethers';

const contratoAddress = "0x907daae5c9bd87398f2423a7389f5013013b6958";
const contratoABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "mens", "type": "string" }
    ],
    "name": "guardarMensagem",
    "outputs": [{ "internalType": "bool", "name": "sucesso", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lerMensagem",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractUrl = `https://sepolia.etherscan.io/address/${contratoAddress}`;

const SeedGuard: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Carteira não conectada');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('Clique em "Ler Minha Mensagem" para ver sua mensagem guardada');
  const [resultType, setResultType] = useState<'vazio' | 'sucesso' | 'erro'>('vazio');
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingRead, setLoadingRead] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contrato, setContrato] = useState<ethers.Contract | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [contractCode, setContractCode] = useState('');


  // Conectar carteira/metamask
  const connectWallet = async () => {
    try {
      setLoadingConnect(true);
      if (typeof window.ethereum === 'undefined') {
        setStatusMsg('MetaMask não instalada!');
        setResult('Instale a extensão MetaMask para usar.');
        setResultType('erro');
        setLoadingConnect(false);
        return;
      }
      if (!(window.ethereum as any).isMetaMask) {
        setStatusMsg('Use a extensão MetaMask oficial.');
        setResult('Extensão MetaMask não detectada.');
        setResultType('erro');
        setLoadingConnect(false);
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts || accounts.length === 0) {
        <Footer />
        setStatusMsg('Nenhuma conta selecionada.');
        setResult('Desbloqueie sua MetaMask e tente novamente.');
        setResultType('erro');
        setLoadingConnect(false);
        return;
      }
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      if (network.chainId !== 11155111n) {
        setStatusMsg('Rede incorreta! Conecte à Sepolia.');
        setResult('Conecte à rede Sepolia (Chain ID: 11155111).');
        setResultType('erro');
        setLoadingConnect(false);
        return;
      }
      const address = await ethersSigner.getAddress();
      const contractCode = await ethersProvider.getCode(contratoAddress);
      if (contractCode === '0x') {
        setStatusMsg('Contrato não encontrado na rede.');
        setResult('Verifique se o contrato foi implantado corretamente.');
        setResultType('erro');
        setLoadingConnect(false);
        return;
      }
      const contratoInstance = new ethers.Contract(contratoAddress, contratoABI, ethersSigner);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContrato(contratoInstance);
      setWalletConnected(true);
      setStatusMsg(`Carteira conectada! Endereço: ${address}`);
      setResult('Carteira conectada com sucesso!');
      setResultType('sucesso');
      setLoadingConnect(false);
      window.dispatchEvent(new Event('walletUpdated'));
      console.log('Carteira conectada:', address);
    } catch (error: any) {
      setStatusMsg('Erro ao conectar carteira.');
      setResult(error.message || 'Erro desconhecido ao conectar.');
      setResultType('erro');
      setLoadingConnect(false);
      console.error('Erro ao conectar carteira:', error);
    }
  };
  // Detecta conexão automática da carteira ao montar
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const eth = (window as any).ethereum;
        if (!eth) return;
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const ethersProvider = new ethers.BrowserProvider(eth);
          const ethersSigner = await ethersProvider.getSigner();
          const network = await ethersProvider.getNetwork();
          if (network.chainId !== 11155111n) return;
          const address = await ethersSigner.getAddress();
          const contractCode = await ethersProvider.getCode(contratoAddress);
          if (contractCode === '0x') return;
          const contratoInstance = new ethers.Contract(contratoAddress, contratoABI, ethersSigner);
          setProvider(ethersProvider);
          setSigner(ethersSigner);
          setContrato(contratoInstance);
          setWalletConnected(true);
          setStatusMsg(`Carteira conectada! (${address})`);
          setResult('Carteira conectada com sucesso!');
          setResultType('sucesso');
          window.dispatchEvent(new Event('walletUpdated'));
        }
      } catch { }
    };
    checkWallet();
  }, []);

  // Guardar mensagem na blockchain
  const handleSaveMessage = async () => {
    if (!contrato || !provider || !signer) {
      setResult('Conecte sua carteira primeiro!');
      setResultType('erro');
      return;
    }
    if (!message.trim()) {
      setResult('Digite uma mensagem antes de guardar.');
      setResultType('erro');
      return;
    }
    setLoadingSave(true);
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        setResult('Conecte à rede Sepolia (Chain ID: 11155111).');
        setResultType('erro');
        setLoadingSave(false);
        return;
      }
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance === 0n) {
        setResult('Saldo insuficiente! Obtenha ETH de teste (Sepolia).');
        setResultType('erro');
        setLoadingSave(false);
        return;
      }
      const tx = await contrato.guardarMensagem(message);
      setResult('Transação enviada! Aguardando confirmação...');
      setResultType('sucesso');
      await tx.wait();
      setResult('Mensagem guardada com sucesso!');
      setResultType('sucesso');
      setMessage('');
      setLoadingSave(false);
      console.log('Mensagem guardada:', message);
    } catch (error: any) {
      setResult(error.message || 'Erro ao guardar mensagem.');
      setResultType('erro');
      setLoadingSave(false);
      console.error('Erro ao guardar mensagem:', error);
    }
  };

  // Ler mensagem da blockchain
  const handleReadMessage = async () => {
    if (!contrato) {
      setResult('Conecte sua carteira primeiro!');
      setResultType('erro');
      return;
    }
    setLoadingRead(true);
    try {
      const msg = await contrato.lerMensagem();
      if (msg && msg.trim()) {
        setResult(msg);
        setResultType('sucesso');
        console.log('Mensagem lida:', msg);
      } else {
        setResult('Nenhuma mensagem encontrada ou mensagem vazia.');
        setResultType('erro');
      }
      setLoadingRead(false);
    } catch (error: any) {
      setResult(error.message || 'Erro ao ler mensagem.');
      setResultType('erro');
      setLoadingRead(false);
      console.error('Erro ao ler mensagem:', error);
    }
  };

  // Carrega o conteúdo do contrato Solidity
  useEffect(() => {
    // Corrige o caminho para funcionar em produção (GitHub Pages)
    const base = import.meta.env.BASE_URL || '/';
    fetch(base + 'SeedGuard.sol')
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(text => setContractCode(text))
      .catch(() => setContractCode('// Erro ao carregar o contrato Solidity.'));
  }, []);

  // Mensagens de status para cada etapa
  const connectMsg = statusMsg;
  const saveMsg = resultType === 'sucesso' && result === 'Mensagem guardada com sucesso!' ? result : '';
  // Só exibe mensagem de leitura se não for erro, não for mensagem de gravação e não for mensagem de conexão
  const readMsg = resultType !== 'erro' && result !== 'Mensagem guardada com sucesso!' && !result.includes('Carteira conectada') ? result : '';

  // Tailwind classes para status/resultados
  const statusClass = 'p-4 rounded-lg mt-4 font-semibold block ' +
    (walletConnected ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-gray-100 text-gray-700 border-2 border-gray-200');
  const resultClass = 'p-5 rounded-lg mt-5 font-medium min-h-[60px] flex items-center break-words ' +
    (resultType === 'sucesso' ? 'bg-green-100 text-green-800 border-2 border-green-200' :
      resultType === 'erro' ? 'bg-red-100 text-red-800 border-2 border-red-200' :
        'bg-yellow-100 text-yellow-800 border-2 border-yellow-200');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      {/* Conteúdo principal SeedGuard */}
      <main className="flex-1 flex items-center justify-center py-5 px-2">
        <DarkCard className="max-w-4xl w-full mx-auto">
          <h1 className="text-center mb-2 text-4xl font-bold">🛡️ SeedGuard</h1>
          <p className="text-center mb-8 italic text-gray-500">Guardião seguro de suas mensagens na blockchain</p>

          <div className="bg-gray-900/80 border-2 border-gray-700 rounded-lg mb-8 text-center text-sm text-gray-100">
            <strong className="text-gray-100">Contrato na Rede Sepolia:</strong><br />
            <a
              id="contract-link"
              className="text-blue-400 hover:underline font-mono break-all"
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contratoAddress}
            </a>
          </div>

          {/* Conexão */}
          <div className="bg-gray-900/80 border-2 border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-gray-100 mb-5 pb-2 border-b-4 border-blue-700 text-xl font-semibold">🔗 Conectar Carteira</h2>
            <button
              id="btn-conectar"
              onClick={connectWallet}
              disabled={walletConnected || loadingConnect}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 px-8 rounded-lg text-lg font-semibold transition-all duration-300 shadow hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {walletConnected ? 'Carteira Conectada ✓' : loadingConnect ? 'Conectando...' : 'Conectar MetaMask'}
            </button>
            <div id="status-conexao" className={statusClass}>
              {connectMsg}
            </div>
          </div>

          {/* Guardar Mensagem e Ler Mensagem só aparecem se a carteira estiver conectada */}
          {walletConnected && (
            <>
              {/* Guardar Mensagem */}
              <div className="bg-gray-900/80 border-2 border-gray-700 rounded-xl p-6 mb-6">
                <h2 className="text-gray-100 mb-5 pb-2 border-b-4 border-green-700 text-xl font-semibold">💾 Guardar Mensagem</h2>
                <div className="mb-5">
                  <label htmlFor="input-mensagem" className="block mb-2 font-semibold text-gray-100">Digite sua mensagem:</label>
                  <textarea
                    id="input-mensagem"
                    placeholder="Digite aqui a mensagem que deseja guardar na blockchain..."
                    rows={4}
                    maxLength={500}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full p-4 border-2 border-gray-700 bg-gray-950 text-gray-100 rounded-lg text-base transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    disabled={loadingConnect}
                  />
                </div>
                <button
                  id="btn-guardar"
                  className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-4 px-8 rounded-lg text-lg font-semibold transition-all duration-300 shadow hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleSaveMessage}
                  disabled={loadingSave}
                >
                  {loadingSave ? 'Guardando...' : 'Guardar Mensagem'}
                </button>
                {/* Mensagem de status da gravação */}
                {saveMsg && (
                  <div className={resultClass + ' mt-4'}>{saveMsg}</div>
                )}
              </div>

              {/* Ler Mensagem */}
              <div className="bg-gray-900/80 border-2 border-gray-700 rounded-xl p-6 mb-2">
                <h2 className="text-gray-100 mb-5 pb-2 border-b-4 border-cyan-700 text-xl font-semibold">📖 Ler Mensagem</h2>
                <button
                  id="btn-ler"
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-700 text-white py-4 px-8 rounded-lg text-lg font-semibold transition-all duration-300 shadow hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleReadMessage}
                  disabled={loadingRead}
                >
                  {loadingRead ? 'Lendo...' : 'Ler Minha Mensagem'}
                </button>
                {/* Mensagem de status da leitura */}
                {readMsg && (
                  <div id="mensagem-resultado" className={resultClass + ' mt-4'}>
                    {readMsg}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Exibir contrato em tela */}
          <div className="mb-8 flex flex-col items-center">
            <button
              className="mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all"
              onClick={() => setShowContract(prev => !prev)}
            >
              {showContract ? 'Ocultar código do contrato' : 'Exibir código do contrato'}
            </button>
            {showContract && (
              <div className="mb-6 bg-gray-900 text-purple-200 rounded-lg p-4 overflow-auto max-h-96 border-2 border-purple-700 w-full">
                <h3 className="font-bold mb-2 text-purple-400">SeedGuard.sol</h3>
                <pre className="text-xs whitespace-pre-wrap" style={{ fontFamily: 'Fira Mono, monospace' }}>{contractCode}</pre>
              </div>
            )}
          </div>
        </DarkCard>
      </main>

      <Footer />

      {/* Custom Styles */}
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

export default SeedGuard;

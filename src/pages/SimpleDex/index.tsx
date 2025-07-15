

import React, { useState, useEffect } from "react";
import { NumericFormat } from "react-number-format";
import type { NumberFormatValues } from "react-number-format";
import { ethers } from "ethers";
import Footer from "../../components/Footer";
import simpleDexAbiJson from "./SimpleDEX.abi.json";
import tokenAAbiJson from "./TokenA.abi.json";
import tokenBAbiJson from "./TokenB.abi.json";

const SIMPLE_DEX_ADDRESS = "0x2d8454E3AccD8177dC58e3970cB3eF98D7942746";
const TOKEN_A_ADDRESS = "0xC45e880CFfA0953AbAc6cb405bd8e37D43b500BB";
const TOKEN_B_ADDRESS = "0xB332Bc14E80b2E0ACd53c49e66aC8ad3410D05D4";
const simpleDexAbi: any[] = simpleDexAbiJson;

const SimpleDex: React.FC = () => {
  const [amountA, setAmountA] = useState(""); // Adicionar Liquidez
  const [amountB, setAmountB] = useState("");
  const [amountARemove, setAmountARemove] = useState(""); // Remover Liquidez
  const [amountBRemove, setAmountBRemove] = useState("");
  const [logRemove, setLogRemove] = useState("");
  const [amountAApprove, setAmountAApprove] = useState("");
  const [amountBApprove, setAmountBApprove] = useState("");
  const [logA, setLogA] = useState("");
  const [logB, setLogB] = useState("");
  const [logLiq, setLogLiq] = useState("");
  const [amountAIn, setAmountAIn] = useState("");
  const [amountBIn, setAmountBIn] = useState("");
  const [statusMsg, setStatusMsg] = useState("Carteira não conectada");
  const [showStatus, setShowStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [resultado, setResultado] = useState("");
  const [aprovando, setAprovando] = useState(false);
  const [copied, setCopied] = useState<string>("");

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(""), 1200);
  };
  // Função para aprovar TokenA
  const aprovarTokenA = async (valor: string) => {
    setAprovando(true);
    setLogA("");
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask não detectado!");
      const eth = (window as any).ethereum;
      await eth.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, tokenAAbiJson, signer);
      const tx = await tokenA.approve(SIMPLE_DEX_ADDRESS, ethers.parseUnits(valor, 18));
      setLogA(`Aprovando TokenA... Hash: ${tx.hash}`);
      await tx.wait();
      setLogA("TokenA aprovado para o SimpleDEX!");
    } catch (err: any) {
      setLogA("Erro ao aprovar TokenA: " + (err.message || "Erro desconhecido"));
    }
    setAprovando(false);
  };

  // Função para aprovar TokenB
  const aprovarTokenB = async (valor: string) => {
    setAprovando(true);
    setLogB("");
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask não detectado!");
      const eth = (window as any).ethereum;
      await eth.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, tokenBAbiJson, signer);
      const tx = await tokenB.approve(SIMPLE_DEX_ADDRESS, ethers.parseUnits(valor, 18));
      setLogB(`Aprovando TokenB... Hash: ${tx.hash}`);
      await tx.wait();
      setLogB("TokenB aprovado para o SimpleDEX!");
    } catch (err: any) {
      setLogB("Erro ao aprovar TokenB: " + (err.message || "Erro desconhecido"));
    }
    setAprovando(false);
  };

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
        const _contract = new ethers.Contract(SIMPLE_DEX_ADDRESS, simpleDexAbi, _signer);
        setContract(_contract);
        setConnected(true);
        setStatusMsg("Carteira conectada!");
        setShowStatus(true);
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        setStatusMsg(error.message || "Erro ao conectar");
        setShowStatus(true);
      }
    };
    init();
  }, []);

  const adicionarLiquidez = async () => {
    setLogLiq("");
    if (!contract) {
      setLogLiq("Conecte sua carteira!");
      return;
    }
    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      setLogLiq("Insira valores válidos!");
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.addLiquidity(
        ethers.parseUnits(amountA, 18),
        ethers.parseUnits(amountB, 18)
      );
      setLogLiq(`Depósito em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setLogLiq("Liquidez adicionada!");
    } catch (err: any) {
      setLogLiq("Erro ao adicionar liquidez: " + (err.message || "Erro desconhecido"));
    }
    setLoading(false);
  };


  const removerLiquidez = async () => {
    setLogRemove("");
    if (!contract) {
      setLogRemove("Conecte sua carteira!");
      return;
    }
    if (!amountARemove || !amountBRemove || parseFloat(amountARemove) <= 0 || parseFloat(amountBRemove) <= 0) {
      setLogRemove("Insira valores válidos!");
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.removeLiquidity(
        ethers.parseUnits(amountARemove, 18),
        ethers.parseUnits(amountBRemove, 18)
      );
      setLogRemove(`Remoção em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setLogRemove("Liquidez removida!");
    } catch (err: any) {
      setLogRemove("Erro ao remover liquidez: " + (err.message || "Erro desconhecido"));
    }
    setLoading(false);
  };

  const swapAforB = async () => {
    if (!contract) {
      setResultado("Conecte sua carteira!");
      return;
    }
    if (!amountAIn || parseFloat(amountAIn) <= 0) {
      setResultado("Insira um valor válido!");
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.swapAforB(ethers.parseUnits(amountAIn, 18));
      setResultado(`Swap em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setResultado("Swap A por B realizado!");
    } catch (err: any) {
      setResultado("Erro no swap: " + (err.message || "Erro desconhecido"));
    }
    setLoading(false);
  };

  const swapBforA = async () => {
    if (!contract) {
      setResultado("Conecte sua carteira!");
      return;
    }
    if (!amountBIn || parseFloat(amountBIn) <= 0) {
      setResultado("Insira um valor válido!");
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.swapBforA(ethers.parseUnits(amountBIn, 18));
      setResultado(`Swap em processamento... Hash: ${tx.hash}`);
      await tx.wait();
      setResultado("Swap B por A realizado!");
    } catch (err: any) {
      setResultado("Erro no swap: " + (err.message || "Erro desconhecido"));
    }
    setLoading(false);
  };

  const verPreco = async (tokenAddress: string) => {
    if (!contract) {
      setResultado("Conecte sua carteira!");
      return;
    }
    setLoading(true);
    try {
      const price = await contract.getPrice(tokenAddress);
      setResultado(`Preço: ${ethers.formatUnits(price, 18)}`);
    } catch (err: any) {
      setResultado("Erro ao consultar preço: " + (err.message || "Erro desconhecido"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center py-5 px-2">
        <div className="max-w-3xl w-full mx-auto bg-gray-800/80 p-8 rounded-xl shadow-lg">
          <h1 className="text-center mb-2 text-4xl font-bold text-white">🔄 SimpleDEX</h1>
          <p className="text-center mb-8 italic text-gray-200">Troque tokens e gerencie liquidez de forma descentralizada</p>
          <div className="contract-info bg-gray-900/80 p-5 rounded-xl mb-8 text-center text-sm break-words text-gray-100">
            <strong className="text-white">Endereços dos Contratos:</strong><br />
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
                  className="ml-1 px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-900 text-xs font-semibold"
                  onClick={() => handleCopy(SIMPLE_DEX_ADDRESS)}
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
                  className="ml-1 px-2 py-1 bg-green-700 text-white rounded hover:bg-green-900 text-xs font-semibold"
                  onClick={() => handleCopy(TOKEN_A_ADDRESS)}
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
                  className="ml-1 px-2 py-1 bg-purple-700 text-white rounded hover:bg-purple-900 text-xs font-semibold"
                  onClick={() => handleCopy(TOKEN_B_ADDRESS)}
                  title="Copiar endereço"
                >
                  {copied === TOKEN_B_ADDRESS ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
            <div className="text-xs mt-1 text-gray-300">(Clique para visualizar ou copiar no Etherscan)</div>
          </div>

          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-blue-500 text-xl font-semibold text-white">🔗 Conectar Carteira</h2>
            <div className="flex flex-col gap-2">
              <div className={`status font-semibold p-4 rounded-lg ${connected ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}`} style={{ display: showStatus ? 'block' : 'none' }}>
                {statusMsg}
              </div>
            </div>
          </div>

          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-purple-500 text-xl font-semibold text-white">💼 Liquidez</h2>
            <div className="mb-6 flex flex-row gap-6 justify-center items-center">
              {/* Aprovar TokenA */}
              <div className="flex flex-col gap-2 bg-gray-900/80 p-4 rounded-xl border border-green-700 min-w-[260px] max-w-xs w-full">
                <h3 className="mb-2 text-lg font-semibold text-green-400">Aprovar TokenA</h3>
                <NumericFormat
                  value={amountAApprove}
                  onValueChange={(values: NumberFormatValues) => setAmountAApprove(values.value)}
                  thousandSeparator={false}
                  decimalScale={18}
                  allowNegative={false}
                  placeholder="Valor para aprovar TokenA"
                  className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900"
                  disabled={aprovando || loading}
                />
                <button
                  className={`bg-gradient-to-r from-green-500 to-green-700 text-white border-none py-2 px-4 rounded-lg text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${aprovando ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => aprovarTokenA(amountAApprove)}
                  disabled={aprovando || loading || !amountAApprove || parseFloat(amountAApprove) <= 0}
                >
                  {aprovando ? 'Aprovando...' : 'Aprovar TokenA'}
                </button>
                <div className={`status font-semibold p-2 rounded-lg text-xs mt-2 ${logA.includes('Erro') ? 'bg-red-100 text-red-800 border-2 border-red-200' : logA ? 'bg-gray-900 text-white border-2 border-gray-700' : ''}`} style={{ display: logA ? 'block' : 'none' }}>
                  {logA}
                </div>
              </div>

              {/* Aprovar TokenB */}
              <div className="flex flex-col gap-2 bg-gray-900/80 p-4 rounded-xl border border-purple-700 min-w-[260px] max-w-xs w-full">
                <h3 className="mb-2 text-lg font-semibold text-purple-400">Aprovar TokenB</h3>
                <NumericFormat
                  value={amountBApprove}
                  onValueChange={(values: NumberFormatValues) => setAmountBApprove(values.value)}
                  thousandSeparator={false}
                  decimalScale={18}
                  allowNegative={false}
                  placeholder="Valor para aprovar TokenB"
                  className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900"
                  disabled={aprovando || loading}
                />
                <button
                  className={`bg-gradient-to-r from-purple-500 to-purple-700 text-white border-none py-2 px-4 rounded-lg text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${aprovando ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => aprovarTokenB(amountBApprove)}
                  disabled={aprovando || loading || !amountBApprove || parseFloat(amountBApprove) <= 0}
                >
                  {aprovando ? 'Aprovando...' : 'Aprovar TokenB'}
                </button>
                <div className={`status font-semibold p-2 rounded-lg text-xs mt-2 ${logB.includes('Erro') ? 'bg-red-100 text-red-800 border-2 border-red-200' : logB ? 'bg-gray-900 text-white border-2 border-gray-700' : ''}`} style={{ display: logB ? 'block' : 'none' }}>
                  {logB}
                </div>
              </div>
            </div>

            {/* Adicionar Liquidez */}
            <div className="flex flex-col gap-2 bg-gray-900/80 p-4 rounded-xl border border-blue-700 mb-6">
              <h3 className="mb-2 text-lg font-semibold text-blue-400">Adicionar Liquidez</h3>
              <NumericFormat
                value={amountA}
                onValueChange={(values: NumberFormatValues) => setAmountA(values.value)}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenA"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading}

              />
              <NumericFormat
                value={amountB}
                onValueChange={(values: NumberFormatValues) => setAmountB(values.value)}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenB"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading}

              />
              <button
                className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={adicionarLiquidez}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Adicionar Liquidez'}
              </button>
              <div className={`status font-semibold p-2 rounded-lg text-xs mt-2 ${logLiq.includes('Erro') ? 'bg-red-100 text-red-800 border-2 border-red-200' : logLiq ? 'bg-gray-900 text-white border-2 border-gray-700' : ''}`} style={{ display: logLiq ? 'block' : 'none' }}>
                {logLiq}
              </div>
            </div>

            {/* Remover Liquidez */}
            <div className="flex flex-col gap-2 bg-gray-900/80 p-4 rounded-xl border border-red-700">
              <h3 className="mb-2 text-lg font-semibold text-red-400">Remover Liquidez</h3>
              <NumericFormat
                value={amountARemove}
                onValueChange={(values: NumberFormatValues) => setAmountARemove(values.value)}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenA"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading}

              />
              <NumericFormat
                value={amountBRemove}
                onValueChange={(values: NumberFormatValues) => setAmountBRemove(values.value)}
                thousandSeparator={false}
                decimalScale={18}
                allowNegative={false}
                placeholder="Quantidade de TokenB"
                className="w-full py-2 px-4 border-2 border-gray-700 rounded-lg text-base text-gray-100 bg-gray-900 mb-2"
                disabled={loading}

              />
              <button
                className={`bg-gradient-to-r from-red-500 to-blue-500 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={removerLiquidez}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Remover Liquidez'}
              </button>
              <div className={`status font-semibold p-2 rounded-lg text-xs mt-2 ${logRemove.includes('Erro') ? 'bg-red-100 text-red-800 border-2 border-red-200' : logRemove ? 'bg-gray-900 text-white border-2 border-gray-700' : ''}`} style={{ display: logRemove ? 'block' : 'none' }}>
                {logRemove}
              </div>
            </div>
          </div>

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
                  className={`bg-gradient-to-r from-yellow-400 to-purple-600 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                  className={`bg-gradient-to-r from-yellow-400 to-purple-600 text-white border-none py-2 px-6 rounded-lg text-base font-semibold w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={swapBforA}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Swap B por A'}
                </button>
              </div>
            </div>
          </div>

          <div className="section bg-gray-800/80 border-2 border-gray-700 rounded-xl p-6 mb-6 text-gray-100">
            <h2 className="mb-5 pb-2 border-b-4 border-green-500 text-xl font-semibold text-white">💲 Consultar Preço</h2>
            <div className="flex gap-4 justify-center mb-4">
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all"
                onClick={() => verPreco(TOKEN_A_ADDRESS)}
                disabled={loading}
              >
                Preço TokenA
              </button>
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:-translate-y-1 hover:shadow-lg transition-all"
                onClick={() => verPreco(TOKEN_B_ADDRESS)}
                disabled={loading}
              >
                Preço TokenB
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className={`status font-semibold p-4 rounded-lg ${resultado.includes('sucesso') ? 'bg-green-100 text-green-800 border-2 border-green-200' : resultado.includes('Erro') ? 'bg-red-100 text-red-800 border-2 border-red-200' : 'bg-gray-900 text-white border-2 border-gray-700'}`} style={{ display: resultado ? 'block' : 'none', minHeight: '48px' }}>
              {resultado}
            </div>
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

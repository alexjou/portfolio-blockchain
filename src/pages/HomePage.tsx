import { images } from '../assets/images';
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 gap-12">
        <div className="space-y-10 w-full max-w-3xl text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-move drop-shadow-lg">
            Portfólio <span className="block md:inline">Blockchain com Ethereum</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-medium drop-shadow">
            Bem-vindo!<br />
            Sou desenvolvedor focado em <span className="font-bold text-blue-300">Ethereum & Web3</span>, apaixonado por criar soluções descentralizadas, seguras e inovadoras.<br /><br />
            Aqui você encontra projetos práticos, smart contracts em <span className="font-bold text-yellow-300">Solidity</span>, integrações com <span className="font-bold text-cyan-300">Ethers.js</span>, dicas de segurança, e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
            <Link to="/blockchain3d" className="btn-hero bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400/50 animate-glow">BlockChain3D</Link>
            <a href="#projetos" className="btn-hero bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 hover:from-blue-700 hover:to-green-700 px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl transition-all duration-300 border-2 border-transparent hover:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 animate-glow">Ver Projetos</a>
          </div>
          <div className="flex flex-wrap gap-3 mt-8 justify-center">
            <span className="bg-green-600 px-4 py-1 rounded-full text-base font-semibold shadow">ETH-KIPU</span>
            <span className="bg-blue-500 px-4 py-1 rounded-full text-base font-semibold shadow">UFPE</span>
            <span className="bg-orange-500 px-4 py-1 rounded-full text-base font-semibold shadow">Ethereum</span>
            <span className="bg-yellow-500 px-4 py-1 rounded-full text-base font-semibold shadow">Solidity</span>
            <span className="bg-cyan-500 px-4 py-1 rounded-full text-base font-semibold shadow">Ethers.js</span>
            <span className="bg-pink-500 px-4 py-1 rounded-full text-base font-semibold shadow">Web3</span>
            <span className="bg-gray-700 px-4 py-1 rounded-full text-base font-semibold shadow">Segurança</span>
          </div>
        </div>
      </section>
      {/* Stack Ethereum */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow">Stack Ethereum & Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.ethereum} alt="Ethereum" className="w-12 h-12 mb-2" />
            <span className="font-bold text-blue-300">Ethereum</span>
            <span className="text-xs text-gray-300 mt-1">Blockchain, RPC, Testnets</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-yellow-900 to-yellow-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.solidity} alt="Solidity" className="w-12 h-12 mb-2" />
            <span className="font-bold text-yellow-300">Solidity</span>
            <span className="text-xs text-gray-300 mt-1">Smart Contracts, Patterns</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-cyan-900 to-cyan-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.reactLogo} alt="React - Ethers.js" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-cyan-300">React - Ethers.js</span>
            <span className="text-xs text-gray-300 mt-1">Web3, Integração, Frontend</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-pink-900 to-pink-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.metamask} alt="Metamask" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-pink-300">Metamask</span>
            <span className="text-xs text-gray-300 mt-1">Carteiras, Assinaturas</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.remix} alt="Remix" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-indigo-300">Remix</span>
            <span className="text-xs text-gray-300 mt-1">IDE Online, Deploy, Testes</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.security} alt="Security" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-gray-200">Segurança</span>
            <span className="text-xs text-gray-300 mt-1">Auditoria, Boas Práticas</span>
          </div>
        </div>
      </section>

      {/* Projetos */}
      <section id="projetos" className="px-8 py-12 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">Projetos</h2>
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8 justify-center">
          {/* Card BlockChain3D */}
          <Link to="/blockchain3d" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-pink-500 bg-gradient-to-br from-gray-900 via-pink-900 to-blue-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🌐</span>
            <span className="text-pink-300 font-extrabold text-xl mb-2 drop-shadow">BlockChain3D</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">Visualize conceitos de blockchain e Ethereum em 3D.<br />Interaja com blocos, transações e contratos de forma imersiva.</span>
            <span className="text-xs text-pink-400 mt-2 font-semibold">Experiência 3D</span>
          </Link>
          {/* Card SeedGuard */}
          <Link to="/seedguard" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-green-500 bg-gradient-to-br from-gray-900 via-green-900 to-cyan-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🛡️</span>
            <span className="text-green-300 font-extrabold text-xl mb-2 drop-shadow">SeedGuard</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">Guarde mensagens de forma segura na blockchain Ethereum.<br />Salve e recupere textos protegidos por sua carteira.</span>
            <span className="text-xs text-green-400 mt-2 font-semibold">Guardião de mensagens</span>
          </Link>
          {/* Card KipuBank */}
          <Link to="/kipubank" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-blue-500 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🏦</span>
            <span className="text-blue-300 font-extrabold text-xl mb-2 drop-shadow">KipuBank</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">Banco digital descentralizado.<br />Deposite, saque e consulte seu saldo em ETH com limite e controle via smart contract.</span>
            <span className="text-xs text-blue-400 mt-2 font-semibold">Banco descentralizado</span>
          </Link>
          {/* Card Cofre */}
          <Link to="/cofre" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-yellow-500 bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🔐</span>
            <span className="text-yellow-300 font-extrabold text-xl mb-2 drop-shadow">Cofre</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">Gerencie o saldo do Cliente em um Cofre digital.<br />Deposite, saque e acompanhe transações internas entre contratos Ethereum.</span>
            <span className="text-xs text-yellow-400 mt-2 font-semibold">Cofre de saldo</span>
          </Link>
        </div>
      </section>

      {/* Sobre o Autor */}
      <section id="recompensas" className="px-8 py-12 bg-gray-900/60 rounded-xl max-w-5xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Sobre o Autor</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Aluno do curso Blockchain com Ethereum (ETH-KIPU + UFPE)</li>
          <li>Site criado para compartilhar projetos, aprendizados e experiências</li>
          <li>Cada projeto terá uma tela dedicada com explicações e código</li>
          <li>Contato: <span className="text-blue-400">joubert2006@hotmail.com</span></li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-400">
        &copy; {new Date().getFullYear()} Portfólio Blockchain ETH-KIPU + UFPE. Todos os direitos reservados.
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradient-move 5s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px 4px #a78bfa44, 0 0 40px 8px #f472b644; }
          50% { box-shadow: 0 0 40px 8px #a78bfa99, 0 0 80px 16px #f472b699; }
        }
        .animate-glow {
          animation: glow 2.5s ease-in-out infinite alternate;
        }
        .btn-hero {
          position: relative;
          overflow: hidden;
        }
        .btn-hero:after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}


import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 gap-12">
        <div className="flex-1 space-y-8">
          <h1 className="text-5xl font-extrabold mb-4">
            Portfólio de Estudos: <span className="text-blue-400">Blockchain com Ethereum</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl">
            Este site foi criado para compartilhar meu aprendizado no curso de Blockchain com Ethereum, realizado pela ETH-KIPU em parceria com a UFPE.<br /><br />
            Aqui você encontrará uma tela para cada projeto desenvolvido em sala de aula, com explicações, código e demonstrações práticas.
          </p>
          <div className="flex gap-4">
            <Link to="/scene3d" className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl text-xl font-bold shadow-lg shadow-purple-500/25">Experimente 3D</Link>
            <a href="#projetos" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-xl font-bold shadow-lg shadow-blue-500/25">Ver Projetos</a>
          </div>
          <div className="flex gap-3 mt-6">
            <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">ETH-KIPU</span>
            <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-semibold">UFPE</span>
            <span className="bg-orange-500 px-3 py-1 rounded-full text-sm font-semibold">Ethereum</span>
            <span className="bg-yellow-500 px-3 py-1 rounded-full text-sm font-semibold">Blockchain</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img src="/src/assets/ethkipu-logo.svg" alt="Logo ETH-KIPU" className="w-72 h-72 animate-spin-slow" />
        </div>
      </section>

      {/* Sobre o Curso */}
      <section className="px-8 py-12 bg-gray-900/60 rounded-xl max-w-5xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Sobre o Curso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div className="bg-blue-900/60 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">ETH-KIPU + UFPE</h3>
            <p className="text-gray-300 text-sm">Curso prático e intensivo sobre Blockchain, com foco em desenvolvimento de projetos reais utilizando Ethereum, Solidity e ferramentas Web3.</p>
          </div>
          <div className="bg-green-900/60 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Projetos em Sala</h3>
            <p className="text-gray-300 text-sm">Cada projeto realizado durante o curso terá uma tela dedicada aqui, com explicações, código e demonstrações.</p>
          </div>
        </div>
      </section>

      {/* Projetos do Curso */}
      <section id="projetos" className="px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Projetos do Curso</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Card SeedGuard */}
          <Link to="/seedguard" className="rounded-2xl border-4 border-green-500 bg-gradient-to-br from-gray-900 via-green-900 to-cyan-900 p-7 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🛡️</span>
            <span className="text-green-300 font-extrabold text-xl mb-2 drop-shadow">SeedGuard</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">Guarde mensagens de forma segura na blockchain Ethereum.<br />Salve e recupere textos protegidos por sua carteira.</span>
            <span className="text-xs text-green-400 mt-2 font-semibold">Guardião de mensagens</span>
          </Link>
          {/* Card KipuBank */}
          <Link to="/kipubank" className="rounded-2xl border-4 border-blue-500 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-7 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🏦</span>
            <span className="text-blue-300 font-extrabold text-xl mb-2 drop-shadow">KipuBank</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">Banco digital descentralizado.<br />Deposite, saque e consulte seu saldo em ETH com limite e controle via smart contract.</span>
            <span className="text-xs text-blue-400 mt-2 font-semibold">Banco descentralizado</span>
          </Link>
          {/* Card Cofre */}
          <Link to="/cofre" className="rounded-2xl border-4 border-yellow-500 bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900 p-7 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
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
          <li>Contato: <span className="text-blue-400">seuemail@exemplo.com</span></li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-400">
        &copy; {new Date().getFullYear()} Portfólio Blockchain ETH-KIPU + UFPE. Todos os direitos reservados.
      </footer>

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
}


import { images } from '../assets/images';
import perfil from '../assets/me.jpeg';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useTranslation } from 'react-i18next';
// import Blockchain3DDecoration from "../components/Blockchain3DDecoration";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col relative overflow-hidden">
      {/* Decoração 3D blockchain - esquerda 
      <Blockchain3DDecoration side="left" />
      */}
      {/* Decoração 3D blockchain - direita
      <Blockchain3DDecoration side="right" />
       */}
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 gap-12">
        <div className="space-y-10 w-full max-w-3xl text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-move drop-shadow-lg">
            {t('home.title')}
          </h1>
          <div className="flex justify-center mb-4">
            <img
              src={perfil}
              alt={t('home.authorPhoto')}
              className="w-86 h-86 rounded-full border-4 border-pink-400 shadow-lg object-cover"
              style={{ marginTop: '-12px' }}
            />
          </div>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-medium drop-shadow">
            {t('home.welcome')}<br />
            {t('home.developer_intro')} <span className="font-bold text-blue-300">{t('home.ethereum_web3')}</span>, {t('home.passionate_about')}<br /><br />
            {t('home.find_here')} <span className="font-bold text-yellow-300">{t('home.solidity')}</span>, {t('home.integrations_with')} <span className="font-bold text-cyan-300">{t('home.ethers_js')}</span>, {t('home.security_tips')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
            <Link to="/blockchain3d" className="btn-hero bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400/50 animate-glow">{t('home.blockchain3d')}</Link>
          </div>
          <div className="flex flex-wrap gap-3 mt-8 justify-center">
            <span className="bg-green-600 px-4 py-1 rounded-full text-base font-semibold shadow">{t('tags.eth_kipu')}</span>
            <span className="bg-blue-500 px-4 py-1 rounded-full text-base font-semibold shadow">{t('tags.ufpe')}</span>
            <span className="bg-orange-500 px-4 py-1 rounded-full text-base font-semibold shadow">{t('tags.ethereum')}</span>
            <span className="bg-yellow-500 px-4 py-1 rounded-full text-base font-semibold shadow">{t('tags.solidity')}</span>
            <span className="bg-cyan-500 px-4 py-1 rounded-full text-base font-semibold shadow">{t('tags.ethers')}</span>
            <span className="bg-pink-500 px-4 py-1 rounded-full text-base font-semibold shadow">{t('tags.web3')}</span>
            <span className="bg-gray-700 px-4 py-1 rounded-full text-base font-semibold shadow">{t('tags.security')}</span>
          </div>
        </div>
      </section>
      {/* Stack Ethereum */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow">{t('projects.stack_title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.ethereum} alt="Ethereum" className="w-12 h-12 mb-2" />
            <span className="font-bold text-blue-300">{t('projects.ethereum')}</span>
            <span className="text-xs text-gray-300 mt-1">{t('projects.ethereum_desc')}</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-yellow-900 to-yellow-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.solidity} alt="Solidity" className="w-12 h-12 mb-2" />
            <span className="font-bold text-yellow-300">{t('projects.solidity')}</span>
            <span className="text-xs text-gray-300 mt-1">{t('projects.solidity_desc')}</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-cyan-900 to-cyan-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.reactLogo} alt="React - Ethers.js" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-cyan-300">{t('projects.react_ethers')}</span>
            <span className="text-xs text-gray-300 mt-1">{t('projects.react_ethers_desc')}</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-pink-900 to-pink-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.metamask} alt="Metamask" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-pink-300">{t('projects.metamask')}</span>
            <span className="text-xs text-gray-300 mt-1">{t('projects.metamask_desc')}</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.remix} alt="Remix" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-indigo-300">{t('projects.remix')}</span>
            <span className="text-xs text-gray-300 mt-1">{t('projects.remix_desc')}</span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
            <img src={images.security} alt="Security" className="w-12 h-12 mb-2 rounded" />
            <span className="font-bold text-gray-200">{t('projects.security')}</span>
            <span className="text-xs text-gray-300 mt-1">{t('projects.security_desc')}</span>
          </div>
        </div>
      </section>

      {/* Projetos */}
      <section id="projetos" className="px-8 py-12 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">{t('projects.title')}</h2>
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8 justify-center">

          {/* Card SeedGuard */}
          <Link to="/seedguard" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-green-500 bg-gradient-to-br from-gray-900 via-green-900 to-cyan-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🛡️</span>
            <span className="text-green-300 font-extrabold text-xl mb-2 drop-shadow">{t('projects.seedGuard')}</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">{t('projects.seedguard_desc')}</span>
            <span className="text-xs text-green-400 mt-2 font-semibold">{t('projects.seedguard_tag')}</span>
          </Link>

          {/* Card KipuBank */}
          <Link to="/kipubank" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-blue-500 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🏦</span>
            <span className="text-blue-300 font-extrabold text-xl mb-2 drop-shadow">{t('projects.kipuBank')}</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">{t('projects.kipubank_desc')}</span>
            <span className="text-xs text-blue-400 mt-2 font-semibold">{t('projects.kipubank_tag')}</span>
          </Link>

          {/* Card Cofre */}
          <Link to="/cofre" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-yellow-500 bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🔐</span>
            <span className="text-yellow-300 font-extrabold text-xl mb-2 drop-shadow">{t('projects.cofre')}</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">{t('projects.cofre_desc')}</span>
            <span className="text-xs text-yellow-400 mt-2 font-semibold">{t('projects.cofre_tag')}</span>
          </Link>

          {/* Card SimpleDex */}
          <Link to="/simpledex" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-purple-500 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🔄</span>
            <span className="text-purple-300 font-extrabold text-xl mb-2 drop-shadow">{t('projects.simpleDex')}</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">{t('projects.simpledex_desc')}</span>
            <span className="text-xs text-purple-400 mt-2 font-semibold">{t('projects.simpledex_tag')}</span>
          </Link>

          {/* Card BlockChain3D */}
          <Link to="/blockchain3d" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border-4 border-pink-500 bg-gradient-to-br from-gray-900 via-pink-900 to-blue-900 p-8 flex flex-col items-center shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🌐</span>
            <span className="text-pink-300 font-extrabold text-xl mb-2 drop-shadow">{t('home.blockchain3d')}</span>
            <span className="text-gray-100 text-base text-center mb-2 leading-relaxed">{t('projects.blockchain3d_desc')}</span>
            <span className="text-xs text-pink-400 mt-2 font-semibold">{t('projects.blockchain3d_tag')}</span>
          </Link>
        </div>
      </section>

      {/* Sobre o Autor */}
      <section id="recompensas" className="px-8 py-12 bg-gray-900/60 rounded-xl max-w-5xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('about.title')}</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>{t('about.student')}</li>
          <li>{t('about.purpose')}</li>
          <li>{t('about.project_pages')}</li>
          <li>{t('about.contact')}: <span className="text-blue-400">{t('about.email')}</span></li>
        </ul>
      </section>

      {/* Footer */}
      <Footer />

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


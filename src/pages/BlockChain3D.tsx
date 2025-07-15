import Footer from "../components/Footer";
import Scene3D from "../components/Scene3D";

export default function BlockChain3D() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex flex-col items-center justify-center px-4 py-20">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-move drop-shadow-lg text-center">
        BlockChain3D
      </h1>
      <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-medium drop-shadow text-center mb-8">
        Explore visualmente os conceitos de blockchain, blocos, transações e contratos inteligentes em 3D.<br />
        Interaja com elementos da rede Ethereum de forma imersiva e didática.
      </p>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl h-[52rem] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-pink-500 animate-pulse-slow p-6 sm:p-10">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full max-w-full max-h-full">
              <Scene3D />
            </div>
          </div>
        </div>
        <span className="mt-6 text-pink-300 font-bold text-lg">Experiência 3D interativa</span>
      </div>
      <Footer />
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
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 40px 8px #f472b644, 0 0 80px 16px #a78bfa44; }
          50% { box-shadow: 0 0 80px 16px #f472b699, 0 0 160px 32px #a78bfa99; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}

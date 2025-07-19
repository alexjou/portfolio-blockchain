import { Link } from 'react-router-dom';

interface ProjectCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

const ProjectCard = ({ title, description, icon, to }: ProjectCardProps) => {
  return (
    <div className="max-w-xs w-full bg-[#23243a] rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/10 hover:border-yellow-400 transition-all duration-200 mx-auto">
      <Link to={to} className="flex flex-col items-center w-full h-full">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="text-lg font-bold text-white mb-1 text-center">{title}</h3>
        <p className="text-white/80 text-center text-sm mb-4">{description}</p>
        <span className="mt-auto inline-block bg-gradient-to-r from-yellow-400 to-purple-700 text-white font-bold py-1.5 px-5 rounded-full shadow text-sm hover:from-yellow-500 hover:to-purple-800 transition-colors">
          Explorar &rarr;
        </span>
      </Link>
    </div>
  );
};

export default ProjectCard;

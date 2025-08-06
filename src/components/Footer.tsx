
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="mt-auto py-6 text-center text-gray-400">
      &copy; {new Date().getFullYear()} Álex Joubert. {t('footer.rights')}
    </footer>
  );
}

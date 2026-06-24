import { useLocation } from 'react-router';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isConfigurator = location.pathname === '/configure';

  return (
    <div className="min-h-screen bg-pool-bg font-satoshi">
      <Navigation />
      <main>{children}</main>
      {!isConfigurator && <Footer />}
    </div>
  );
}

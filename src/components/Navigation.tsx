import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Configurator', path: '/configure' },
  { label: 'Gallery', path: '/gallery' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300 ${
          scrolled
            ? 'bg-pool-bg/90 backdrop-blur-xl shadow-[0_1px_0_#F0EDE8]'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link to="/" className="text-pool-teal font-semibold text-xl tracking-tight">
            PoolKimi
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium tracking-wide transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-pool-teal'
                    : 'text-pool-text-secondary hover:text-pool-teal'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pool-teal" />
                )}
              </Link>
            ))}
          </div>

          <Link
            to="/configure"
            className="hidden md:inline-flex items-center px-6 py-2.5 bg-pool-teal text-white text-sm font-medium rounded-full hover:bg-pool-teal-hover transition-all duration-300 hover:scale-[1.03]"
          >
            Start Building
          </Link>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-pool-text"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-pool-text/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-pool-surface shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-pool-border-warm">
              <span className="text-pool-teal font-semibold text-xl">PoolKimi</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-pool-text">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 flex flex-col p-6 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-medium py-3 px-2 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'text-pool-teal bg-pool-teal-light'
                      : 'text-pool-text hover:text-pool-teal'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="p-6">
              <Link
                to="/configure"
                className="block w-full text-center py-3 bg-pool-teal text-white font-medium rounded-full hover:bg-pool-teal-hover transition-colors"
              >
                Start Building
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

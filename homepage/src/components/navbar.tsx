import { Sun, Moon } from 'lucide-react';
import { Link, usePath } from '../router';
import { BrandIcon } from './brand-icon';

const NAV_ITEMS: { label: string; to: string }[] = [
  { label: 'Home', to: '/' },
  { label: 'Demo', to: '/demo' },
  { label: 'Docs', to: '/docs' },
];

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const currentPath = usePath();

  return (
    <nav className="sticky top-0 z-50 bg-bg-app/80 backdrop-blur-md border-b border-border-primary px-6 flex items-center justify-between h-14 transition-colors duration-200 select-none">
      <Link to="/" className="flex items-center gap-2 group">
        <img src="/logo.png" alt="react-zeugma logo" className="w-6 h-6 object-contain" />
        <span className="font-extrabold text-lg tracking-tight text-text-primary">
          react-zeugma
        </span>
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors hover:text-text-primary ${
                  isActive ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-md hover:bg-bg-sidebar border border-transparent hover:border-border-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Social Links */}
          <a
            href="https://www.npmjs.com/package/react-zeugma"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 bg-[#cb3837]/10 hover:bg-[#cb3837]/20 text-[#cb3837] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
          >
            <BrandIcon name="npm" size={22} title="NPM" />
            NPM
          </a>
          <a
            href="https://github.com/yusufarsln98/react-zeugma"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 bg-text-primary hover:bg-text-primary/90 text-bg-app px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
          >
            <BrandIcon name="github" size={22} title="GitHub" />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

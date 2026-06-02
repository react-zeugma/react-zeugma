import { HelpCircle, FileText, Heart } from 'lucide-react';
import { BrandIcon } from './brand-icon';

const BASE_PATH = import.meta.env.BASE_URL;
const LOGO_URL = `${BASE_PATH}logo.png`;

export function Footer() {
  return (
    <footer className="bg-bg-sidebar border-t border-border-primary py-12 px-6 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-2 flex items-start gap-5">
          <img
            src={LOGO_URL}
            alt="react-zeugma logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain shrink-0"
          />
          <div className="space-y-2">
            <span className="font-bold text-lg tracking-tight text-text-primary block">
              react-zeugma
            </span>
            <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
              A flexible, headless, and completely unopinionated workspace layout engine for React.
              Split, drag, and resize panes without constraints.
            </p>
          </div>
        </div>

        {/* References Links */}
        <div>
          <h4 className="text-text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            References
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group"
              >
                <BrandIcon
                  name="github"
                  size={16}
                  className="text-text-secondary group-hover:text-text-primary transition-colors"
                />{' '}
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/react-zeugma"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group"
              >
                <BrandIcon
                  name="npm"
                  size={16}
                  className="text-text-secondary group-hover:text-text-primary transition-colors"
                />{' '}
                NPM Package
              </a>
            </li>
          </ul>
        </div>

        {/* Contribution & License */}
        <div>
          <h4 className="text-text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Community
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/blob/master/CONTRIBUTING.md"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-500/80" /> Contributing Guide
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/issues"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" /> Issues & Feedback
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/blob/master/LICENSE"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> MIT License
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-border-primary mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
        <div>&copy; {new Date().getFullYear()} react-zeugma. All rights reserved.</div>
        <div className="flex items-center gap-1.5">
          <span>Named after the ancient city of Zeugma in</span>
          <a
            href="https://en.wikipedia.org/wiki/Zeugma_(Commagene)"
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary hover:text-text-primary underline underline-offset-2"
          >
            Gaziantep, Turkey
          </a>
        </div>
      </div>
    </footer>
  );
}

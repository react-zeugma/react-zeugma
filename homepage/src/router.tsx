import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  Children,
  type ReactElement,
  type ReactNode,
} from 'react';

export type RoutePath = '/' | '/demo' | '/docs';

export type RouteValue = RoutePath | (string & {});

interface RouterContextValue {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() => getCurrentPath());

  useEffect(() => {
    const onPop = () => setPath(getCurrentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;
    if (to === getCurrentPath()) return;
    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo<RouterContextValue>(() => ({ path, navigate }), [path, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a <Router>');
  }
  return ctx;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function usePath() {
  return useRouter().path;
}

interface LinkProps {
  to: string;
  replace?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | true | 'false';
}

export function Link({ to, replace, className, children, onClick, ariaCurrent }: LinkProps) {
  const { path, navigate } = useRouter();
  const isActive = path === to;

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    event.preventDefault();
    onClick?.();
    navigate(to, { replace });
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      aria-current={ariaCurrent ?? (isActive ? 'page' : undefined)}
      data-active={isActive || undefined}
    >
      {children}
    </a>
  );
}

export function Route({ path: _path, element }: { path: string; element: ReactNode }) {
  return <>{element}</>;
}

export function Routes({ children }: { children: ReactNode }) {
  const { path: current } = useRouter();
  const childrenArray = Children.toArray(children) as ReactElement<{ path: string }>[];

  let match: ReactElement<{ path: string }> | null = null;
  let fallback: ReactElement<{ path: string }> | null = null;

  for (const child of childrenArray) {
    if (child.props.path === current) {
      match = child;
      break;
    }
    if (child.props.path === '*') {
      fallback = child;
    }
  }

  return match || fallback || null;
}

export function matchPath(current: string, target: string): boolean {
  if (target === '*' || target === current) return true;
  if (target === '/' && current !== '/') return false;
  return current === target;
}

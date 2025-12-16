import { Logo } from '../logo';

export const Header = () => {
  return (
    <header
      className="fixed top-0 z-50 w-full bg-background-primary/95 backdrop-blur
      supports-backdrop-filter:bg-background-primary/60"
    >
      <Logo />
    </header>
  );
};

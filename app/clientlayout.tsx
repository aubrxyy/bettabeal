'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './_components/Header';
import { Footer } from './_components/Footer';

const noHeaderFooterPaths = ['/login', '/register', '/dashboard'];
const noFooterPaths = ['/user', '/cart/checkout'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const noHeaderFooter = noHeaderFooterPaths.some(noPath => url.startsWith(noPath));
      setShowHeader(!noHeaderFooter);

      const noFooter = noFooterPaths.some(noPath => url.startsWith(noPath));
      setShowFooter(!noHeaderFooter && !noFooter);
    };

    // Initial check
    handleRouteChange(pathname);
  }, [pathname]);

  return (
    <div>
      {showHeader && <Header />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
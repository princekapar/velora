'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.themeColors) {
      document.documentElement.style.setProperty('--color-primary', user.themeColors.primary);
      document.documentElement.style.setProperty('--color-secondary', user.themeColors.secondary);
      document.documentElement.style.setProperty('--color-tertiary', user.themeColors.tertiary);
    }
  }, [user]);

  return <>{children}</>;
}


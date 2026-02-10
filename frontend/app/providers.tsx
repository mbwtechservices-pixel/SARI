'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/context/AuthContext';
import { SocketProvider } from '@/lib/context/SocketContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </SocketProvider>
    </AuthProvider>
  );
}


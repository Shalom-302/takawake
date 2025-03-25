import React, { ReactNode } from 'react';
import { AppHeader } from './header';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne pas afficher le contenu
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader user={user} onLogout={handleLogout} />
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
}

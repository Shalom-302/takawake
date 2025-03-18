"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Accès non autorisé</CardTitle>
          <CardDescription>
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Veuillez contacter l&apos;administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="default" onClick={() => router.push('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

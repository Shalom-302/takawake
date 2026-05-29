"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { MatomoDashboard } from "@/components/analytics/matomo-dashboard";
import { useMatomoConfig } from "@/lib/hooks/use-matomo-config";

export default function MatomoAdminPage() {
    const { config, error, updateConfig } = useMatomoConfig();
    const [formData, setFormData] = useState({
        matomo_url: "",
        site_id: 1,
        enabled: false,
        track_admin_users: false,
        heartbeat_timer: 15,
    });
    const [saving, setSaving] = useState(false);

    // Update form data when config is loaded
    React.useEffect(() => {
        if (config) {
            setFormData({
                matomo_url: config.matomo_url || "",
                site_id: config.site_id || 1,
                enabled: config.enabled || false,
                track_admin_users: config.track_admin_users || false,
                heartbeat_timer: config.heartbeat_timer || 15,
            });
        }
    }, [config]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const success = await updateConfig(formData);
            if (success) {
                toast.success("La configuration Matomo a été mise à jour avec succès.");
            } else {
                toast.error("Impossible de sauvegarder la configuration.");
            }
        } catch (err) {
            console.error("Error saving config:", err);
            toast.error("Une erreur est survenue lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Administration Matomo</h1>

            <Tabs defaultValue="dashboard">
                <TabsList className="mb-8">
                    <TabsTrigger value="dashboard">Tableaux de bord</TabsTrigger>
                    <TabsTrigger value="configuration">Configuration</TabsTrigger>
                    <TabsTrigger value="tracking">Suivi utilisateurs</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <div className="grid gap-6">
                        <MatomoDashboard
                            title="Vue d'ensemble"
                            description="Statistiques globales de l'application"
                            defaultDashboardType="overview"
                            height={600}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MatomoDashboard
                                title="Visiteurs"
                                description="Informations sur les visiteurs"
                                defaultDashboardType="visitors"
                                height={400}
                            />
                            <MatomoDashboard
                                title="Comportement"
                                description="Analyse du comportement utilisateur"
                                defaultDashboardType="behavior"
                                height={400}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="configuration">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration de Matomo</CardTitle>
                            <CardDescription>
                                Configurez les paramètres de connexion à votre instance Matomo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Erreur</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    handleSave();
                                }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="matomo_url">URL de Matomo</Label>
                                        <Input
                                            id="matomo_url"
                                            placeholder="https://matomo.example.com"
                                            value={formData.matomo_url}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    matomo_url: e.target.value,
                                                })
                                            }
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            URL complète de votre instance Matomo, sans slash final
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="site_id">ID du site</Label>
                                        <Input
                                            id="site_id"
                                            type="number"
                                            value={formData.site_id}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    site_id: parseInt(e.target.value) || 1,
                                                })
                                            }
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            ID de votre site dans Matomo (généralement 1 pour le
                                            premier site)
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="heartbeat_timer">
                                            Intervalle de battement de cœur (secondes)
                                        </Label>
                                        <Input
                                            id="heartbeat_timer"
                                            type="number"
                                            value={formData.heartbeat_timer}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    heartbeat_timer: parseInt(e.target.value) || 15,
                                                })
                                            }
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Fréquence d&apos;envoi des pings pour le suivi du temps passé
                                            (0 pour désactiver)
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="enabled"
                                            checked={formData.enabled}
                                            onCheckedChange={checked =>
                                                setFormData({ ...formData, enabled: checked })
                                            }
                                        />
                                        <Label htmlFor="enabled">Activer le suivi Matomo</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="track_admin_users"
                                            checked={formData.track_admin_users}
                                            onCheckedChange={checked =>
                                                setFormData({
                                                    ...formData,
                                                    track_admin_users: checked,
                                                })
                                            }
                                        />
                                        <Label htmlFor="track_admin_users">
                                            Suivre les administrateurs
                                        </Label>
                                    </div>
                                </div>

                                <Button type="submit" disabled={saving}>
                                    {saving ? "Enregistrement..." : "Enregistrer la configuration"}
                                    <Save className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tracking">
                    <Card>
                        <CardHeader>
                            <CardTitle>Suivi des utilisateurs</CardTitle>
                            <CardDescription>
                                Configurez comment les utilisateurs sont suivis dans Matomo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium">Code de suivi Matomo</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Ce code est automatiquement injecté dans votre application
                                        via le composant MatomoTracker.
                                    </p>
                                    <pre className="p-4 bg-muted rounded-md text-xs overflow-auto">
                                        {`<!-- Matomo -->
<script>
  var _paq = window._paq = window._paq || [];
  _paq.push(['disableCookies']);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  ${formData.heartbeat_timer > 0 ? `_paq.push(["enableHeartBeatTimer", ${formData.heartbeat_timer}]);` : ""}
  (function() {
    var u="${formData.matomo_url}/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', "${formData.site_id}"]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Matomo Code -->`}
                                    </pre>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium">
                                        Fonctions de suivi disponibles
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Utilisez ces fonctions pour suivre des événements
                                        personnalisés dans votre application.
                                    </p>
                                    <pre className="p-4 bg-muted rounded-md text-xs overflow-auto">
                                        {`// Suivre un événement
window.trackEvent('category', 'action', 'name', value);

// Suivre une recherche
window.trackSearch('keyword', 'category', resultsCount);`}
                                    </pre>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

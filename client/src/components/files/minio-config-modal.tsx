"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Database } from "lucide-react";
import { StorageProvider } from "@/lib/services/file-storage-service";

interface MinioConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfigureMinio: (config: {
        name: string;
        endpoint_url: string;
        access_key: string;
        secret_key: string;
        bucket_name: string;
        region?: string;
        secure?: boolean;
        is_default?: boolean;
    }) => Promise<void>;
    existingProviders: StorageProvider[];
}

const MinioConfigModal: React.FC<MinioConfigModalProps> = ({
    isOpen,
    onClose,
    onConfigureMinio,
    existingProviders,
}) => {
    const [name, setName] = useState("MinIO Storage");
    const [endpointUrl, setEndpointUrl] = useState("");
    const [accessKey, setAccessKey] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [bucketName, setBucketName] = useState("");
    const [region, setRegion] = useState("");
    const [secure, setSecure] = useState(true);
    const [isDefault, setIsDefault] = useState(existingProviders.length === 0);
    const [isConfiguring, setIsConfiguring] = useState(false);

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsConfiguring(true);
            await onConfigureMinio({
                name,
                endpoint_url: endpointUrl,
                access_key: accessKey,
                secret_key: secretKey,
                bucket_name: bucketName,
                region: region || undefined,
                secure,
                is_default: isDefault,
            });
            resetForm();
        } catch (error) {
            console.error("Error configuring MinIO:", error);
        } finally {
            setIsConfiguring(false);
        }
    };

    const validateForm = (): boolean => {
        // Basic validation
        return !!(
            name.trim() &&
            endpointUrl.trim() &&
            accessKey.trim() &&
            secretKey.trim() &&
            bucketName.trim()
        );
    };

    const resetForm = () => {
        setName("MinIO Storage");
        setEndpointUrl("");
        setAccessKey("");
        setSecretKey("");
        setBucketName("");
        setRegion("");
        setSecure(true);
        setIsDefault(existingProviders.length === 0);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) {
                    resetForm();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Configure MinIO Storage</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* MinIO icon */}
                    <div className="flex justify-center py-2">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Database className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>

                    {/* Provider name */}
                    <div className="space-y-2">
                        <Label htmlFor="provider-name">
                            Provider Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="provider-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="MinIO Storage"
                        />
                    </div>

                    {/* Endpoint URL */}
                    <div className="space-y-2">
                        <Label htmlFor="endpoint-url">
                            Endpoint URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="endpoint-url"
                            value={endpointUrl}
                            onChange={e => setEndpointUrl(e.target.value)}
                            placeholder="play.min.io:9000"
                        />
                        <p className="text-xs text-gray-500">
                            Format: hostname:port (no http/https prefix)
                        </p>
                    </div>

                    {/* Access Key and Secret Key */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="access-key">
                                Access Key <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="access-key"
                                value={accessKey}
                                onChange={e => setAccessKey(e.target.value)}
                                placeholder="minioadmin"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secret-key">
                                Secret Key <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="secret-key"
                                type="password"
                                value={secretKey}
                                onChange={e => setSecretKey(e.target.value)}
                                placeholder="minioadmin"
                            />
                        </div>
                    </div>

                    {/* Bucket Name and Region */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="bucket-name">
                                Bucket Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="bucket-name"
                                value={bucketName}
                                onChange={e => setBucketName(e.target.value)}
                                placeholder="mybucket"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="region">Region (optional)</Label>
                            <Input
                                id="region"
                                value={region}
                                onChange={e => setRegion(e.target.value)}
                                placeholder="us-east-1"
                            />
                        </div>
                    </div>

                    {/* Secure connection switch */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="secure-connection">Secure Connection (HTTPS)</Label>
                            <p className="text-xs text-gray-500">Use HTTPS instead of HTTP</p>
                        </div>
                        <Switch
                            id="secure-connection"
                            checked={secure}
                            onCheckedChange={setSecure}
                        />
                    </div>

                    {/* Set as default provider */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="default-provider">Set as Default Provider</Label>
                            <p className="text-xs text-gray-500">
                                Use this provider for all file storage operations
                            </p>
                        </div>
                        <Switch
                            id="default-provider"
                            checked={isDefault}
                            onCheckedChange={setIsDefault}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isConfiguring}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!validateForm() || isConfiguring}
                        className="gap-2"
                    >
                        {isConfiguring ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Configuring...
                            </>
                        ) : (
                            <>
                                <Database className="h-4 w-4" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MinioConfigModal;

"use client";

import { useState, useEffect, useCallback } from "react";
import { Heading, HeadingDescription, HeadingTitle } from "@/components/heading";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/buttons/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Clock,
    Database,
    FileText,
    Filter,
    Search,
    Trash2,
    User,
    BarChart,
    PieChart,
    Activity,
} from "lucide-react";

import auditService, { AuditLog, AuditMetrics } from "@/lib/services/audit-service";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [metrics, setMetrics] = useState<AuditMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("logs");

    // Filtres
    const [resourceFilter, setResourceFilter] = useState<string>("all");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Options des filtres
    const [resourceOptions, setResourceOptions] = useState<string[]>([]);
    const [actionOptions, setActionOptions] = useState<string[]>([]);

    // Function to filter logs based on current criteria
    const filterLogs = useCallback(() => {
        let filtered = [...logs];

        // Filter by resource
        if (resourceFilter && resourceFilter !== "all") {
            filtered = filtered.filter(log => log.resource === resourceFilter);
        }

        // Filter by action
        if (actionFilter && actionFilter !== "all") {
            filtered = filtered.filter(log => log.action === actionFilter);
        }

        // Filter by text search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                log =>
                    log.resource.toLowerCase().includes(query) ||
                    log.action.toLowerCase().includes(query) ||
                    (log.details && log.details.toLowerCase().includes(query))
            );
        }

        setFilteredLogs(filtered);
    }, [logs, resourceFilter, actionFilter, searchQuery]);

    const fetchAuditData = async () => {
        try {
            setIsLoading(true);

            // Recover audit logs
            const auditLogs = await auditService.getAuditLogs();
            setLogs(auditLogs);

            // Recover audit metrics
            const auditMetrics = await auditService.getAuditMetrics();
            setMetrics(auditMetrics);

            // Extract unique filter options
            const resources = [...new Set(auditLogs.map(log => log.resource))];
            const actions = [...new Set(auditLogs.map(log => log.action))];

            setResourceOptions(resources);
            setActionOptions(actions);

            setIsLoading(false);
        } catch (error) {
            console.error("Error loading audit data:", error);
            toast.error("Failed to load audit data");
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setResourceFilter("all");
        setActionFilter("all");
        setSearchQuery("");
    };

    const deleteLog = async (logId: number) => {
        try {
            await auditService.deleteAuditLog(logId);
            await fetchAuditData();
            toast.success("Audit log deleted successfully");
        } catch (error) {
            console.error("Error deleting audit log:", error);
            toast.error("Failed to delete audit log");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    };

    const getActionBadgeColor = (action: string) => {
        const colors: { [key: string]: string } = {
            create: "bg-green-100 text-green-800",
            update: "bg-blue-100 text-blue-800",
            delete: "bg-red-100 text-red-800",
            read: "bg-gray-100 text-gray-800",
            login: "bg-purple-100 text-purple-800",
            logout: "bg-orange-100 text-orange-800",
        };

        return colors[action.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    useEffect(() => {
        // Apply filters when they change
        filterLogs();
    }, [logs, resourceFilter, actionFilter, searchQuery, filterLogs]);

    return (
        <div className="container mx-auto py-6">
            <Heading>
                <HeadingTitle>Audit</HeadingTitle>
                <HeadingDescription>
                    View and analyze all actions recorded in the system
                </HeadingDescription>
            </Heading>

            <Tabs value={activeTab} className="mt-6" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="logs">
                        <FileText className="mr-2 h-4 w-4" />
                        Audit logs
                    </TabsTrigger>
                    <TabsTrigger value="metrics">
                        <BarChart className="mr-2 h-4 w-4" />
                        Metrics
                    </TabsTrigger>
                    <TabsTrigger value="dashboard">
                        <Activity className="mr-2 h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                </TabsList>

                {/* Audit logs tab */}
                <TabsContent value="logs">
                    <Card className="p-6">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher dans les logs..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-8 flex-1"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        disabled={!resourceFilter && !actionFilter && !searchQuery}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <div className="flex items-center">
                                            <Database className="mr-2 h-4 w-4" />
                                            <span>{resourceFilter || "Ressource"}</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All resources</SelectItem>
                                        {resourceOptions.map(resource => (
                                            <SelectItem key={resource} value={resource}>
                                                {resource}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={actionFilter} onValueChange={setActionFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <div className="flex items-center">
                                            <Filter className="mr-2 h-4 w-4" />
                                            <span>{actionFilter || "Action"}</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All actions</SelectItem>
                                        {actionOptions.map(action => (
                                            <SelectItem key={action} value={action}>
                                                {action}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Audit logs table */}
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">ID</TableHead>
                                            <TableHead>Resource</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Details
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                User
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    Date
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center py-10 text-gray-500"
                                                >
                                                    No audit logs found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredLogs.map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">
                                                        {log.id}
                                                    </TableCell>
                                                    <TableCell>{log.resource}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={getActionBadgeColor(
                                                                log.action
                                                            )}
                                                        >
                                                            {log.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                                                        {log.details || "—"}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {log.user_id ? (
                                                            <div className="flex items-center">
                                                                <User className="mr-2 h-4 w-4" />
                                                                ID : {log.user_id}
                                                            </div>
                                                        ) : (
                                                            "Système"
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(log.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteLog(log.id)}
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Metrics tab */}
                <TabsContent value="metrics">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Global statistics */}
                            <Card className="p-4">
                                <h3 className="text-lg font-medium mb-2">Global statistics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Total logs</p>
                                        <p className="text-2xl font-bold">
                                            {metrics?.total_events || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last event</p>
                                        <p className="text-base">
                                            {metrics?.last_event_timestamp
                                                ? formatDate(
                                                      new Date(
                                                          metrics.last_event_timestamp * 1000
                                                      ).toISOString()
                                                  )
                                                : "No event"}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Events by resource */}
                            <Card className="p-4">
                                <h3 className="text-lg font-medium mb-2">Events by resource</h3>
                                {metrics && Object.keys(metrics.events_by_resource).length > 0 ? (
                                    <div className="space-y-2">
                                        {Object.entries(metrics.events_by_resource)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([resource, count]) => (
                                                <div
                                                    key={resource}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span className="text-sm">{resource}</span>
                                                    <Badge variant="secondary">{count}</Badge>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No data available</p>
                                )}
                            </Card>

                            {/* Events by action */}
                            <Card className="p-4">
                                <h3 className="text-lg font-medium mb-2">Events by action</h3>
                                {metrics && Object.keys(metrics.events_by_action).length > 0 ? (
                                    <div className="space-y-2">
                                        {Object.entries(metrics.events_by_action)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([action, count]) => (
                                                <div
                                                    key={action}
                                                    className="flex justify-between items-center"
                                                >
                                                    <Badge className={getActionBadgeColor(action)}>
                                                        {action}
                                                    </Badge>
                                                    <span className="font-medium">{count}</span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No data available</p>
                                )}
                            </Card>
                        </div>
                    </Card>
                </TabsContent>

                {/* Onglet dashboard */}
                <TabsContent value="dashboard">
                    <Card className="p-6">
                        <div className="text-center py-10">
                            <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Interactive dashboard</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                View trends and audit activity over time. This feature will be
                                available soon.
                            </p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

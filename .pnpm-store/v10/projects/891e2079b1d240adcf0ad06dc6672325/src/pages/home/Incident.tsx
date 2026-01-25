import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  History,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  incidentsApi,
  type Incident,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentHistoryEntry,
  type IncidentActivityEntry,
} from "@/lib/incidents-api";
const ITEMS_PER_PAGE = 10;

const SEVERITY_OPTIONS: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH"];
const STATUS_OPTIONS: IncidentStatus[] = ["OPEN", "INVESTIGATING", "RESOLVED"];

const IncidentPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<IncidentHistoryEntry[]>([]);
  const [activityHistory, setActivityHistory] = useState<IncidentActivityEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [isUpdateSubmitting, setIsUpdateSubmitting] = useState(false);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "MEDIUM" as IncidentSeverity,
  });

  const fetchIncidents = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await incidentsApi.list({
        page,
        limit: ITEMS_PER_PAGE,
      });
      setIncidents(res.incidents);
      setPagination(res.pagination);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
        : "Failed to load incidents";
      toast.error(String(msg));
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents(currentPage);
  }, [currentPage, fetchIncidents]);

  const filteredIncidents = useMemo(() => {
    if (!search.trim()) return incidents;
    const q = search.toLowerCase();
    return incidents.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.severity.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q) ||
        i.User?.name?.toLowerCase().includes(q)
    );
  }, [search, incidents]);

  const totalPages = Math.max(1, pagination.totalPages);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (validCurrentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (validCurrentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    setIsCreateSubmitting(true);
    try {
      await incidentsApi.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
      });
      toast.success("Incident created.");
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", severity: "MEDIUM" });
      setCurrentPage(1);
      fetchIncidents(1);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
        : "Failed to create incident";
      toast.error(String(msg));
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedIncident || !formData.title.trim() || !formData.description.trim()) return;
    setIsUpdateSubmitting(true);
    try {
      await incidentsApi.update(selectedIncident.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
      });
      toast.success("Incident updated.");
      setIsUpdateOpen(false);
      setSelectedIncident(null);
      fetchIncidents(currentPage);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
        : "Failed to update incident";
      toast.error(String(msg));
    } finally {
      setIsUpdateSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    setIsStatusSubmitting(true);
    try {
      await incidentsApi.updateStatus(selectedIncident.id, { newStatus });
      toast.success("Status updated.");
      setIsStatusUpdateOpen(false);
      setSelectedIncident(null);
      fetchIncidents(currentPage);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
        : "Failed to update status";
      toast.error(String(msg));
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  const openUpdateDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
    });
    setIsUpdateOpen(true);
    incidentsApi
      .getById(incident.id)
      .then((fresh) => {
        setFormData({
          title: fresh.title,
          description: fresh.description,
          severity: fresh.severity,
        });
        setSelectedIncident(fresh);
      })
      .catch(() => { });
  };

  const openStatusUpdateDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsStatusUpdateOpen(true);
  };

  const openHistoryDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setHistory([]);
    setActivityHistory([]);
    setIsHistoryOpen(true);
    setIsHistoryLoading(true);
    // Load comprehensive activity history
    incidentsApi
      .getActivity(incident.id)
      .then(setActivityHistory)
      .catch(() => {
        // Fallback to status history if activity endpoint fails
        incidentsApi
          .getHistory(incident.id)
          .then(setHistory)
          .catch(() => toast.error("Failed to load history"));
      })
      .finally(() => setIsHistoryLoading(false));
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      case "INVESTIGATING":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      case "RESOLVED":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getSeverityStyles = (severity: IncidentSeverity) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      case "MEDIUM":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
      case "LOW":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-amber-900">
          Incidents
        </h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-sm w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search incidents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                setFormData({ title: "", description: "", severity: "MEDIUM" });
                setIsCreateOpen(true);
              }}
              className="bg-amber-700 hover:bg-amber-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Incident
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8 text-amber-700" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-30">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-30">Severity</TableHead>
                  <TableHead className="w-30">Status</TableHead>
                  <TableHead className="w-35">Reported</TableHead>
                  <TableHead className="w-28">Created By</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {search
                            ? "No incidents match your search on this page."
                            : "No incidents found."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {incident.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">{incident.title}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityStyles(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            incident.status
                          )}`}
                        >
                          {incident.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(incident.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {incident.User?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openHistoryDialog(incident)}
                            >
                              <History className="h-4 w-4 mr-2" />
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openUpdateDialog(incident)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openStatusUpdateDialog(incident)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {!isLoading && pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="mb-3 sm:mb-0">
                  <CardTitle className="text-base sm:text-lg">All Incidents</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {pagination.total} incident{pagination.total !== 1 ? "s" : ""} in total
                  </CardDescription>
                </div>
                <PaginationContent className="flex flex-wrap gap-2 justify-start sm:justify-end">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (validCurrentPage > 1) handlePageChange(validCurrentPage - 1);
                      }}
                      className={
                        validCurrentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {getPageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page as number);
                          }}
                          isActive={validCurrentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (validCurrentPage < totalPages)
                          handlePageChange(validCurrentPage + 1);
                      }}
                      className={
                        validCurrentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Incident Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Incident</DialogTitle>
            <DialogDescription>
              Fill in the details. Status will be set to OPEN automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the incident"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the incident"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(v) =>
                  setFormData({ ...formData, severity: v as IncidentSeverity })
                }
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.title.trim() || !formData.description.trim() || isCreateSubmitting}
              className="bg-amber-700 hover:bg-amber-800"
            >
              {isCreateSubmitting ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : null}
              Create Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Incident Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Incident</DialogTitle>
            <DialogDescription>Update the details of the incident.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="update-title">Title *</Label>
              <Input
                id="update-title"
                placeholder="Brief description of the incident"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="update-description">Description *</Label>
              <Textarea
                id="update-description"
                placeholder="Detailed description of the incident"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="update-severity">Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(v) =>
                  setFormData({ ...formData, severity: v as IncidentSeverity })
                }
              >
                <SelectTrigger id="update-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.title.trim() || !formData.description.trim() || isUpdateSubmitting}
              className="bg-amber-700 hover:bg-amber-800"
            >
              {isUpdateSubmitting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Update Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change the status of incident <span className="font-medium">{selectedIncident?.title ?? "—"}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>New Status *</Label>
              <Select
                value={selectedIncident?.status}
                onValueChange={(v) => handleStatusUpdate(v as IncidentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusUpdateOpen(false)}
            >
              Cancel
            </Button>
            {isStatusSubmitting && (
              <Spinner className="h-4 w-4" />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incident Activity History</DialogTitle>
            <DialogDescription>
              Complete activity timeline for incident <span className="font-medium">{selectedIncident?.title ?? "—"}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isHistoryLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : activityHistory.length === 0 && history.length === 0 && !selectedIncident ? (
              <p className="text-muted-foreground text-sm py-4">
                No activity history available.
              </p>
            ) : (
              <div className="border-l-2 border-muted pl-4 space-y-4">
                {/* Show activity history if available, otherwise fallback to status history */}
                {activityHistory.length > 0 ? (
                  [...activityHistory].reverse().map((activity) => {
                    const getActivityIcon = () => {
                      switch (activity.activity_type) {
                        case "CREATED":
                          return "🎯";
                        case "RESOLVED":
                          return "✅";
                        case "STATUS_CHANGED":
                          return "🔄";
                        case "UPDATED":
                          return "✏️";
                        default:
                          return "📝";
                      }
                    };

                    const getActivityColor = () => {
                      switch (activity.activity_type) {
                        case "CREATED":
                          return "bg-blue-500";
                        case "RESOLVED":
                          return "bg-green-500";
                        case "STATUS_CHANGED":
                          return "bg-amber-700";
                        case "UPDATED":
                          return "bg-purple-500";
                        default:
                          return "bg-gray-500";
                      }
                    };

                    const getActivityTitle = () => {
                      switch (activity.activity_type) {
                        case "CREATED":
                          return "Incident Created";
                        case "RESOLVED":
                          return "Incident Resolved";
                        case "STATUS_CHANGED":
                          return "Status Changed";
                        case "UPDATED":
                          return "Incident Updated";
                        default:
                          return "Activity";
                      }
                    };

                    return (
                      <div key={activity.id} className="relative">
                        <div className={`absolute -left-5.25 top-0 h-3 w-3 rounded-full border-2 border-background ${getActivityColor()}`} />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{getActivityIcon()}</span>
                              <p className="text-sm font-medium">
                                {getActivityTitle()}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            by <span className="font-medium">{activity.performedByName ?? "Unknown"}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Fallback to status history
                  <>
                    {[...history].reverse().map((h, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-5.25 top-0 h-3 w-3 rounded-full border-2 border-background bg-amber-700" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {h.oldStatus} → {h.newStatus}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(h.changedAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            by {h.changedByName ?? "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                    {selectedIncident && (
                      <div className="relative">
                        <div className="absolute -left-5.25 top-0 h-3 w-3 rounded-full border-2 border-background bg-blue-500" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              Opened by {selectedIncident.User?.name ?? "—"}
                            </p>
                            {selectedIncident.createdAt && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(selectedIncident.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHistoryOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentPage;

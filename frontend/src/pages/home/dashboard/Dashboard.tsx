import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { incidentsApi, type Incident } from "@/lib/incidents-api";

type StatsData = { active: number; total: number; resolved: number };

const statsConfig: {
  label: string;
  icon: React.ReactNode;
  color: string;
  getValue: (s: StatsData) => number;
}[] = [
    {
      label: "Active Incidents",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      color: " text-red-700 dark:bg-red-950 dark:text-red-400",
      getValue: (s) => s.active,
    },
    {
      label: "Total Incidents",
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      color: " text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      getValue: (s) => s.total,
    },
    {
      label: "Resolved Incidents",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      color: " text-green-700 dark:bg-green-950 dark:text-green-400",
      getValue: (s) => s.resolved,
    },
  ];

// utility to get badge variant for severity (API: LOW | MEDIUM | HIGH)
const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case "HIGH":
      return "destructive";
    case "LOW":
      return "secondary";
    case "MEDIUM":
      return "default";
    default:
      return "outline";
  }
};

// utility to get custom classnames for severity
const getSeverityClass = (severity: string) => {
  switch (severity) {
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
    case "MEDIUM":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
    case "LOW":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Dashboard = () => {
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [statsData, setStatsData] = useState<StatsData>({ active: 0, total: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      incidentsApi.list({ page: 1, limit: 10 }),
      incidentsApi.list({ status: "OPEN", limit: 1 }),
      incidentsApi.list({ status: "INVESTIGATING", limit: 1 }),
      incidentsApi.list({ status: "RESOLVED", limit: 1 }),
    ])
      .then(([listRes, openRes, invRes, resolvedRes]) => {
        setRecentIncidents(listRes.incidents);
        const open = openRes.pagination.total;
        const inv = invRes.pagination.total;
        const res = resolvedRes.pagination.total;
        setStatsData({
          active: open + inv,
          total: open + inv + res,
          resolved: res,
        });
      })
      .catch((err) => setError(err?.response?.data?.message ?? "Failed to load incidents"))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* About Incident Radar */}
      <div>
        <h2 className="text-3xl font-bold text-amber-900 tracking-tight mb-1">
          Dashboard
        </h2>

      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsConfig.map((stat) => (
          <Card key={stat.label} className={`${stat.color} border-0`}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-sm">
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {loading ? "—" : stat.getValue(statsData)}
                </div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Incidentss */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-amber-900">
              Recent Incidents
            </h3>
            <Button
              variant="link"
              asChild
              className="text-amber-700 p-0 h-auto text-sm font-medium hover:underline"
            >
              <Link to="/home/incidents">View all</Link>
            </Button>
          </div>
          <div className="overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading incidents…
              </div>
            ) : error ? (
              <div className="py-8 text-center text-destructive text-sm">{error}</div>
            ) : recentIncidents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No incidents yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="text-left">
                    <TableHead className="py-2 px-4">ID</TableHead>
                    <TableHead className="py-2 px-4">Summary</TableHead>
                    <TableHead className="py-2 px-4">Severity</TableHead>
                    <TableHead className="py-2 px-4">Status</TableHead>
                    <TableHead className="py-2 px-4">Reported</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIncidents.map((incident) => (
                    <TableRow key={incident.id} className="border-t last:border-b">
                      <TableCell className="py-2 px-4 font-mono text-xs">
                        {incident.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="py-2 px-4">{incident.title}</TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(
                            incident.severity
                          )}`}
                          variant={getSeverityVariant(incident.severity)}
                        >
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge variant="outline" className="text-xs font-normal">
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-muted-foreground">
                        {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

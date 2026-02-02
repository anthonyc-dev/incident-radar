import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  incidentsApi,
  type Incident,
  type IncidentStatus,
  type IncidentHistoryEntry,
} from "@/lib/incidents-api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

type ActivityType = "created" | "updated status on";

function getStatusConfig(status: IncidentStatus): {
  badge: { text: string; color: string };
  icon: React.ReactNode;
} {
  switch (status) {
    case "OPEN":
      return {
        badge: { text: "Open", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        icon: <ArrowRight size={16} className="text-green-600" />,
      };
    case "INVESTIGATING":
      return {
        badge: { text: "Investigating", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        icon: <ArrowRight size={16} className="text-blue-600" />,
      };
    case "RESOLVED":
      return {
        badge: { text: "Resolved", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
        icon: <ArrowLeft size={16} className="text-gray-500" />,
      };
    default:
      return {
        badge: { text: status, color: "bg-gray-100 text-gray-600" },
        icon: <ArrowRight size={16} className="text-gray-500" />,
      };
  }
}

function statusToLabel(s: IncidentStatus): string {
  switch (s) {
    case "OPEN": return "Open";
    case "INVESTIGATING": return "Investigating";
    case "RESOLVED": return "Resolved";
    default: return s;
  }
}

function getSeverityLabel(severity: string): string {
  const s = severity.toUpperCase();
  if (s === "HIGH") return "High severity";
  if (s === "MEDIUM") return "Medium severity";
  if (s === "LOW") return "Low severity";
  return `${severity} severity`;
}

export type ActivityItem = {
  id: string;
  userName: string;
  action: ActivityType;
  target: string;
  meta: string;
  severity: string;
  time: string;
  badge: { text: string; color: string };
  icon: React.ReactNode;
  sortAt: string;
};

function buildCreatedActivity(incident: Incident): ActivityItem {
  const { badge, icon } = getStatusConfig(incident.status);
  const userName = incident.User?.name ?? "Unknown";
  const shortId = `#${incident.id.slice(0, 8)}`;
  const meta = incident.status === "OPEN" ? "Open" : incident.status === "RESOLVED" ? "Resolved and closed" : "Now Investigating";
  return {
    id: incident.id,
    userName,
    action: "created",
    target: `Incident ${shortId}: ${incident.title}`,
    meta,
    severity: getSeverityLabel(incident.severity),
    time: formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true }),
    badge,
    icon,
    sortAt: incident.createdAt,
  };
}

function buildStatusChangeActivity(
  incident: Incident,
  entry: IncidentHistoryEntry
): ActivityItem {
  const { badge, icon } = getStatusConfig(entry.newStatus);
  const shortId = `#${incident.id.slice(0, 8)}`;
  return {
    id: `status-${incident.id}-${entry.changedAt}`,
    userName: entry.changedByName ?? "Unknown",
    action: "updated status on",
    target: `Incident ${shortId}: ${incident.title}`,
    meta: `From ${statusToLabel(entry.oldStatus)} to ${statusToLabel(entry.newStatus)}`,
    severity: getSeverityLabel(incident.severity),
    time: formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true }),
    badge,
    icon,
    sortAt: entry.changedAt,
  };
}

const Activity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await incidentsApi.list({ limit: 30 });
      const incidents = res.incidents;

      const historyResults = await Promise.allSettled(
        incidents.map((i) => incidentsApi.getHistory(i.id))
      );

      const created: ActivityItem[] = incidents.map(buildCreatedActivity);

      const statusChanges: ActivityItem[] = [];
      historyResults.forEach((result, idx) => {
        if (result.status !== "fulfilled") return;
        const incident = incidents[idx];
        const history = result.value;
        history.forEach((entry) => {
          statusChanges.push(buildStatusChangeActivity(incident, entry));
        });
      });

      const merged = [...created, ...statusChanges];
      merged.sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime());
      setActivities(merged);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Failed to load activity";
      toast.error(String(msg));
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100 tracking-tight mb-2">
          Activity
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-muted-foreground/10 px-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner className="h-8 w-8 text-amber-600" />
            </div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No recent activity
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`
                  flex items-center px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-4
                  hover:bg-muted/30 transition
                  flex-col sm:flex-row
                  sm:items-center
                  sm:gap-4
                `}
              >
                <div className="flex-1 min-w-0 w-full">
                  <div
                    className={`
                      flex flex-col sm:flex-row
                      sm:items-center gap-1 sm:gap-2
                    `}
                  >
                    <span className="font-semibold">{activity.userName}</span>
                    <span className="text-muted-foreground text-sm">
                      {activity.action}
                    </span>
                    <span className="font-mono text-xs bg-amber-50 dark:bg-amber-900/20 rounded px-1.5 mt-1 sm:mt-0">
                      {activity.target}
                    </span>
                  </div>
                  <div
                    className={`
                      flex flex-col sm:flex-row gap-1 sm:gap-2 mt-1 text-sm items-start sm:items-center
                    `}
                  >
                    <span className="text-muted-foreground">{activity.meta}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{activity.severity}</span>
                    <Badge
                      className={`ml-0 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${activity.badge.color}`}
                      variant="outline"
                    >
                      {activity.badge.text}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-end sm:items-end gap-1 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                  <span>{activity.icon}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Activity;

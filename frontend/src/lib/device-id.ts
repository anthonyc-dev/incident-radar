/**
 * Persistent device identifier for auth and session binding.
 * Stored in localStorage to survive reloads; generated once per device.
 */

const STORAGE_KEY = "incident_radar_device_id";

function generateId(): string {
  return `web-${crypto.randomUUID()}-${Date.now().toString(36)}`;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "ssr-unknown";
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

export type ToolCategory =
  | "DFIR" | "SIEM" | "SOAR" | "Threat Intel" | "Endpoint Management"
  | "Network Analysis" | "Attack Simulation" | "Intrusion Detection" | "Utility";

export type ToolStatus = "running" | "stopped";

export type ToolHealth = "Optimal" | "Healthy" | "Degraded";

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  status: ToolStatus;
  health: ToolHealth;
  uptimeMinutes?: number | undefined;
  critical?: boolean;
  tags?: string[];
}
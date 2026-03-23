/**
 * Audit Engine — Centralized action logging and admin alert system
 */

import { db } from "../db";
import { auditLog, adminAlerts } from "@shared/schema";

interface LogActionParams {
  userId?: number;
  adminId?: number;
  action: string;
  entity?: string;
  entityId?: number;
  details?: object;
  status?: string;
  errorMessage?: string;
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: params.userId ?? null,
      adminId: params.adminId ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entityId: params.entityId ?? null,
      details: params.details ? JSON.stringify(params.details) : null,
      status: params.status ?? "success",
      errorMessage: params.errorMessage ?? null,
    });
  } catch (err) {
    // Never let audit logging crash the main flow
    console.error("[AuditEngine] Failed to log action:", err);
  }
}

export async function createAdminAlert(
  type: "error" | "warning" | "info",
  title: string,
  message: string,
  entityType?: string,
  entityId?: number
): Promise<void> {
  try {
    await db.insert(adminAlerts).values({
      type,
      title,
      message,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      resolved: false,
    });
  } catch (err) {
    console.error("[AuditEngine] Failed to create admin alert:", err);
  }
}

export async function getUnresolvedAlerts() {
  try {
    const { eq } = await import("drizzle-orm");
    return await db
      .select()
      .from(adminAlerts)
      .where(eq(adminAlerts.resolved, false))
      .orderBy(adminAlerts.createdAt);
  } catch (err) {
    console.error("[AuditEngine] Failed to fetch alerts:", err);
    return [];
  }
}

export async function resolveAlert(alertId: number): Promise<void> {
  try {
    const { eq } = await import("drizzle-orm");
    await db
      .update(adminAlerts)
      .set({ resolved: true, resolvedAt: new Date() })
      .where(eq(adminAlerts.id, alertId));
  } catch (err) {
    console.error("[AuditEngine] Failed to resolve alert:", err);
  }
}

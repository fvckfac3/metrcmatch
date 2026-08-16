import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  discrepancies,
  facilities,
  facilityMembers,
  type InsertUser,
  inventorySnapshots,
  metrcConnections,
  metrcSyncs,
  notificationEvents,
  physicalLogs,
  reconciliationReports,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { encryptSecret } from "./security";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

async function requireDb() {
  const database = await getDb();
  if (!database) throw new Error("The database is unavailable. Please try again shortly.");
  return database;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const database = await getDb();
  if (!database) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await database.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const database = await getDb();
  if (!database) return undefined;
  return (await database.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function ensureFacilityForUser(userId: number) {
  const database = await requireDb();
  const existing = await database
    .select({ facility: facilities, member: facilityMembers })
    .from(facilityMembers)
    .innerJoin(facilities, eq(facilityMembers.facilityId, facilities.id))
    .where(eq(facilityMembers.userId, userId))
    .limit(1);
  if (existing[0]) return { ...existing[0].facility, memberRole: existing[0].member.role };

  const created = await database.insert(facilities).values({ name: "Facility setup required" });
  const facilityId = Number((created as unknown as { insertId: number }).insertId);
  await database.insert(facilityMembers).values({ facilityId, userId, role: "manager" });
  const facility = (await database.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1))[0]!;
  return { ...facility, memberRole: "manager" as const };
}

export async function updateFacility(userId: number, input: { name: string; licenseNumber?: string | null; address?: string | null; timezone: string; complianceManagerEmail?: string | null; onboardingComplete: boolean }) {
  const database = await requireDb();
  const facility = await ensureFacilityForUser(userId);
  await database.update(facilities).set(input).where(eq(facilities.id, facility.id));
  return (await database.select().from(facilities).where(eq(facilities.id, facility.id)).limit(1))[0]!;
}

export async function getFacility(facilityId: number) {
  const database = await requireDb();
  return (await database.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1))[0];
}

export async function getMetrcConnection(facilityId: number) {
  const database = await requireDb();
  return (await database.select().from(metrcConnections).where(eq(metrcConnections.facilityId, facilityId)).limit(1))[0];
}

export async function saveMetrcConnection(facilityId: number, input: {
  authMethod: "api_key" | "oauth"; apiBaseUrl: string; licenseNumber: string;
  userApiKey?: string; integratorApiKey?: string; oauthClientId?: string; oauthClientSecret?: string;
}) {
  const database = await requireDb();
  const current = await getMetrcConnection(facilityId);
  const values = {
    authMethod: input.authMethod,
    apiBaseUrl: input.apiBaseUrl,
    licenseNumber: input.licenseNumber,
    encryptedUserApiKey: input.userApiKey ? encryptSecret(input.userApiKey) : current?.encryptedUserApiKey ?? null,
    encryptedIntegratorApiKey: input.integratorApiKey ? encryptSecret(input.integratorApiKey) : current?.encryptedIntegratorApiKey ?? null,
    encryptedOauthClientId: input.oauthClientId ? encryptSecret(input.oauthClientId) : current?.encryptedOauthClientId ?? null,
    encryptedOauthClientSecret: input.oauthClientSecret ? encryptSecret(input.oauthClientSecret) : current?.encryptedOauthClientSecret ?? null,
  };
  if (current) await database.update(metrcConnections).set(values).where(eq(metrcConnections.id, current.id));
  else await database.insert(metrcConnections).values({ facilityId, ...values });
  return (await database.select().from(metrcConnections).where(eq(metrcConnections.facilityId, facilityId)).limit(1))[0]!;
}

export async function setConnectionStatus(facilityId: number, status: "connected" | "error" | "not_connected", options: { tested?: boolean; synced?: boolean } = {}) {
  const database = await requireDb();
  await database.update(metrcConnections).set({
    connectionStatus: status,
    ...(options.tested ? { lastTestedAt: new Date() } : {}),
    ...(options.synced ? { lastSyncedAt: new Date() } : {}),
  }).where(eq(metrcConnections.facilityId, facilityId));
}

export async function createSync(facilityId: number, trigger: "manual" | "scheduled") {
  const database = await requireDb();
  const result = await database.insert(metrcSyncs).values({ facilityId, trigger, status: "running" });
  return Number((result as unknown as { insertId: number }).insertId);
}

export async function finishSync(id: number, values: { status: "success" | "failed"; inventoryItems?: number; salesRecords?: number; testRecords?: number; errorSummary?: string }) {
  const database = await requireDb();
  await database.update(metrcSyncs).set({ ...values, finishedAt: new Date() }).where(eq(metrcSyncs.id, id));
}

export async function listSyncs(facilityId: number) {
  const database = await requireDb();
  return database.select().from(metrcSyncs).where(eq(metrcSyncs.facilityId, facilityId)).orderBy(desc(metrcSyncs.startedAt)).limit(10);
}

export async function upsertInventorySnapshots(facilityId: number, records: Array<{ metrcPackageId: string; packageLabel: string | null; productName: string; sku: string | null; quantity: number; unitOfMeasure: string; testingStatus: string; sourceLastModifiedAt: Date | null }>) {
  const database = await requireDb();
  for (const record of records) {
    await database.insert(inventorySnapshots).values({ facilityId, ...record, quantity: String(record.quantity) })
      .onDuplicateKeyUpdate({ set: { packageLabel: record.packageLabel, productName: record.productName, sku: record.sku, quantity: String(record.quantity), unitOfMeasure: record.unitOfMeasure, testingStatus: record.testingStatus, sourceLastModifiedAt: record.sourceLastModifiedAt, capturedAt: new Date() } });
  }
}

export async function listInventory(facilityId: number) {
  const database = await requireDb();
  return database.select().from(inventorySnapshots).where(eq(inventorySnapshots.facilityId, facilityId)).orderBy(inventorySnapshots.productName);
}

export async function getInventoryByPackage(facilityId: number, metrcPackageId: string) {
  const database = await requireDb();
  return (await database.select().from(inventorySnapshots).where(and(eq(inventorySnapshots.facilityId, facilityId), eq(inventorySnapshots.metrcPackageId, metrcPackageId))).limit(1))[0];
}

export async function createPhysicalLog(input: { facilityId: number; createdByUserId: number; inventorySnapshotId?: number | null; metrcPackageId?: string | null; productName: string; sku?: string | null; type: "count" | "damage" | "discard" | "test_result"; quantity?: number | null; location?: string | null; reason?: "broken" | "expired" | "theft" | "waste" | "other" | null; testStatus?: "passed" | "failed" | null; receivedAt?: Date | null; notes?: string | null }) {
  const database = await requireDb();
  const result = await database.insert(physicalLogs).values({ ...input, quantity: input.quantity === null || input.quantity === undefined ? null : String(input.quantity), occurredAt: new Date() });
  return Number((result as unknown as { insertId: number }).insertId);
}

export async function listPhysicalLogs(facilityId: number, filters: { type?: "count" | "damage" | "discard" | "test_result"; query?: string; limit?: number } = {}) {
  const database = await requireDb();
  const conditions = [eq(physicalLogs.facilityId, facilityId)];
  if (filters.type) conditions.push(eq(physicalLogs.type, filters.type));
  const rows = await database.select().from(physicalLogs).where(and(...conditions)).orderBy(desc(physicalLogs.occurredAt)).limit(filters.limit ?? 100);
  const query = filters.query?.toLowerCase().trim();
  return query ? rows.filter(row => `${row.productName} ${row.sku ?? ""} ${row.location ?? ""}`.toLowerCase().includes(query)) : rows;
}

export async function latestLogsByPackage(facilityId: number) {
  const logs = await listPhysicalLogs(facilityId, { limit: 1000 });
  const latestCounts = new Map<string, typeof logs[number]>();
  const recentDamage = new Set<string>();
  for (const log of logs) {
    if (!log.metrcPackageId) continue;
    if (log.type === "count" && !latestCounts.has(log.metrcPackageId)) latestCounts.set(log.metrcPackageId, log);
    if (log.type === "damage" || log.type === "discard") recentDamage.add(log.metrcPackageId);
  }
  return { latestCounts, recentDamage };
}

export async function getDiscrepancy(facilityId: number, packageId: string) {
  const database = await requireDb();
  return (await database.select().from(discrepancies).where(and(eq(discrepancies.facilityId, facilityId), eq(discrepancies.metrcPackageId, packageId))).limit(1))[0];
}

export async function upsertDiscrepancy(input: { facilityId: number; inventorySnapshotId: number; metrcPackageId: string; productName: string; sku?: string | null; metrcQuantity: number; physicalQuantity: number | null; varianceQuantity: number; variancePercent: number; severity: "critical" | "high" | "medium"; likelyCause: string }) {
  const database = await requireDb();
  const existing = await getDiscrepancy(input.facilityId, input.metrcPackageId);
  const values = { ...input, metrcQuantity: String(input.metrcQuantity), physicalQuantity: input.physicalQuantity === null ? null : String(input.physicalQuantity), varianceQuantity: String(input.varianceQuantity), variancePercent: String(input.variancePercent) };
  if (existing) {
    await database.update(discrepancies).set({ ...values, status: existing.status === "resolved" ? "investigating" : existing.status, resolvedAt: null }).where(eq(discrepancies.id, existing.id));
    return { id: existing.id, isNew: false, severity: input.severity };
  }
  const result = await database.insert(discrepancies).values(values);
  return { id: Number((result as unknown as { insertId: number }).insertId), isNew: true, severity: input.severity };
}

export async function resolveClearedDiscrepancy(facilityId: number, packageId: string) {
  const existing = await getDiscrepancy(facilityId, packageId);
  if (!existing || existing.status === "resolved") return;
  const database = await requireDb();
  await database.update(discrepancies).set({ status: "resolved", resolutionNotes: "Variance cleared after reconciliation.", resolvedAt: new Date() }).where(eq(discrepancies.id, existing.id));
}

export async function listDiscrepancies(facilityId: number, filters: { status?: "investigating" | "resolved" | "awaiting_lab" | "other"; severity?: "critical" | "high" | "medium" } = {}) {
  const database = await requireDb();
  const conditions = [eq(discrepancies.facilityId, facilityId)];
  if (filters.status) conditions.push(eq(discrepancies.status, filters.status));
  if (filters.severity) conditions.push(eq(discrepancies.severity, filters.severity));
  return database.select().from(discrepancies).where(and(...conditions)).orderBy(sql`FIELD(${discrepancies.severity}, 'critical', 'high', 'medium')`, desc(discrepancies.detectedAt));
}

export async function updateDiscrepancy(facilityId: number, id: number, input: { status: "investigating" | "resolved" | "awaiting_lab" | "other"; resolutionNotes?: string | null }) {
  const database = await requireDb();
  await database.update(discrepancies).set({ status: input.status, resolutionNotes: input.resolutionNotes ?? null, ...(input.status === "resolved" ? { resolvedAt: new Date() } : { resolvedAt: null }) }).where(and(eq(discrepancies.id, id), eq(discrepancies.facilityId, facilityId)));
}

export async function createNotification(input: { facilityId: number; discrepancyId?: number; type: "critical_discrepancy" | "high_discrepancy" | "audit_risk_red"; recipient?: string | null; detail: string; status?: "queued" | "sent" | "suppressed" | "failed" }) {
  const database = await requireDb();
  const result = await database.insert(notificationEvents).values({ ...input, discrepancyId: input.discrepancyId ?? null, recipient: input.recipient ?? null, status: input.status ?? (input.recipient ? "queued" : "suppressed") });
  return Number((result as unknown as { insertId: number }).insertId);
}

export async function updateNotificationStatus(id: number, status: "sent" | "failed" | "suppressed") {
  const database = await requireDb();
  await database.update(notificationEvents).set({ status, ...(status === "sent" ? { deliveredAt: new Date() } : {}) }).where(eq(notificationEvents.id, id));
}

export async function getDashboardData(facilityId: number) {
  const database = await requireDb();
  const [connection, inventory, allDiscrepancies, reports] = await Promise.all([
    getMetrcConnection(facilityId),
    listInventory(facilityId),
    listDiscrepancies(facilityId),
    database.select().from(reconciliationReports).where(eq(reconciliationReports.facilityId, facilityId)).orderBy(desc(reconciliationReports.createdAt)).limit(1),
  ]);
  const active = allDiscrepancies.filter(item => item.status !== "resolved");
  const severities = { critical: active.filter(item => item.severity === "critical").length, high: active.filter(item => item.severity === "high").length, medium: active.filter(item => item.severity === "medium").length };
  const since = new Date(); since.setDate(since.getDate() - 7);
  const reconciled = await database.select({ count: sql<number>`count(*)` }).from(physicalLogs).where(and(eq(physicalLogs.facilityId, facilityId), eq(physicalLogs.type, "count"), gte(physicalLogs.occurredAt, since)));
  return { connection, products: inventory.length, discrepancies: active, severities, reconciledThisWeek: Number(reconciled[0]?.count ?? 0), latestReport: reports[0] ?? null };
}

export async function createReport(facilityId: number, user: { id: number; name: string | null }, startDate: Date, endDate: Date) {
  const database = await requireDb();
  const [inventory, discrepancyRows] = await Promise.all([
    listInventory(facilityId),
    database.select().from(discrepancies).where(and(eq(discrepancies.facilityId, facilityId), gte(discrepancies.detectedAt, startDate), lte(discrepancies.detectedAt, endDate))),
  ]);
  const found = discrepancyRows.length;
  const resolved = discrepancyRows.filter(item => item.status === "resolved").length;
  const values = { facilityId, preparedByUserId: user.id, preparedByName: user.name ?? "Facility preparer", startDate, endDate, totalItemsReconciled: inventory.length, discrepanciesFound: found, discrepanciesResolved: resolved, outstandingDiscrepancies: found - resolved, criticalCount: discrepancyRows.filter(item => item.severity === "critical").length, highCount: discrepancyRows.filter(item => item.severity === "high").length, mediumCount: discrepancyRows.filter(item => item.severity === "medium").length };
  const result = await database.insert(reconciliationReports).values(values);
  return Number((result as unknown as { insertId: number }).insertId);
}

export async function getReportData(facilityId: number, reportId: number) {
  const database = await requireDb();
  const report = (await database.select().from(reconciliationReports).where(and(eq(reconciliationReports.id, reportId), eq(reconciliationReports.facilityId, facilityId))).limit(1))[0];
  if (!report) throw new Error("Report not found.");
  const facility = (await database.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1))[0]!;
  const lines = await database.select().from(discrepancies).where(and(eq(discrepancies.facilityId, facilityId), gte(discrepancies.detectedAt, report.startDate), lte(discrepancies.detectedAt, report.endDate))).orderBy(desc(discrepancies.detectedAt));
  return { facility, report, lines };
}

export async function getFacilityByScheduleTask(taskUid: string) {
  const database = await requireDb();
  const connection = (await database.select().from(metrcConnections).where(eq(metrcConnections.scheduleCronTaskUid, taskUid)).limit(1))[0];
  if (!connection) return undefined;
  return { connection, facility: (await database.select().from(facilities).where(eq(facilities.id, connection.facilityId)).limit(1))[0]! };
}

export async function setScheduleTask(facilityId: number, taskUid: string | null) {
  const database = await requireDb();
  await database.update(metrcConnections).set({ scheduleCronTaskUid: taskUid }).where(eq(metrcConnections.facilityId, facilityId));
}

import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const facilities = mysqlTable(
  "facilities",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    licenseNumber: varchar("licenseNumber", { length: 100 }),
    address: varchar("address", { length: 500 }),
    timezone: varchar("timezone", { length: 64 })
      .default("America/Los_Angeles")
      .notNull(),
    complianceManagerEmail: varchar("complianceManagerEmail", { length: 320 }),
    onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
    subscriptionPlan: mysqlEnum("subscriptionPlan", [
      "starter",
      "growth",
      "enterprise",
    ]),
    subscriptionStatus: mysqlEnum("subscriptionStatus", [
      "inactive",
      "trialing",
      "active",
      "past_due",
      "canceled",
      "unpaid",
    ])
      .default("inactive")
      .notNull(),
    trialEndsAt: timestamp("trialEndsAt"),
    currentPeriodEndsAt: timestamp("currentPeriodEndsAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("facilities_stripe_customer_unique").on(table.stripeCustomerId),
    uniqueIndex("facilities_stripe_subscription_unique").on(
      table.stripeSubscriptionId
    ),
  ]
);

export const facilityMembers = mysqlTable(
  "facilityMembers",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["manager", "staff"]).default("manager").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("facilityMembers_facility_user_unique").on(
      table.facilityId,
      table.userId
    ),
    index("facilityMembers_user_idx").on(table.userId),
  ]
);

export const metrcConnections = mysqlTable(
  "metrcConnections",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    authMethod: mysqlEnum("authMethod", ["api_key", "oauth"])
      .default("api_key")
      .notNull(),
    encryptedUserApiKey: text("encryptedUserApiKey"),
    encryptedIntegratorApiKey: text("encryptedIntegratorApiKey"),
    encryptedOauthClientId: text("encryptedOauthClientId"),
    encryptedOauthClientSecret: text("encryptedOauthClientSecret"),
    apiBaseUrl: varchar("apiBaseUrl", { length: 500 })
      .default("https://api-or.metrc.com")
      .notNull(),
    licenseNumber: varchar("licenseNumber", { length: 100 }),
    connectionStatus: mysqlEnum("connectionStatus", [
      "not_connected",
      "connected",
      "error",
    ])
      .default("not_connected")
      .notNull(),
    lastTestedAt: timestamp("lastTestedAt"),
    lastSyncedAt: timestamp("lastSyncedAt"),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("metrcConnections_facility_unique").on(table.facilityId),
    index("metrcConnections_schedule_idx").on(table.scheduleCronTaskUid),
  ]
);

export const metrcSyncs = mysqlTable(
  "metrcSyncs",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    trigger: mysqlEnum("trigger", ["manual", "scheduled"]).notNull(),
    status: mysqlEnum("status", ["running", "success", "failed"]).notNull(),
    inventoryItems: int("inventoryItems").default(0).notNull(),
    salesRecords: int("salesRecords").default(0).notNull(),
    testRecords: int("testRecords").default(0).notNull(),
    errorSummary: text("errorSummary"),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    finishedAt: timestamp("finishedAt"),
  },
  table => [
    index("metrcSyncs_facility_started_idx").on(
      table.facilityId,
      table.startedAt
    ),
  ]
);

export const inventorySnapshots = mysqlTable(
  "inventorySnapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    metrcPackageId: varchar("metrcPackageId", { length: 128 }).notNull(),
    packageLabel: varchar("packageLabel", { length: 255 }),
    productName: varchar("productName", { length: 500 }).notNull(),
    sku: varchar("sku", { length: 255 }),
    quantity: decimal("quantity", { precision: 14, scale: 3 }).notNull(),
    unitOfMeasure: varchar("unitOfMeasure", { length: 64 })
      .default("units")
      .notNull(),
    testingStatus: varchar("testingStatus", { length: 100 })
      .default("Unknown")
      .notNull(),
    sourceLastModifiedAt: timestamp("sourceLastModifiedAt"),
    capturedAt: timestamp("capturedAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("inventorySnapshots_facility_package_unique").on(
      table.facilityId,
      table.metrcPackageId
    ),
    index("inventorySnapshots_facility_product_idx").on(
      table.facilityId,
      table.productName
    ),
  ]
);

export const metrcTestResults = mysqlTable(
  "metrcTestResults",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    metrcPackageId: varchar("metrcPackageId", { length: 128 }).notNull(),
    testStatus: varchar("testStatus", { length: 100 }).notNull(),
    receivedAt: timestamp("receivedAt"),
    sourceLastModifiedAt: timestamp("sourceLastModifiedAt"),
    rawPayload: text("rawPayload"),
    capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("metrcTestResults_facility_package_unique").on(
      table.facilityId,
      table.metrcPackageId
    ),
    index("metrcTestResults_facility_modified_idx").on(
      table.facilityId,
      table.sourceLastModifiedAt
    ),
  ]
);

export const physicalLogs = mysqlTable(
  "physicalLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    createdByUserId: int("createdByUserId").notNull(),
    inventorySnapshotId: int("inventorySnapshotId"),
    metrcPackageId: varchar("metrcPackageId", { length: 128 }),
    productName: varchar("productName", { length: 500 }).notNull(),
    sku: varchar("sku", { length: 255 }),
    type: mysqlEnum("type", [
      "count",
      "damage",
      "discard",
      "test_result",
    ]).notNull(),
    quantity: decimal("quantity", { precision: 14, scale: 3 }),
    location: varchar("location", { length: 255 }),
    reason: mysqlEnum("reason", [
      "broken",
      "expired",
      "theft",
      "waste",
      "other",
    ]),
    testStatus: mysqlEnum("testStatus", ["passed", "failed"]),
    receivedAt: timestamp("receivedAt"),
    notes: text("notes"),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("physicalLogs_facility_date_idx").on(
      table.facilityId,
      table.occurredAt
    ),
    index("physicalLogs_facility_package_idx").on(
      table.facilityId,
      table.metrcPackageId
    ),
  ]
);

export const discrepancies = mysqlTable(
  "discrepancies",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    inventorySnapshotId: int("inventorySnapshotId"),
    metrcPackageId: varchar("metrcPackageId", { length: 128 }).notNull(),
    productName: varchar("productName", { length: 500 }).notNull(),
    sku: varchar("sku", { length: 255 }),
    metrcQuantity: decimal("metrcQuantity", {
      precision: 14,
      scale: 3,
    }).notNull(),
    physicalQuantity: decimal("physicalQuantity", { precision: 14, scale: 3 }),
    varianceQuantity: decimal("varianceQuantity", {
      precision: 14,
      scale: 3,
    }).notNull(),
    variancePercent: decimal("variancePercent", {
      precision: 8,
      scale: 2,
    }).notNull(),
    severity: mysqlEnum("severity", ["critical", "high", "medium"]).notNull(),
    likelyCause: varchar("likelyCause", { length: 500 }).notNull(),
    status: mysqlEnum("status", [
      "investigating",
      "resolved",
      "awaiting_lab",
      "other",
    ])
      .default("investigating")
      .notNull(),
    resolutionNotes: text("resolutionNotes"),
    detectedAt: timestamp("detectedAt").defaultNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("discrepancies_facility_package_unique").on(
      table.facilityId,
      table.metrcPackageId
    ),
    index("discrepancies_facility_severity_idx").on(
      table.facilityId,
      table.severity
    ),
  ]
);

export const reconciliationReports = mysqlTable(
  "reconciliationReports",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    preparedByUserId: int("preparedByUserId").notNull(),
    preparedByName: varchar("preparedByName", { length: 255 }).notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    totalItemsReconciled: int("totalItemsReconciled").default(0).notNull(),
    discrepanciesFound: int("discrepanciesFound").default(0).notNull(),
    discrepanciesResolved: int("discrepanciesResolved").default(0).notNull(),
    outstandingDiscrepancies: int("outstandingDiscrepancies")
      .default(0)
      .notNull(),
    criticalCount: int("criticalCount").default(0).notNull(),
    highCount: int("highCount").default(0).notNull(),
    mediumCount: int("mediumCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("reconciliationReports_facility_created_idx").on(
      table.facilityId,
      table.createdAt
    ),
  ]
);

export const notificationEvents = mysqlTable(
  "notificationEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    facilityId: int("facilityId").notNull(),
    discrepancyId: int("discrepancyId"),
    type: mysqlEnum("type", [
      "critical_discrepancy",
      "high_discrepancy",
      "audit_risk_red",
    ]).notNull(),
    recipient: varchar("recipient", { length: 320 }),
    status: mysqlEnum("status", ["queued", "sent", "suppressed", "failed"])
      .default("queued")
      .notNull(),
    detail: text("detail").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    deliveredAt: timestamp("deliveredAt"),
  },
  table => [
    index("notificationEvents_facility_created_idx").on(
      table.facilityId,
      table.createdAt
    ),
  ]
);

export const contactRequests = mysqlTable(
  "contactRequests",
  {
    id: int("id").autoincrement().primaryKey(),
    requestType: mysqlEnum("requestType", ["privacy", "general"]).notNull(),
    name: varchar("name", { length: 120 }),
    email: varchar("email", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 255 }),
    message: text("message").notNull(),
    status: mysqlEnum("status", ["new", "in_review", "closed"])
      .default("new")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("contactRequests_status_created_idx").on(
      table.status,
      table.createdAt
    ),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(facilityMembers),
}));
export const facilitiesRelations = relations(facilities, ({ many }) => ({
  members: many(facilityMembers),
  inventory: many(inventorySnapshots),
  logs: many(physicalLogs),
  discrepancies: many(discrepancies),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Facility = typeof facilities.$inferSelect;
export type MetrcConnection = typeof metrcConnections.$inferSelect;
export type InventorySnapshot = typeof inventorySnapshots.$inferSelect;
export type MetrcTestResult = typeof metrcTestResults.$inferSelect;
export type PhysicalLog = typeof physicalLogs.$inferSelect;
export type Discrepancy = typeof discrepancies.$inferSelect;

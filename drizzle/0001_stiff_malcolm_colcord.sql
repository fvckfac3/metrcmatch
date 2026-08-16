CREATE TABLE `discrepancies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`inventorySnapshotId` int,
	`metrcPackageId` varchar(128) NOT NULL,
	`productName` varchar(500) NOT NULL,
	`sku` varchar(255),
	`metrcQuantity` decimal(14,3) NOT NULL,
	`physicalQuantity` decimal(14,3),
	`varianceQuantity` decimal(14,3) NOT NULL,
	`variancePercent` decimal(8,2) NOT NULL,
	`severity` enum('critical','high','medium') NOT NULL,
	`likelyCause` varchar(500) NOT NULL,
	`status` enum('investigating','resolved','awaiting_lab','other') NOT NULL DEFAULT 'investigating',
	`resolutionNotes` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discrepancies_id` PRIMARY KEY(`id`),
	CONSTRAINT `discrepancies_facility_package_unique` UNIQUE(`facilityId`,`metrcPackageId`)
);
--> statement-breakpoint
CREATE TABLE `facilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`licenseNumber` varchar(100),
	`address` varchar(500),
	`timezone` varchar(64) NOT NULL DEFAULT 'America/Los_Angeles',
	`complianceManagerEmail` varchar(320),
	`onboardingComplete` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facilityMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('manager','staff') NOT NULL DEFAULT 'manager',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `facilityMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `facilityMembers_facility_user_unique` UNIQUE(`facilityId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `inventorySnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`metrcPackageId` varchar(128) NOT NULL,
	`packageLabel` varchar(255),
	`productName` varchar(500) NOT NULL,
	`sku` varchar(255),
	`quantity` decimal(14,3) NOT NULL,
	`unitOfMeasure` varchar(64) NOT NULL DEFAULT 'units',
	`testingStatus` varchar(100) NOT NULL DEFAULT 'Unknown',
	`sourceLastModifiedAt` timestamp,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventorySnapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventorySnapshots_facility_package_unique` UNIQUE(`facilityId`,`metrcPackageId`)
);
--> statement-breakpoint
CREATE TABLE `metrcConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`authMethod` enum('api_key','oauth') NOT NULL DEFAULT 'api_key',
	`encryptedUserApiKey` text,
	`encryptedIntegratorApiKey` text,
	`encryptedOauthClientId` text,
	`encryptedOauthClientSecret` text,
	`apiBaseUrl` varchar(500) NOT NULL DEFAULT 'https://api-or.metrc.com',
	`licenseNumber` varchar(100),
	`connectionStatus` enum('not_connected','connected','error') NOT NULL DEFAULT 'not_connected',
	`lastTestedAt` timestamp,
	`lastSyncedAt` timestamp,
	`scheduleCronTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metrcConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `metrcConnections_facility_unique` UNIQUE(`facilityId`)
);
--> statement-breakpoint
CREATE TABLE `metrcSyncs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`trigger` enum('manual','scheduled') NOT NULL,
	`status` enum('running','success','failed') NOT NULL,
	`inventoryItems` int NOT NULL DEFAULT 0,
	`salesRecords` int NOT NULL DEFAULT 0,
	`testRecords` int NOT NULL DEFAULT 0,
	`errorSummary` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	CONSTRAINT `metrcSyncs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`discrepancyId` int,
	`type` enum('critical_discrepancy','high_discrepancy','audit_risk_red') NOT NULL,
	`recipient` varchar(320),
	`status` enum('queued','sent','suppressed','failed') NOT NULL DEFAULT 'queued',
	`detail` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deliveredAt` timestamp,
	CONSTRAINT `notificationEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `physicalLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`inventorySnapshotId` int,
	`metrcPackageId` varchar(128),
	`productName` varchar(500) NOT NULL,
	`sku` varchar(255),
	`type` enum('count','damage','discard','test_result') NOT NULL,
	`quantity` decimal(14,3),
	`location` varchar(255),
	`reason` enum('broken','expired','theft','waste','other'),
	`testStatus` enum('passed','failed'),
	`receivedAt` timestamp,
	`notes` text,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `physicalLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reconciliationReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`preparedByUserId` int NOT NULL,
	`preparedByName` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`totalItemsReconciled` int NOT NULL DEFAULT 0,
	`discrepanciesFound` int NOT NULL DEFAULT 0,
	`discrepanciesResolved` int NOT NULL DEFAULT 0,
	`outstandingDiscrepancies` int NOT NULL DEFAULT 0,
	`criticalCount` int NOT NULL DEFAULT 0,
	`highCount` int NOT NULL DEFAULT 0,
	`mediumCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reconciliationReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `discrepancies_facility_severity_idx` ON `discrepancies` (`facilityId`,`severity`);--> statement-breakpoint
CREATE INDEX `facilityMembers_user_idx` ON `facilityMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `inventorySnapshots_facility_product_idx` ON `inventorySnapshots` (`facilityId`,`productName`);--> statement-breakpoint
CREATE INDEX `metrcConnections_schedule_idx` ON `metrcConnections` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `metrcSyncs_facility_started_idx` ON `metrcSyncs` (`facilityId`,`startedAt`);--> statement-breakpoint
CREATE INDEX `notificationEvents_facility_created_idx` ON `notificationEvents` (`facilityId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `physicalLogs_facility_date_idx` ON `physicalLogs` (`facilityId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `physicalLogs_facility_package_idx` ON `physicalLogs` (`facilityId`,`metrcPackageId`);--> statement-breakpoint
CREATE INDEX `reconciliationReports_facility_created_idx` ON `reconciliationReports` (`facilityId`,`createdAt`);
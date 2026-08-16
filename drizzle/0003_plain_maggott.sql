CREATE TABLE `metrcTestResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`metrcPackageId` varchar(128) NOT NULL,
	`testStatus` varchar(100) NOT NULL,
	`receivedAt` timestamp,
	`sourceLastModifiedAt` timestamp,
	`rawPayload` text,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metrcTestResults_id` PRIMARY KEY(`id`),
	CONSTRAINT `metrcTestResults_facility_package_unique` UNIQUE(`facilityId`,`metrcPackageId`)
);
--> statement-breakpoint
CREATE INDEX `metrcTestResults_facility_modified_idx` ON `metrcTestResults` (`facilityId`,`sourceLastModifiedAt`);
ALTER TABLE `contactRequests` ADD `isDemo` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `contactRequests_demo_created_idx` ON `contactRequests` (`isDemo`,`createdAt`);
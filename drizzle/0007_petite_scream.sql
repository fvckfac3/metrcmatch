CREATE TABLE `customNotificationDismissals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` int NOT NULL,
	`userId` int NOT NULL,
	`dismissedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customNotificationDismissals_id` PRIMARY KEY(`id`),
	CONSTRAINT `customNotificationDismissals_notification_user_unique` UNIQUE(`notificationId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `customNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(140) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','success','warning','critical') NOT NULL DEFAULT 'info',
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `customNotificationDismissals_user_idx` ON `customNotificationDismissals` (`userId`);--> statement-breakpoint
CREATE INDEX `customNotifications_active_expires_idx` ON `customNotifications` (`isActive`,`expiresAt`);
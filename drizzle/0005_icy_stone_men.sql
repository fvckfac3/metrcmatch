CREATE TABLE `contactRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestType` enum('privacy','general') NOT NULL,
	`name` varchar(120),
	`email` varchar(320) NOT NULL,
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` enum('new','in_review','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `contactRequests_status_created_idx` ON `contactRequests` (`status`,`createdAt`);
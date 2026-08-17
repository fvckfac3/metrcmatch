ALTER TABLE `facilities` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `facilities` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `facilities` ADD `subscriptionPlan` enum('starter','growth','enterprise');--> statement-breakpoint
ALTER TABLE `facilities` ADD `subscriptionStatus` enum('inactive','trialing','active','past_due','canceled','unpaid') DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE `facilities` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `facilities` ADD `currentPeriodEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `facilities` ADD CONSTRAINT `facilities_stripe_customer_unique` UNIQUE(`stripeCustomerId`);--> statement-breakpoint
ALTER TABLE `facilities` ADD CONSTRAINT `facilities_stripe_subscription_unique` UNIQUE(`stripeSubscriptionId`);
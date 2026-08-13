CREATE TABLE `rootedfit_profile_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileVersion` varchar(32) NOT NULL DEFAULT 'v1',
	`consentVersion` varchar(32),
	`localDataPreference` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rootedfit_profile_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `rootedfit_profile_credentials_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `rootedfit_user_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`email` varchar(320),
	`passwordHash` varchar(255),
	`emailVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rootedfit_user_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rootedfit_exercise_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workoutId` varchar(512) NOT NULL,
	`exerciseName` varchar(255) NOT NULL,
	`setNumber` int NOT NULL,
	`repCount` int NOT NULL,
	`weightUsedKg` decimal(7,2),
	`performedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rootedfit_exercise_logs_id` PRIMARY KEY(`id`)
);

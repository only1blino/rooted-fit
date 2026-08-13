CREATE TABLE `rootedfit_tester_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(32) NOT NULL,
	`message` text NOT NULL,
	`pageUrl` varchar(1024),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rootedfit_tester_feedback_id` PRIMARY KEY(`id`)
);

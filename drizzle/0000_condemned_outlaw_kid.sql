CREATE TABLE `cities` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`prefecture_code` text NOT NULL,
	`archived` integer NOT NULL,
	FOREIGN KEY (`prefecture_code`) REFERENCES `prefectures`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cities_histories` (
	`ancestor` text NOT NULL,
	`descendant` text NOT NULL,
	PRIMARY KEY(`ancestor`, `descendant`),
	FOREIGN KEY (`ancestor`) REFERENCES `cities`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`descendant`) REFERENCES `cities`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ch_desc_anc_idx` ON `cities_histories` (`descendant`,`ancestor`);--> statement-breakpoint
CREATE TABLE `elections` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` integer NOT NULL,
	`source` text NOT NULL,
	`election_type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `parties` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parties_code_unique` ON `parties` (`code`);--> statement-breakpoint
CREATE TABLE `prefectures` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`region_code` text NOT NULL,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `total_counts_on_all` (
	`election_code` text PRIMARY KEY NOT NULL,
	`count` real NOT NULL,
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `total_counts_on_cities` (
	`city_code` text NOT NULL,
	`election_code` text NOT NULL,
	`count` real NOT NULL,
	PRIMARY KEY(`city_code`, `election_code`),
	FOREIGN KEY (`city_code`) REFERENCES `cities`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `total_counts_on_prefectures` (
	`prefecture_code` text NOT NULL,
	`election_code` text NOT NULL,
	`count` real NOT NULL,
	PRIMARY KEY(`prefecture_code`, `election_code`),
	FOREIGN KEY (`prefecture_code`) REFERENCES `prefectures`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `total_counts_on_regions` (
	`region_code` text NOT NULL,
	`election_code` text NOT NULL,
	`count` real NOT NULL,
	PRIMARY KEY(`region_code`, `election_code`),
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `votes_on_all` (
	`election_code` text NOT NULL,
	`party_id` text NOT NULL,
	`count` real NOT NULL,
	PRIMARY KEY(`election_code`, `party_id`),
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `votes_on_cities` (
	`city_code` text NOT NULL,
	`election_code` text NOT NULL,
	`party_id` text NOT NULL,
	`count` real NOT NULL,
	PRIMARY KEY(`city_code`, `election_code`, `party_id`),
	FOREIGN KEY (`city_code`) REFERENCES `cities`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `voc_election_idx` ON `votes_on_cities` (`election_code`);--> statement-breakpoint
CREATE TABLE `votes_on_prefectures` (
	`prefecture_code` text NOT NULL,
	`election_code` text NOT NULL,
	`party_id` text NOT NULL,
	`count` real NOT NULL,
	PRIMARY KEY(`prefecture_code`, `election_code`, `party_id`),
	FOREIGN KEY (`prefecture_code`) REFERENCES `prefectures`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vop_election_idx` ON `votes_on_prefectures` (`election_code`);--> statement-breakpoint
CREATE TABLE `votes_on_regions` (
	`region_code` text NOT NULL,
	`election_code` text NOT NULL,
	`party_id` text NOT NULL,
	`count` real NOT NULL,
	PRIMARY KEY(`region_code`, `election_code`, `party_id`),
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`election_code`) REFERENCES `elections`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vor_election_idx` ON `votes_on_regions` (`election_code`);
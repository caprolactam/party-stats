CREATE TABLE `area_successions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`predecessor_id` text NOT NULL,
	`successor_id` text NOT NULL,
	`succession_type` text NOT NULL,
	`effective_date` integer NOT NULL,
	`note` text,
	FOREIGN KEY (`predecessor_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`successor_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chk_no_self_successions" CHECK("area_successions"."predecessor_id" != "area_successions"."successor_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uk_successions_relation` ON `area_successions` (`predecessor_id`,`successor_id`,`effective_date`);--> statement-breakpoint
CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`kana_name` text NOT NULL,
	`level` text NOT NULL,
	`code` text NOT NULL,
	`is_active` integer NOT NULL,
	`parent_id` text,
	FOREIGN KEY (`parent_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `areas_code_unique` ON `areas` (`code`);--> statement-breakpoint
CREATE INDEX `idx_areas_hierarchy` ON `areas` (`parent_id`);--> statement-breakpoint
CREATE TABLE `elections` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`round` integer NOT NULL,
	`held_at` integer NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `elections_type_round_unique` ON `elections` (`type`,`round`);--> statement-breakpoint
CREATE TABLE `parties` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parties_code_unique` ON `parties` (`code`);--> statement-breakpoint
CREATE TABLE `party_name_histories` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`party_id` text NOT NULL,
	`name` text NOT NULL,
	`effective_from` integer NOT NULL,
	`effective_to` integer NOT NULL,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chk_effective_period" CHECK("party_name_histories"."effective_from" <= "party_name_histories"."effective_to")
);
--> statement-breakpoint
CREATE INDEX `idx_party_names_lookup` ON `party_name_histories` (`party_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uk_party_name_period` ON `party_name_histories` (`party_id`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE TABLE `party_results` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`election_id` text NOT NULL,
	`area_id` text NOT NULL,
	`party_id` text NOT NULL,
	`votes` integer NOT NULL,
	`vote_rate` integer NOT NULL,
	FOREIGN KEY (`election_id`) REFERENCES `elections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chk_votes" CHECK("party_results"."votes" >= 0),
	CONSTRAINT "chk_vote_rate" CHECK("party_results"."vote_rate" >= 0 AND "party_results"."vote_rate" <= 10000)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uk_election_result` ON `party_results` (`election_id`,`area_id`,`party_id`);--> statement-breakpoint
CREATE TABLE `regions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `regions_name_unique` ON `regions` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `regions_code_unique` ON `regions` (`code`);--> statement-breakpoint
CREATE TABLE `regions_on_prefectures` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`region_id` text NOT NULL,
	`prefecture_id` text NOT NULL,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prefecture_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uk_regions_on_prefectures` ON `regions_on_prefectures` (`region_id`,`prefecture_id`);--> statement-breakpoint
CREATE TABLE `voting_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`election_id` text NOT NULL,
	`area_id` text NOT NULL,
	`total_voters` integer,
	`voted_male` integer,
	`voted_female` integer,
	`abstained_male` integer,
	`abstained_female` integer,
	`turnout_rate` integer,
	`valid_votes` integer NOT NULL,
	`invalid_votes` integer,
	`invalid_vote_rate` integer,
	FOREIGN KEY (`election_id`) REFERENCES `elections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chk_turnout_rate" CHECK("voting_statuses"."turnout_rate" IS NULL OR ("voting_statuses"."turnout_rate" >= 0 AND "voting_statuses"."turnout_rate" <= 10000)),
	CONSTRAINT "chk_invalid_vote_rate" CHECK("voting_statuses"."invalid_vote_rate" IS NULL OR ("voting_statuses"."invalid_vote_rate" >= 0 AND "voting_statuses"."invalid_vote_rate" <= 10000)),
	CONSTRAINT "chk_male_voters" CHECK(("voting_statuses"."voted_male" IS NULL OR "voting_statuses"."voted_male" >= 0) AND ("voting_statuses"."abstained_male" IS NULL OR "voting_statuses"."abstained_male" >= 0)),
	CONSTRAINT "chk_female_voters" CHECK(("voting_statuses"."voted_female" IS NULL OR "voting_statuses"."voted_female" >= 0) AND ("voting_statuses"."abstained_female" IS NULL OR "voting_statuses"."abstained_female" >= 0)),
	CONSTRAINT "chk_vote_counts" CHECK("voting_statuses"."valid_votes" >= 0 AND ("voting_statuses"."invalid_votes" IS NULL OR "voting_statuses"."invalid_votes" >= 0)),
	CONSTRAINT "chk_total_voters" CHECK("voting_statuses"."total_voters" IS NULL OR "voting_statuses"."total_voters" >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_voting_statuses_turnout_rate` ON `voting_statuses` (`turnout_rate`);--> statement-breakpoint
CREATE INDEX `idx_voting_statuses_invalid_vote_rate` ON `voting_statuses` (`invalid_vote_rate`);--> statement-breakpoint
CREATE INDEX `idx_voting_statuses_election_turnout` ON `voting_statuses` (`election_id`,`turnout_rate`);--> statement-breakpoint
CREATE UNIQUE INDEX `uk_voting_statuses` ON `voting_statuses` (`election_id`,`area_id`);
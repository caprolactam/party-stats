CREATE TABLE `area_successions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`predecessor_id` text NOT NULL,
	`successor_id` text NOT NULL,
	`succession_type` text NOT NULL,
	`effective_date` text NOT NULL,
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
	`level` text NOT NULL,
	`code` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`parent_id` text,
	FOREIGN KEY (`parent_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `areas_code_unique` ON `areas` (`code`);--> statement-breakpoint
CREATE INDEX `idx_areas_hierarchy` ON `areas` (`parent_id`,`level`);--> statement-breakpoint
CREATE TABLE `election_area_metas` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`election_id` text NOT NULL,
	`area_id` text NOT NULL,
	`registered` integer DEFAULT 0 NOT NULL,
	`registered_voters_male` integer DEFAULT 0 NOT NULL,
	`registered_voters_female` integer DEFAULT 0 NOT NULL,
	`turnout_voters_male` integer DEFAULT 0 NOT NULL,
	`turnout_voters_female` integer DEFAULT 0 NOT NULL,
	`turnout_rate` integer DEFAULT 0 NOT NULL,
	`valid_votes` integer DEFAULT 0 NOT NULL,
	`invalid_votes` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`election_id`) REFERENCES `elections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chk_turnout_rate" CHECK("election_area_metas"."turnout_rate" >= 0 AND "election_area_metas"."turnout_rate" <= 10000),
	CONSTRAINT "chk_male_voters" CHECK("election_area_metas"."registered_voters_male" >= 0 AND "election_area_metas"."turnout_voters_male" >= 0),
	CONSTRAINT "chk_female_voters" CHECK("election_area_metas"."registered_voters_female" >= 0 AND "election_area_metas"."turnout_voters_female" >= 0),
	CONSTRAINT "chk_male_turnout" CHECK("election_area_metas"."turnout_voters_male" <= "election_area_metas"."registered_voters_male"),
	CONSTRAINT "chk_female_turnout" CHECK("election_area_metas"."turnout_voters_female" <= "election_area_metas"."registered_voters_female"),
	CONSTRAINT "chk_vote_counts" CHECK("election_area_metas"."valid_votes" >= 0 AND "election_area_metas"."invalid_votes" >= 0),
	CONSTRAINT "chk_registered" CHECK("election_area_metas"."registered" >= 0),
	CONSTRAINT "chk_gender_registered_sum" CHECK("election_area_metas"."registered_voters_male" + "election_area_metas"."registered_voters_female" <= "election_area_metas"."registered"),
	CONSTRAINT "chk_gender_turnout_registered" CHECK("election_area_metas"."turnout_voters_male" + "election_area_metas"."turnout_voters_female" <= "election_area_metas"."registered")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uk_election_metas` ON `election_area_metas` (`election_id`,`area_id`);--> statement-breakpoint
CREATE TABLE `election_results` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`election_id` text NOT NULL,
	`area_id` text NOT NULL,
	`party_id` text NOT NULL,
	`votes` integer DEFAULT 0 NOT NULL,
	`vote_rate` integer DEFAULT 0 NOT NULL,
	`seats` integer,
	FOREIGN KEY (`election_id`) REFERENCES `elections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chk_votes" CHECK("election_results"."votes" >= 0),
	CONSTRAINT "chk_vote_rate" CHECK("election_results"."vote_rate" >= 0 AND "election_results"."vote_rate" <= 10000),
	CONSTRAINT "chk_seats" CHECK("election_results"."seats" IS NULL OR "election_results"."seats" >= 0),
	CONSTRAINT "chk_seats_votes_relation" CHECK("election_results"."seats" IS NULL OR "election_results"."seats" = 0 OR "election_results"."votes" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uk_election_result` ON `election_results` (`election_id`,`area_id`,`party_id`);--> statement-breakpoint
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
	`name` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parties_name_unique` ON `parties` (`name`);--> statement-breakpoint
CREATE TABLE `party_name_histories` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`party_id` text NOT NULL,
	`name` text NOT NULL,
	`effective_from` integer NOT NULL,
	`effective_to` integer,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chk_effective_period" CHECK("party_name_histories"."effective_to" IS NULL OR "party_name_histories"."effective_from" <= "party_name_histories"."effective_to")
);
--> statement-breakpoint
CREATE INDEX `idx_party_names_lookup` ON `party_name_histories` (`party_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uk_party_name_period` ON `party_name_histories` (`party_id`,`effective_from`,`effective_to`);
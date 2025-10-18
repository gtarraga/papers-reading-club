CREATE TABLE `papers_cycle_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cycle_id` integer NOT NULL,
	`winning_submission_id` integer,
	`total_votes` integer NOT NULL,
	`elimination_rounds` text,
	`calculated_at` integer NOT NULL,
	FOREIGN KEY (`cycle_id`) REFERENCES `papers_cycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winning_submission_id`) REFERENCES `papers_submissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `papers_cycle_results_cycle_id_unique` ON `papers_cycle_results` (`cycle_id`);--> statement-breakpoint
CREATE TABLE `papers_cycles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`cycle_number` integer NOT NULL,
	`submission_start` integer NOT NULL,
	`submission_end` integer NOT NULL,
	`voting_start` integer NOT NULL,
	`voting_end` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `papers_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `papers_cycles_group_id_cycle_number_unique` ON `papers_cycles` (`group_id`,`cycle_number`);--> statement-breakpoint
CREATE TABLE `papers_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`cadence_days` integer NOT NULL,
	`submission_days` integer NOT NULL,
	`voting_days` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `papers_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`token` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`registered_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `papers_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `papers_participants_group_id_token_unique` ON `papers_participants` (`group_id`,`token`);--> statement-breakpoint
CREATE TABLE `papers_ranking_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`min_papers` integer NOT NULL,
	`max_papers` integer,
	`required_rankings` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `papers_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `papers_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cycle_id` integer NOT NULL,
	`participant_id` integer NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`publication_date` integer,
	`recommendation` text,
	`submitted_at` integer NOT NULL,
	FOREIGN KEY (`cycle_id`) REFERENCES `papers_cycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `papers_participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `papers_token_patterns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`pattern` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `papers_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `papers_vote_rankings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vote_id` integer NOT NULL,
	`submission_id` integer NOT NULL,
	`rank` integer NOT NULL,
	FOREIGN KEY (`vote_id`) REFERENCES `papers_votes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submission_id`) REFERENCES `papers_submissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `papers_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cycle_id` integer NOT NULL,
	`participant_id` integer NOT NULL,
	`voted_at` integer NOT NULL,
	FOREIGN KEY (`cycle_id`) REFERENCES `papers_cycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `papers_participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `papers_votes_cycle_id_participant_id_unique` ON `papers_votes` (`cycle_id`,`participant_id`);
CREATE TABLE `metadata` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ctn_command` text,
	`ctn_createdat` text,
	`ctn_id` text,
	`ctn_names` text,
	`ctn_size` text,
	`ctn_state` text,
	`ctn_status` text,
	`update_id` integer NOT NULL,
	FOREIGN KEY (`update_id`) REFERENCES `updates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hostname` text NOT NULL,
	`status` text,
	`provider` text,
	`image` text NOT NULL,
	`hub_link` text,
	`mime_type` text,
	`digest` text,
	`created` text,
	`platform` text
);

CREATE TABLE `blog_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`type` text DEFAULT '生活' NOT NULL,
	`date` text NOT NULL,
	`read_time` text DEFAULT '5 分钟' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`markdown` text DEFAULT '' NOT NULL,
	`accent` text DEFAULT 'sapphire' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);
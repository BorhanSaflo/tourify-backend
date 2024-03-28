CREATE TABLE `saved_destination` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`destination_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`destination_id`) REFERENCES `destination`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

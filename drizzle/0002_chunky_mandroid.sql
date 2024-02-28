ALTER TABLE rating ADD `timestamp` integer DEFAULT CURRENT_DATE NOT NULL;--> statement-breakpoint
ALTER TABLE review ADD `timestamp` integer DEFAULT CURRENT_DATE NOT NULL;
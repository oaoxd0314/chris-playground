CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

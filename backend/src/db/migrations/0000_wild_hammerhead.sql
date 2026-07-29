CREATE TYPE "public"."car_categories" AS ENUM('SUV', 'HATCHBACK', 'SEDAN', 'CONVERTIBLE', 'COUPE', 'WAGON', 'VAN', 'JEEP', 'MUV');--> statement-breakpoint
CREATE TABLE "user_refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "user_refresh_tokens_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"user_contact" text,
	"city" text NOT NULL,
	"pin_code" text NOT NULL,
	"state" text NOT NULL,
	"house_number" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"car_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_model" text NOT NULL,
	"car_make" text NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"car_category" "car_categories" NOT NULL,
	"year_of_manufacturing" integer,
	CONSTRAINT "price_check" CHECK ("cars"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"car_id" uuid NOT NULL,
	"amount_paid" numeric(10, 2) NOT NULL,
	"date_of_purchase" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_refresh_tokens" ADD CONSTRAINT "user_refresh_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_car_id_cars_car_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("car_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_refresh_token_expires_at" ON "user_refresh_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "user_refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_order_user" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_order_car" ON "orders" USING btree ("car_id");
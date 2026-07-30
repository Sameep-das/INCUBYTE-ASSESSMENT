CREATE INDEX "car_model_index" ON "cars" USING btree ("car_model");--> statement-breakpoint
CREATE INDEX "car_make_index" ON "cars" USING btree ("car_make");--> statement-breakpoint
CREATE INDEX "car_category_index" ON "cars" USING btree ("car_category");--> statement-breakpoint
CREATE INDEX "car_year_index" ON "cars" USING btree ("year_of_manufacturing");--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_car_model_unique" UNIQUE("car_model");
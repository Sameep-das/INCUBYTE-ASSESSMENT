import {config} from "dotenv";
import {expand} from "dotenv-expand";
import {z} from "zod";

expand(config());

const envSchema = z.object({
    PORT: z.coerce.number().min(1).max(65535).default(2121),
    DATABASE_URL: z.string().min(1),
    FRONTEND_URL: z.url().min(1),
    JWT_SECRET_ACCESS_TOKEN: z.string().min(32),
    JWT_SECRET_REFRESH_TOKEN: z.string().min(32),
});


const environmentVar = envSchema.safeParse(process.env);

if (!environmentVar.success) {
    console.error("Invalid Environment Variables", environmentVar.error.issues);
    process.exit(1);
}
const env = environmentVar.data;
export default env;

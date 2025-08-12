import { z } from "zod";

const envSchema = z.object({
  VIDA_BASE_URL: z.string().url(),
  VIDA_PARTNERS_ENDPOINT: z.string(),
  VIDA_AUTH_TYPE: z.enum(["basic", "bearer"]).default("basic"),
  VIDA_USERNAME: z.string().optional(),
  VIDA_PASSWORD: z.string().optional(),
  VIDA_BEARER_TOKEN: z.string().optional(),
  VIDA_PAGE_PARAM: z.string().default("page"),
  VIDA_SIZE_PARAM: z.string().default("per_page"),
  VIDA_PAGE_START: z.string().default("1"),
  VIDA_PAGE_SIZE: z.string().default("100"),
  PORT: z.string().default("4000"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().default("file:./data.db"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}
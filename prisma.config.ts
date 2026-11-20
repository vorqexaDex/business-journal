import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma's CLI doesn't read .env.local on its own, so load it explicitly.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

import { config } from "dotenv";
import { definePrismaConfig } from "prisma/config";

// Load Neon connection strings (DATABASE_URL, DATABASE_URL_UNPOOLED) pulled by `neon init`.
// `.env.local` takes precedence; `.env` is a fallback if present.
config({ path: [".env.local", ".env"], quiet: true });

export default definePrismaConfig({
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});

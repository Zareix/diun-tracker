import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		PORT: z
			.string()
			.default("3000")
			.transform((val) => Number.parseInt(val, 10)),
		DATABASE_URL: z.string(),
		GH_TOKEN: z.string().optional(),
		GH_REPO: z.string().optional(),
	},
	runtimeEnv: {
		PORT: process.env["PORT"],
		DATABASE_URL: process.env["DATABASE_URL"],
		GH_TOKEN: process.env["GH_TOKEN"],
		GH_REPO: process.env["GH_REPO"],
	},
});

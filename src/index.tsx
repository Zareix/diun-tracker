import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import DashboardPage from "~/ui/dashboard";
import { db } from "./db";
import { type UpdatesRow, tableMetadata, tableUpdates } from "./db/schema";
import { env } from "./env";
import type { DiunWebhookBody } from "./types";

const app = new Hono();

app
	.get("/api/updates", async (c) => {
		const filter = c.req.query("filter");
		const allUpdates = await db.query.tableUpdates.findMany({
			with: {
				metadata: true,
			},
			where: filter === "pending" || filter === "done" ? eq(tableUpdates.status, filter) : undefined,
		});
		return c.json(allUpdates);
	})
	.post("/api/updates", async (c) => {
		const {
			hostname,
			provider,
			image,
			hub_link,
			mime_type,
			digest,
			created,
			platform,
			metadata: {
				ctn_command,
				ctn_createdat,
				ctn_id,
				ctn_names,
				ctn_size,
				ctn_state,
				ctn_status,
			},
		} = await c.req.json<DiunWebhookBody>();

		const update: UpdatesRow = await db.transaction(async (trx) => {
			const [{updates: currentUpdate}] = await trx
				.select()
				.from(tableUpdates)
				.leftJoin(tableMetadata,eq(tableMetadata.updateId, tableUpdates.id))
				.where(
					and(
						eq(tableUpdates.hostname, hostname), 
						eq(tableUpdates.status, "pending"),
						eq(tableMetadata.ctnNames, ctn_names),
					))
				.orderBy(desc(tableUpdates.id))
				.limit(1)
			if (currentUpdate) {
				return currentUpdate
			}
			const [insertedUpdate] = await trx
				.insert(tableUpdates)
				.values({
					hostname,
					status: "pending",
					provider,
					image,
					hubLink: hub_link,
					mimeType: mime_type,
					digest,
					created: new Date(created).toISOString(),
					platform,
				})
				.returning();

			await trx
				.insert(tableMetadata)
				.values({
					ctnCommand: ctn_command,
					ctnCreatedAt: ctn_createdat,
					ctnId: ctn_id,
					ctnNames: ctn_names,
					ctnSize: ctn_size,
					ctnState: ctn_state,
					ctnStatus: ctn_status,
					updateId: insertedUpdate.id,
				})
				.returning();

			return insertedUpdate;
		});
		return c.json({
			id: update.id,
		});
	})
	.patch("/api/updates", async (c) => {
		await db
			.update(tableUpdates)
			.set({
				status: "done",
				doneAt: new Date().toISOString(),
			})
			.where(eq(tableUpdates.status, "pending"));

		return c.json({
			status: "ok",
		});
	})
	.get("/dashboard", async (c) => {
		const showAll = c.req.query("showAll") === "true";
		const allUpdates = await db.query.tableUpdates.findMany({
			with: {
				metadata: true,
			},
			orderBy: [desc(tableUpdates.id)],
			where: showAll ? undefined : eq(tableUpdates.status, "pending"),
		});
		return c.html(<DashboardPage updates={allUpdates} showAll={showAll} />);
	})
	.post("/dashboard", async (c) => {
		const showAll = c.req.query("showAll") === "true";
		const id = c.req.query("id");
		if (id) {
			await db
				.update(tableUpdates)
				.set({
					status: "done",
					doneAt: new Date().toISOString(),
				})
				.where(eq(tableUpdates.id, Number.parseInt(id)));
		} else {
			const hostname = c.req.query("hostname");
			if (!hostname) {
				c.status(400);
				return c.json({
					message: "Missing hostname",
				});
			}
			await db
				.update(tableUpdates)
				.set({
					status: "done",
					doneAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(tableUpdates.hostname, hostname),
						eq(tableUpdates.status, "pending"),
					),
				);
		}
		const allUpdates = await db.query.tableUpdates.findMany({
			with: {
				metadata: true,
			},
			orderBy: [desc(tableUpdates.id)],
			where: showAll ? undefined : eq(tableUpdates.status, "pending"),
		});
		return c.html(<DashboardPage updates={allUpdates} showAll={showAll} />);
	});

export default {
	port: env.PORT,
	fetch: app.fetch,
};

import { and, desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "~/db";
import { type UpdatesRow, tableMetadata, tableUpdates } from "~/db/schema";
import { env } from "~/env";
import * as github from "~/lib/github";
import type { DiunWebhookBody, PullRequest } from "~/types";
import DashboardPage from "~/ui/dashboard";

const app = new Hono();

app
	.get("/api/updates", async (c) => {
		console.log("GET /api/updates");

		const filter = c.req.query("filter");
		const allUpdates = await db.query.tableUpdates.findMany({
			with: {
				metadata: true,
			},
			where:
				filter === "pending" || filter === "done"
					? eq(tableUpdates.status, filter)
					: undefined,
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
		console.log(
			`POST /api/updates | hostname=${hostname} container=${ctn_names}`,
		);

		const update: UpdatesRow = await db.transaction(async (trx) => {
			const currentUpdate = await trx
				.select()
				.from(tableUpdates)
				.leftJoin(tableMetadata, eq(tableMetadata.updateId, tableUpdates.id))
				.where(
					and(
						eq(tableUpdates.hostname, hostname),
						eq(tableUpdates.status, "pending"),
						eq(tableMetadata.ctnNames, ctn_names),
					),
				)
				.orderBy(desc(tableUpdates.id))
				.limit(1);
			if (currentUpdate.length > 0 && !!currentUpdate[0]) {
				return currentUpdate[0].updates;
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
		const { containerNames } = await c.req.json<{ containerNames: string[] }>();
		console.log(
			`PATCH /api/updates | containerNames=[${containerNames.join(",")}]`,
		);

		// TODO check also hostname
		if (!containerNames || containerNames.length === 0) {
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
		}

		const matchingUpdates = await db.query.tableMetadata.findMany({
			where: inArray(tableMetadata.ctnNames, containerNames),
		});
		if (matchingUpdates.length === 0) {
			c.status(404);
			return c.json({
				message: "No updates found for container_name",
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
					inArray(
						tableUpdates.id,
						matchingUpdates.map((u) => u.updateId),
					),
				),
			);
		return c.json({
			status: "ok",
		});
	})
	.get("/dashboard", async (c) => {
		console.log("GET /dashboard");

		const showAll = c.req.query("showAll") === "true";
		const allUpdates = await db.query.tableUpdates.findMany({
			with: {
				metadata: true,
			},
			orderBy: [desc(tableUpdates.id)],
			where: showAll ? undefined : eq(tableUpdates.status, "pending"),
		});
		const pullRequests = await github.getPullRequests();
		return c.html(
			<DashboardPage
				updates={allUpdates}
				showAll={showAll}
				pullRequests={pullRequests}
			/>,
		);
	})
	.post("/dashboard", async (c) => {
		console.log("POST /dashboard");

		const showAll = c.req.query("showAll") === "true";
		const id = c.req.query("id");
		const prId = c.req.query("pr");
		const hostname = c.req.query("hostname");

		if (id) {
			await db
				.update(tableUpdates)
				.set({
					status: "done",
					doneAt: new Date().toISOString(),
				})
				.where(eq(tableUpdates.id, Number.parseInt(id)));
		} else if (prId) {
			await github.mergePullRequest(prId);
		} else if (hostname) {
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
		const pullRequests = await github.getPullRequests();
		return c.html(
			<DashboardPage
				updates={allUpdates}
				showAll={showAll}
				pullRequests={pullRequests}
			/>,
		);
	});

export default {
	port: env.PORT,
	fetch: app.fetch,
};

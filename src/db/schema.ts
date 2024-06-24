import { type InferSelectModel, relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tableUpdates = sqliteTable("updates", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	hostname: text("hostname").notNull(),
	status: text("status", { enum: ["pending", "done"] }),
	doneAt: text("done_at"),
	provider: text("provider"),
	image: text("image").notNull(),
	hubLink: text("hub_link"),
	mimeType: text("mime_type"),
	digest: text("digest"),
	created: text("created"),
	platform: text("platform"),
});

export const tableMetadata = sqliteTable("metadata", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	ctnCommand: text("ctn_command"),
	ctnCreatedAt: text("ctn_createdat"),
	ctnId: text("ctn_id"),
	ctnNames: text("ctn_names"),
	ctnSize: text("ctn_size"),
	ctnState: text("ctn_state"),
	ctnStatus: text("ctn_status"),
	updateId: integer("update_id")
		.notNull()
		.references(() => tableUpdates.id),
});

export const updatesRelations = relations(tableUpdates, ({ one }) => ({
	metadata: one(tableMetadata, {
		fields: [tableUpdates.id],
		references: [tableMetadata.updateId],
		relationName: "updateId",
	}),
}));

export type UpdatesRow = InferSelectModel<typeof tableUpdates>;
export type MetadataRow = InferSelectModel<typeof tableMetadata>;

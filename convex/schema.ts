import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  workspaces: defineTable({
    title: v.string(),
    createdBy: v.id("users"),
    lastModified: v.number(),
  })
    .index("by_creator", ["createdBy"]),

  documents: defineTable({
    title: v.string(),
    isPublic: v.boolean(),
    createdBy: v.id("users"),
    workspaceId: v.id("workspaces"),
    lastModified: v.number(),
    content: v.optional(v.any()), // Add this for ProseMirror content
  })
    .index("by_creator", ["createdBy"])
    .index("by_public", ["isPublic"])
    .index("by_workspace", ["workspaceId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["isPublic", "createdBy", "workspaceId"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

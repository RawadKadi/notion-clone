import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createDocument = mutation({
  args: {
    title: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("documents", {
      title: args.title,
      isPublic: args.isPublic,
      createdBy: userId,
      lastModified: Date.now(),
    });
  },
});

export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== userId) {
      throw new Error("Not authorized to edit this document");
    }

    const updates: any = { lastModified: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteDocument = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== userId) {
      throw new Error("Not authorized to delete this document");
    }

    await ctx.db.delete(args.id);
  },
});

export const getDocument = query({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const document = await ctx.db.get(args.id);
    
    if (!document) {
      return null;
    }

    // Check if user can access this document
    if (!document.isPublic && document.createdBy !== userId) {
      return null;
    }

    return document;
  },
});

export const listDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get user's own documents
    const ownDocuments = await ctx.db
      .query("documents")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    // Get public documents from other users
    const publicDocuments = await ctx.db
      .query("documents")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .filter((q) => q.neq(q.field("createdBy"), userId))
      .collect();

    return [...ownDocuments, ...publicDocuments].sort((a, b) => b.lastModified - a.lastModified);
  },
});

export const searchDocuments = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    if (!args.searchTerm.trim()) {
      return [];
    }

    // Search in user's own documents
    const ownResults = await ctx.db
      .query("documents")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm).eq("createdBy", userId)
      )
      .collect();

    // Search in public documents
    const publicResults = await ctx.db
      .query("documents")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm).eq("isPublic", true)
      )
      .filter((q) => q.neq(q.field("createdBy"), userId))
      .collect();

    return [...ownResults, ...publicResults].sort((a, b) => b.lastModified - a.lastModified);
  },
});

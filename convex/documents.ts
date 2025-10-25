import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createDocument = mutation({
  args: {
    title: v.string(),
    isPublic: v.boolean(),
    workspaceId: v.id("workspaces"), // Add workspaceId parameter
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user owns the workspace
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.createdBy !== userId) {
      throw new Error("Not authorized to create document in this workspace");
    }

    return await ctx.db.insert("documents", {
      title: args.title,
      isPublic: args.isPublic,
      createdBy: userId,
      workspaceId: args.workspaceId, // Add workspace reference
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
  args: {
    workspaceId: v.optional(v.id("workspaces")), // Make it optional
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let ownDocumentsQuery = ctx.db
      .query("documents")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId));

    // Filter by workspace if provided
    if (args.workspaceId) {
      ownDocumentsQuery = ownDocumentsQuery.filter((q) => 
        q.eq(q.field("workspaceId"), args.workspaceId)
      );
    }

    const ownDocuments = await ownDocumentsQuery.collect();

    // Get public documents from other users (optionally filtered by workspace)
    let publicDocumentsQuery = ctx.db
      .query("documents")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .filter((q) => q.neq(q.field("createdBy"), userId));

    if (args.workspaceId) {
      publicDocumentsQuery = publicDocumentsQuery.filter((q) => 
        q.eq(q.field("workspaceId"), args.workspaceId)
      );
    }

    const publicDocuments = await publicDocumentsQuery.collect();

    return [...ownDocuments, ...publicDocuments].sort((a, b) => b.lastModified - a.lastModified);
  },
});

export const searchDocuments = query({
  args: {
    searchTerm: v.string(),
    workspaceId: v.optional(v.id("workspaces")), // Add workspace filter
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    if (!args.searchTerm.trim()) {
      return [];
    }

    // Build base query for own documents
    let ownResultsQuery = ctx.db
      .query("documents")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm).eq("createdBy", userId)
      );

    // Apply workspace filter if provided
    if (args.workspaceId) {
      ownResultsQuery = ownResultsQuery.filter((q) => 
        q.eq(q.field("workspaceId"), args.workspaceId)
      );
    }

    const ownResults = await ownResultsQuery.collect();

    // Build base query for public documents
    let publicResultsQuery = ctx.db
      .query("documents")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm).eq("isPublic", true)
      )
      .filter((q) => q.neq(q.field("createdBy"), userId));

    // Apply workspace filter if provided
    if (args.workspaceId) {
      publicResultsQuery = publicResultsQuery.filter((q) => 
        q.eq(q.field("workspaceId"), args.workspaceId)
      );
    }

    const publicResults = await publicResultsQuery.collect();

    return [...ownResults, ...publicResults].sort((a, b) => b.lastModified - a.lastModified);
  },
});

export const createWorkspace = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("workspaces", {
      title: args.title,
      createdBy: userId,
      lastModified: Date.now(),
    });
  },
});

export const listWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("workspaces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();
  },
});

export const getWorkspace = query({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const workspace = await ctx.db.get(args.id);
    
    if (!workspace) {
      return null;
    }

    if (workspace.createdBy !== userId) {
      return null;
    }

    return workspace;
  },
});

export const updateWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const workspace = await ctx.db.get(args.id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.createdBy !== userId) {
      throw new Error("Not authorized to edit this workspace");
    }

    const updates: any = { lastModified: Date.now() };
    if (args.title !== undefined) updates.title = args.title;

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const workspace = await ctx.db.get(args.id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.createdBy !== userId) {
      throw new Error("Not authorized to delete this workspace");
    }

    // Delete all documents in this workspace first
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.id))
      .collect();

    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const getDocumentsByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify user owns the workspace
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.createdBy !== userId) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const adminDeleteDocument = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    // No authentication check - use carefully!
    await ctx.db.delete(args.id);
  },
});

// Add this mutation to save document content
export const updateDocumentContent = mutation({
  args: {
    id: v.id("documents"),
    content: v.any(), // Store the ProseMirror JSON content
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document not found");
    if (document.createdBy !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, {
      content: args.content,
      lastModified: Date.now(),
    });
  },
});

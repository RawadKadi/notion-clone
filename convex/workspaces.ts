import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      console.log('listWorkspaces called with userId:', userId);
      if (!userId) return [];
      
      const workspaces = await ctx.db.query("workspaces")
        .filter(q => q.eq(q.field("createdBy"), userId))
        .collect();
      
      console.log('Found workspaces:', workspaces);
      return workspaces;
    } catch (error) {
      console.error('Error in listWorkspaces:', error);
      throw error;
    }
  },
});

// Add this function to your workspaces.ts file
export const createWorkspace = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.db.insert("workspaces", {
      title: args.title,
      createdBy: userId,
      lastModified: Date.now(),
    });
  },
});

// Add other workspace functions here...

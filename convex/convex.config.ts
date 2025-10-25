import { defineApp } from "convex/server";
import prosemirrorSync from "@convex-dev/prosemirror-sync/convex.config";
import presence from "@convex-dev/presence/convex.config";

const app = defineApp();
app.use(prosemirrorSync);
app.use(presence);

// Remove the addFunctions call - functions are automatically exported
// based on their file structure and naming

export default app;

import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface ProseMirrorEditorProps {
  documentId: Id<"documents">;
}

export function ProseMirrorEditor({ documentId }: ProseMirrorEditorProps) {
  const sync = useBlockNoteSync<BlockNoteEditor>(api.prosemirror, documentId);

  if (sync.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!sync.editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">This document doesn't exist yet.</p>
          <button
            onClick={() => sync.create({ type: "doc", content: [] })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <BlockNoteView 
        editor={sync.editor} 
        theme="light"
        className="flex-1"
      />
    </div>
  );
}

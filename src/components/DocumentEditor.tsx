import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProseMirrorEditor } from "./ProseMirrorEditor";
import { Presence } from "./Presence";
import { Edit3, Globe, Lock, Trash2, Save, Share2, Copy } from "lucide-react";
import { toast } from "sonner";

interface DocumentEditorProps {
  documentId: Id<"documents">;
  onClose: () => void;
}

export function DocumentEditor({ documentId, onClose }: DocumentEditorProps) {
  const document = useQuery(api.documents.getDocument, { id: documentId });
  const updateDocument = useMutation(api.documents.updateDocument);
  const deleteDocument = useMutation(api.documents.deleteDocument);

  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document?.title) {
      setTitle(document.title);
    }
  }, [document?.title]);

  const handleSaveTitle = async () => {
    if (!document || title.trim() === document.title) {
      setIsEditingTitle(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateDocument({
        id: documentId,
        title: title.trim() || "Untitled Document",
      });
      toast.success("Title updated");
    } catch (error) {
      toast.error("Failed to update title");
      setTitle(document.title);
    } finally {
      setIsSaving(false);
      setIsEditingTitle(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!document) return;

    try {
      await updateDocument({
        id: documentId,
        isPublic: !document.isPublic,
      });
      toast.success(
        document.isPublic ? "Document made private" : "Document made public"
      );
    } catch (error) {
      toast.error("Failed to update document visibility");
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    if (
      confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      try {
        await deleteDocument({ id: documentId });
        toast.success("Document deleted");
        onClose();
      } catch (error) {
        toast.error("Failed to delete document");
      }
    }
  };

  const handleShare = async () => {
    if (!document) return;

    const shareUrl = `${window.location.origin}?document=${documentId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: `Check out this document: ${document.title}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled the share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveTitle();
                    } else if (e.key === "Escape") {
                      setTitle(document.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-2xl font-semibold text-gray-900 bg-transparent border-none outline-none flex-1"
                  autoFocus
                  disabled={isSaving}
                />
                {isSaving && (
                  <Save className="h-4 w-4 text-gray-400 animate-spin" />
                )}
              </div>
            ) : (
              <h1
                className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700 flex items-center space-x-2"
                onClick={() => setIsEditingTitle(true)}
              >
                <span>{document.title}</span>
                <Edit3 className="h-4 w-4 text-gray-400" />
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Presence documentId={documentId} />

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>

            {/* Existing Public/Private toggle button */}
            <button
              onClick={handleTogglePublic}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                document.isPublic
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {document.isPublic ? (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Private</span>
                </>
              )}
            </button>

            {/* Existing Delete button */}
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Last modified {new Date(document.lastModified).toLocaleDateString()}{" "}
          at {new Date(document.lastModified).toLocaleTimeString()}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <ProseMirrorEditor documentId={documentId} />
      </div>
    </div>
  );
}

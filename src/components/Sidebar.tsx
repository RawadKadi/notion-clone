import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Globe,
  Lock,
  X,
  Folder,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

interface SidebarProps {
  selectedWorkspaceId: Id<"workspaces"> | null;
  selectedDocumentId: Id<"documents"> | null;
  onSelectWorkspace: (id: Id<"workspaces">) => void;
  onSelectDocument: (id: Id<"documents">) => void;
  onCreateDocument: () => void;
  onCreateWorkspace: () => void;
  setSelectedWorkspaceId: (id: Id<"workspaces"> | null) => void; // Add this
}

export function Sidebar({
  selectedWorkspaceId,
  selectedDocumentId,
  onSelectWorkspace,
  onSelectDocument,
  onCreateDocument,
  onCreateWorkspace,
  setSelectedWorkspaceId,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocIsPublic, setNewDocIsPublic] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState("");
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);

  // Add state for inline editing
  const [creatingDocumentInWorkspace, setCreatingDocumentInWorkspace] =
    useState<Id<"workspaces"> | null>(null);
  const [newDocTitleInline, setNewDocTitleInline] = useState("");

  // Add this state to track which workspaces are expanded
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set()
  );

  // Toggle workspace expansion
  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  };

  // Check if a workspace is expanded
  const isWorkspaceExpanded = (workspaceId: string) =>
    expandedWorkspaces.has(workspaceId);

  const workspaces = useQuery(api.workspaces.listWorkspaces);
  // Change the documents query to get ALL documents, not filtered by workspace
  const documents = useQuery(api.documents.listDocuments, {}); // Remove workspace filter
  const searchResults = useQuery(
    api.documents.searchDocuments,
    searchTerm.trim() && selectedWorkspaceId
      ? { searchTerm: searchTerm.trim(), workspaceId: selectedWorkspaceId }
      : "skip"
  );

  const createDocument = useMutation(api.documents.createDocument);
  const createWorkspace = useMutation(api.workspaces.createWorkspace);

  // displayedDocuments should be all documents, not filtered
  const displayedDocuments = searchTerm.trim() ? searchResults : documents;

  useEffect(() => {
    console.log("Selected workspace ID:", selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  // Auto-expand when a workspace is selected
  useEffect(() => {
    if (selectedWorkspaceId && !isWorkspaceExpanded(selectedWorkspaceId)) {
      toggleWorkspace(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    console.log("All documents:", documents);
    console.log("All workspaces:", workspaces);
    if (documents && workspaces) {
      workspaces.forEach((workspace) => {
        const workspaceDocs = documents.filter(
          (doc) => doc.workspaceId === workspace._id
        );
        console.log(
          `Workspace "${workspace.title}" has ${workspaceDocs.length} documents:`,
          workspaceDocs
        );
      });
    }
  }, [documents, workspaces]);

  // Add debug logging
  useEffect(() => {
    console.log("Creating document in workspace:", creatingDocumentInWorkspace);
    console.log("Expanded workspaces:", Array.from(expandedWorkspaces));
  }, [creatingDocumentInWorkspace, expandedWorkspaces]);

  // Add this debug useEffect to track plus button clicks
  useEffect(() => {
    console.log("Plus button should be working. Current state:");
    console.log("creatingDocumentInWorkspace:", creatingDocumentInWorkspace);
    console.log("expandedWorkspaces:", Array.from(expandedWorkspaces));
  }, [creatingDocumentInWorkspace, expandedWorkspaces]);

  // Also add a simple test button to see if clicks work
  // <button
  //   onClick={() => {
  //     console.log('Test button clicked - basic click is working');
  //     setCreatingDocumentInWorkspace('test-workspace-id' as Id<"workspaces">);
  //   }}
  //   className="p-2 bg-red-500 text-white"
  // >
  //   Test Click
  // </button>

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !selectedWorkspaceId) return;

    try {
      const id = await createDocument({
        title: newDocTitle.trim(),
        isPublic: newDocIsPublic,
        workspaceId: selectedWorkspaceId,
      });
      toast.success("Document created");
      setNewDocTitle("");
      setNewDocIsPublic(false);
      setShowCreateForm(false); // Ensure form closes
      onSelectDocument(id);
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceTitle.trim()) return;

    try {
      const id = await createWorkspace({
        title: newWorkspaceTitle.trim(),
      });
      toast.success("Workspace created");
      setNewWorkspaceTitle("");
      setShowWorkspaceForm(false);
      onSelectWorkspace(id); // Select the newly created workspace
    } catch (error) {
      toast.error("Failed to create workspace");
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        {/* Create Document Button */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        ) : (
          <form onSubmit={handleCreateDocument} className="space-y-3">
            <input
              type="text"
              placeholder="Document title..."
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={newDocIsPublic}
                onChange={(e) => setNewDocIsPublic(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Make public
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!newDocTitle.trim()}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewDocTitle("");
                  setNewDocIsPublic(false);
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Add workspace creation form near the document creation form */}
        {!showWorkspaceForm ? (
          <button
            onClick={() => setShowWorkspaceForm(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium mt-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </button>
        ) : (
          <form onSubmit={handleCreateWorkspace} className="space-y-3 mt-2">
            <input
              type="text"
              placeholder="Workspace name..."
              value={newWorkspaceTitle}
              onChange={(e) => setNewWorkspaceTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!newWorkspaceTitle.trim()}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Create Workspace
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWorkspaceForm(false);
                  setNewWorkspaceTitle("");
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {workspaces === undefined ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-6 text-center">
            <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No workspaces yet</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {workspaces.map((workspace) => {
              const isExpanded = isWorkspaceExpanded(workspace._id);
              // The filtering should happen in the UI, not in the query
              const workspaceDocs =
                displayedDocuments?.filter(
                  (doc) => doc.workspaceId === workspace._id
                ) || [];

              return (
                <div key={workspace._id}>
                  {/* WORKSPACE HEADER - Top level */}
                  <button
                    onClick={() => toggleWorkspace(workspace._id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between hover:bg-gray-100`}
                  >
                    <div className="flex items-center space-x-2">
                      <ChevronRight
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <Folder className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900 text-sm">
                        {workspace.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {workspaceDocs.length}{" "}
                        {workspaceDocs.length === 1 ? "doc" : "docs"}
                      </span>
                      {/* INLINE DOCUMENT CREATION - Add this */}
                      {creatingDocumentInWorkspace === workspace._id ? (
                        <div className="pl-8 mt-1">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!newDocTitleInline.trim()) return;

                              try {
                                const id = await createDocument({
                                  title: newDocTitleInline.trim(),
                                  isPublic: false,
                                  workspaceId: workspace._id,
                                });
                                toast.success("Document created");
                                setNewDocTitleInline("");
                                setCreatingDocumentInWorkspace(null);
                                onSelectDocument(id);
                              } catch (error) {
                                toast.error("Failed to create document");
                              }
                            }}
                            className="flex items-center space-x-2"
                          >
                            <FileText className="h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Document title..."
                              value={newDocTitleInline}
                              onChange={(e) =>
                                setNewDocTitleInline(e.target.value)
                              }
                              className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                              autoFocus
                              onBlur={() => {
                                setCreatingDocumentInWorkspace(null);
                                setNewDocTitleInline("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  setCreatingDocumentInWorkspace(null);
                                  setNewDocTitleInline("");
                                }
                              }}
                            />
                          </form>
                        </div>
                      ) : (
                        // Show plus button when not creating
                        <button
                          onClick={(e) => {
                            // Remove stopPropagation temporarily for testing
                            // e.stopPropagation();

                            console.log(
                              "Plus button clicked for workspace:",
                              workspace._id
                            );

                            if (!isWorkspaceExpanded(workspace._id)) {
                              console.log("Expanding workspace first");
                              toggleWorkspace(workspace._id);
                            }

                            console.log("Setting creating document state");
                            setCreatingDocumentInWorkspace(workspace._id);
                            setNewDocTitleInline("");
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Create document in this workspace"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </button>

                  {/* EXPANDED CONTENT - Indented section */}
                  {isExpanded && (
                    <div className="pl-8"> {/* ← This indentation creates the tree hierarchy */}
                      
                      {/* INLINE FORM - Inside the expanded section */}
                      {creatingDocumentInWorkspace === workspace._id && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newDocTitleInline.trim()) return;

                            try {
                              const id = await createDocument({
                                title: newDocTitleInline.trim(),
                                isPublic: false,
                                workspaceId: workspace._id,
                              });
                              toast.success("Document created");
                              setNewDocTitleInline("");
                              setCreatingDocumentInWorkspace(null);
                              onSelectDocument(id);
                            } catch (error) {
                              toast.error("Failed to create document");
                            }
                          }}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 w-full text-left"
                        >
                          <FileText className="h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Document title..."
                            value={newDocTitleInline}
                            onChange={(e) =>
                              setNewDocTitleInline(e.target.value)
                            }
                            className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none"
                            autoFocus
                            onBlur={() => {
                              setCreatingDocumentInWorkspace(null);
                              setNewDocTitleInline("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setCreatingDocumentInWorkspace(null);
                                setNewDocTitleInline("");
                              }
                            }}
                          />
                        </form>
                      )}

                      {/* DOCUMENTS LIST - Also inside expanded section */}
                      {workspaceDocs.length === 0 &&
                      !creatingDocumentInWorkspace ? (
                        <div className="p-2 text-center">
                          <p className="text-xs text-gray-400">
                            No documents yet
                          </p>
                        </div>
                      ) : (
                        workspaceDocs.map((doc) => (
                          <button
                            key={doc._id}
                            onClick={() => onSelectDocument(doc._id)}
                            className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                              selectedDocumentId === doc._id
                                ? "bg-gray-50 border border-gray-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700 text-sm">
                                {doc.title}
                              </span>
                            </div>
                            {doc.isPublic ? (
                              <Globe className="h-3 w-3极text-green-500" />
                            ) : (
                              <Lock className="h-3 w-3 text-gray-400" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

interface WorkspaceSidebarProps {
  selectedWorkspaceId: Id<"workspaces"> | null;
  selectedDocumentId: Id<"documents"> | null;
  onSelectWorkspace: (id: Id<"workspaces">) => void;
  onSelectDocument: (id: Id<"documents">) => void;
  user: any; // Add user prop
}

export function WorkspaceSidebar({
  selectedWorkspaceId,
  selectedDocumentId,
  onSelectWorkspace,
  onSelectDocument,
  user,
}: WorkspaceSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState("");
  const [showDocForm, setShowDocForm] = useState(false);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);

  const workspaces = useQuery(api.workspaces.listWorkspaces);
  const documents = useQuery(
    api.documents.listDocuments,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );

  const createDocument = useMutation(api.documents.createDocument);
  const createWorkspace = useMutation(api.workspaces.createWorkspace);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !selectedWorkspaceId) return;

    try {
      const id = await createDocument({
        title: newDocTitle.trim(),
        isPublic: false,
        workspaceId: selectedWorkspaceId,
      });
      toast.success("Document created");
      setNewDocTitle("");
      setShowDocForm(false);
      setShowCreateMenu(false);
      onSelectDocument(id);
    } catch (error) {
      toast.error("Failed to create document");
    }
  };

  useEffect(() => {
    console.log("Workspaces query status:", workspaces);
    console.log("Documents query status:", documents);
  }, [workspaces, documents]);

  useEffect(() => {
    console.log("Selected workspace:", selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  // Add this useEffect to debug the workspace query specifically
  useEffect(() => {
    console.log("Workspaces query result:", workspaces);
    if (workspaces === undefined) {
      console.log("Workspaces query is still loading...");
    } else if (workspaces === null) {
      console.log("Workspaces query returned null - likely auth issue");
    } else {
      console.log("Number of workspaces:", workspaces.length);
    }
  }, [workspaces]);

  // Add this to see if the query is even being called
  useEffect(() => {
    console.log("Workspace query initiated with userId:", user?._id);
  }, [user]);

  // Also check if there are any Convex errors
  useEffect(() => {
    if (workspaces === undefined) {
      console.log("Workspaces query is in loading state (undefined)");
    } else if (workspaces === null) {
      console.log(
        "Workspaces query returned null - check function implementation"
      );
    } else {
      console.log("Workspaces loaded successfully:", workspaces);
    }
  }, [workspaces]);

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Workspace sidebar implementation would go here */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Workspaces</h2>
        {/* Add workspace list and creation UI here */}
        {/* Add a create workspace button */}
        <button
          onClick={() => createWorkspace({ title: "My Workspace" })}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Workspace
        </button>
      </div>
    </div>
  );
}

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Search, Plus, FileText, Globe, Lock, X } from "lucide-react";
import { toast } from "sonner";

interface SidebarProps {
  selectedDocumentId: Id<"documents"> | null;
  onSelectDocument: (id: Id<"documents">) => void;
  onCreateDocument: () => void;
}

export function Sidebar({ selectedDocumentId, onSelectDocument, onCreateDocument }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocIsPublic, setNewDocIsPublic] = useState(false);

  const documents = useQuery(api.documents.listDocuments);
  const searchResults = useQuery(
    api.documents.searchDocuments,
    searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
  );
  const createDocument = useMutation(api.documents.createDocument);

  const displayedDocuments = searchTerm.trim() ? searchResults : documents;

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    try {
      const id = await createDocument({
        title: newDocTitle.trim(),
        isPublic: newDocIsPublic,
      });
      toast.success("Document created");
      setNewDocTitle("");
      setNewDocIsPublic(false);
      setShowCreateForm(false);
      onSelectDocument(id);
      onCreateDocument();
    } catch (error) {
      toast.error("Failed to create document");
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
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {displayedDocuments === undefined ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : displayedDocuments.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm.trim() ? "No documents found" : "No documents yet"}
            </p>
            {searchTerm.trim() && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {displayedDocuments.map((doc) => (
              <button
                key={doc._id}
                onClick={() => onSelectDocument(doc._id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedDocumentId === doc._id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(doc.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0" title={doc.isPublic ? "Public" : "Private"}>
                    {doc.isPublic ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

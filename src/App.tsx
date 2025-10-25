import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { DocumentEditor } from "./components/DocumentEditor";
import { Sidebar } from "./components/Sidebar";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import { FileText } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster />
      <Content />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [selectedDocumentId, setSelectedDocumentId] = useState<Id<"documents"> | null>(null);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <div className="flex items-center justify-center w-full">
          <div className="w-full max-w-md mx-auto p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome</h1>
              <p className="text-gray-600">Sign in to start collaborating on documents</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="flex w-full h-screen">
          <Sidebar
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={setSelectedDocumentId}
            onCreateDocument={() => {}}
          />
          
          {selectedDocumentId ? (
            <DocumentEditor
              documentId={selectedDocumentId}
              onClose={() => setSelectedDocumentId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center max-w-md">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Welcome to your workspace
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a document from the sidebar to start editing, or create a new one to begin collaborating.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <span>Signed in as {loggedInUser?.name || loggedInUser?.email}</span>
                  <SignOutButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </Authenticated>
    </>
  );
}

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";

interface PresenceProps {
  documentId: Id<"documents">;
}

export function Presence({ documentId }: PresenceProps) {
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const userId = useQuery(api.presence.getUserId);
  const presenceList = useQuery(api.presence.list, { roomToken: documentId });
  const heartbeat = useMutation(api.presence.heartbeat);
  const disconnect = useMutation(api.presence.disconnect);

  // Send heartbeat every 5 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      heartbeat({
        roomId: documentId,
        userId,
        sessionId,
        interval: 10000, // 10 second timeout
      }).catch(console.error);
    }, 5000);

    // Send initial heartbeat
    heartbeat({
      roomId: documentId,
      userId,
      sessionId,
      interval: 10000,
    }).catch(console.error);

    return () => {
      clearInterval(interval);
      disconnect({ sessionToken: sessionId }).catch(console.error);
    };
  }, [userId, documentId, sessionId, heartbeat, disconnect]);

  if (!presenceList || presenceList.length === 0) {
    return null;
  }

  // Filter out current user and get unique users
  const otherUsers = presenceList
    .filter(entry => entry.userId !== userId)
    .reduce((acc, entry) => {
      if (!acc.find(u => u.userId === entry.userId)) {
        acc.push(entry);
      }
      return acc;
    }, [] as typeof presenceList);

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.userId}
            className="relative"
            title={('name' in user ? user.name : null) || "Anonymous"}
          >
            {('image' in user && user.image) ? (
              <img
                src={user.image}
                alt={('name' in user ? user.name : null) || "Anonymous"}
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                {(('name' in user ? user.name : null) || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
        ))}
        {otherUsers.length > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
            +{otherUsers.length - 3}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-500">
        {otherUsers.length === 1 ? "1 person" : `${otherUsers.length} people`} editing
      </span>
    </div>
  );
}

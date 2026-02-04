import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";

export const Watchers = ({ watchers = [] }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200 mb-6">
      <h3 className="text-lg font-medium mb-4 text-surface-900">Watchers</h3>
      <div className="space-y-2">
        {watchers && watchers.length > 0 ? (
          watchers.map((watcher) => (
            <div key={watcher._id} className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={watcher.profilePicture} />
                <AvatarFallback className="text-xs">
                  {watcher.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-surface-600">{watcher.name}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-surface-500">No watchers</p>
        )}
      </div>
    </div>
  );
};
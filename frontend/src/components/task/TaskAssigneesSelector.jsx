import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";

export const TaskAssigneesSelector = ({
  issue,
  assignees = [],
  projectMembers = [],
  onUpdate
}) => {
  const [selectedIds, setSelectedIds] = useState(
    assignees.map((assignee) => assignee._id)
  );
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { addToast } = useToast();

  const handleSelectAll = () => {
    const allIds = projectMembers.map((m) => m.user ? m.user._id : m._id);
    setSelectedIds(allIds);
  };

  const handleUnSelectAll = () => {
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    let newSelected = [];
    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((sid) => sid !== id);
    } else {
      newSelected = [...selectedIds, id];
    }
    setSelectedIds(newSelected);
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      const response = await api.put(`/issues/${issue._id}`, {
        assignees: selectedIds,
      });
      
      setDropDownOpen(false);
      addToast("Assignees updated successfully", { type: "success" });
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      const errMessage =
        error.response?.data?.message || "Failed to update assignees";
      addToast(errMessage, { type: "error" });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-surface-600 mb-2">Assignees</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-surface-500">Unassigned</span>
        ) : (
          projectMembers
            .filter((member) => {
              const userId = member.user ? member.user._id : member._id;
              return selectedIds.includes(userId);
            })
            .map((m) => {
              const user = m.user || m;
              return (
                <div
                  key={user._id}
                  className="flex items-center bg-surface-100 rounded px-2 py-1"
                >
                  <Avatar className="w-6 h-6 mr-1">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-surface-600">{user.name}</span>
                </div>
              );
            })
        )}
      </div>

      {/* dropdown */}
      <div className="relative">
        <button
          className="text-sm text-surface-600 w-full border border-surface-200 rounded px-3 py-2 text-left bg-white hover:bg-surface-50 transition-colors"
          onClick={() => setDropDownOpen(!dropDownOpen)}
        >
          {selectedIds.length === 0
            ? "Select assignees"
            : `${selectedIds.length} selected`}
        </button>

        {dropDownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropDownOpen(false)} />
            <div className="absolute z-20 mt-1 w-full bg-white border border-surface-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="flex justify-between px-2 py-1 border-b border-surface-100">
                <button
                  className="text-xs text-brand-600 hover:text-brand-700"
                  onClick={handleSelectAll}
                >
                  Select all
                </button>
                <button
                  className="text-xs text-red-600 hover:text-red-700"
                  onClick={handleUnSelectAll}
                >
                  Unselect all
                </button>
              </div>

              {projectMembers.map((m) => {
                const user = m.user || m;
                const userId = user._id;
                
                return (
                  <label
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-surface-50"
                    key={userId}
                  >
                    <Checkbox
                      checked={selectedIds.includes(userId)}
                      onCheckedChange={() => handleSelect(userId)}
                      className="mr-2"
                    />
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                  </label>
                );
              })}

              <div className="flex justify-between px-2 py-2 border-t border-surface-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClickCapture={() => setDropDownOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClickCapture={handleSave}
                >
                  {isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
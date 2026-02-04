import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";

export const TaskPrioritySelector = ({
  priority,
  issueId,
  onUpdate
}) => {
  const [isPending, setIsPending] = useState(false);
  const { addToast } = useToast();

  const handlePriorityChange = async (value) => {
    setIsPending(true);
    try {
      const response = await api.put(`/issues/${issueId}`, {
        priority: value
      });
      
      addToast("Priority updated successfully", { type: "success" });
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update priority";
      addToast(errorMessage, { type: "error" });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Select value={priority || ""} onValueChange={handlePriorityChange}>
      <SelectTrigger className="w-[180px]" disabled={isPending}>
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">Low</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="high">High</SelectItem>
        <SelectItem value="urgent">Urgent</SelectItem>
      </SelectContent>
    </Select>
  );
};
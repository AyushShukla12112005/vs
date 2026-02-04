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

export const TaskStatusSelector = ({
  status,
  issueId,
  onUpdate
}) => {
  const [isPending, setIsPending] = useState(false);
  const { addToast } = useToast();

  const handleStatusChange = async (value) => {
    setIsPending(true);
    try {
      const response = await api.put(`/issues/${issueId}`, {
        status: value
      });
      
      addToast("Status updated successfully", { type: "success" });
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update status";
      addToast(errorMessage, { type: "error" });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'open': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  return (
    <Select value={status || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]" disabled={isPending}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="open">To Do</SelectItem>
        <SelectItem value="in-progress">In Progress</SelectItem>
        <SelectItem value="done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
};
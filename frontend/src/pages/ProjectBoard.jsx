import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CreateIssueModal from '../components/CreateIssueModal';
import EditTicketModal from '../components/EditTicketModal';
import InviteModal from '../components/InviteModal';
import { useToast } from '../context/ToastContext';

const columns = [
  { id: 'open', title: 'To Do', icon: '📝', bgColor: 'bg-slate-100', borderColor: 'border-slate-300', headerBg: 'bg-slate-200', textColor: 'text-slate-800' },
  { id: 'in-progress', title: 'In Progress', icon: '⚡', bgColor: 'bg-amber-100', borderColor: 'border-amber-300', headerBg: 'bg-amber-200', textColor: 'text-amber-800' },
  { id: 'done', title: 'Done', icon: '✅', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300', headerBg: 'bg-emerald-200', textColor: 'text-emerald-800' }
];

export default function ProjectBoard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [projectLoading, setProjectLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', assignee: '' });
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchProject = useCallback(() => {
    if (!projectId) return;
    setProjectLoading(true);
    api.get(`/projects/${projectId}`)
      .then(({ data }) => setProject(data))
      .catch(() => setProject(null))
      .finally(() => setProjectLoading(false));
  }, [projectId]);

  const loadIssues = useCallback(() => {
    if (!projectId) return;
    setIssuesLoading(true);
    const params = new URLSearchParams({ project: projectId });
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.assignee) params.set('assignee', filters.assignee);
    if (filters.search?.trim()) params.set('search', filters.search.trim());
    api.get(`/issues?${params}`)
      .then(({ data }) => setIssues(data))
      .catch(console.error)
      .finally(() => setIssuesLoading(false));
  }, [projectId, filters]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = async (result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    
    const issueId = draggableId;
    const newStatus = destination.droppableId;
    const draggedIssue = issues.find(issue => issue._id === issueId);
    if (!draggedIssue) return;

    const updatedIssues = issues.map(issue => issue._id === issueId ? { ...issue, status: newStatus } : issue);
    setIssues(updatedIssues);

    try {
      await api.patch(`/issues/${issueId}`, { status: newStatus });
      addToast(`Issue moved to ${newStatus.replace('-', ' ')}`, { type: 'success' });
    } catch (error) {
      console.error('Failed to update issue status:', error);
      addToast('Failed to move issue', { type: 'error' });
      loadIssues();
    }
  };

  const getIssuesByStatus = (status) => issues.filter(issue => issue.status === status);

  const getPriorityColor = (priority) => {
    const colors = { urgent: 'bg-red-500 text-white', high: 'bg-orange-500 text-white', medium: 'bg-yellow-500 text-white', low: 'bg-green-500 text-white' };
    return colors[priority?.toLowerCase()] || 'bg-gray-500 text-white';
  };

  const getTypeIcon = (type) => {
    const icons = { bug: '🐛', feature: '✨', task: '📋' };
    return icons[type?.toLowerCase()] || '📝';
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading project...</h2>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-8">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/" className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-500 hover:text-blue-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3 text-3xl">📋</span>
              {project.name}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInvite(true)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Invite</span>
            </button>
            <button
              onClick={loadIssues}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateIssue(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Issue</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {columns.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={filters.assignee}
            onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All assignees</option>
            {project.members?.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 ml-2">
            <span className="font-medium text-gray-700">{issues.length}</span> ticket{issues.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="p-6">
        {issuesLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading issues...</p>
            </div>
          </div>
        ) : (
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {columns.map((column) => {
                const columnIssues = getIssuesByStatus(column.id);
                return (
                  <div key={column.id} className={`${column.bgColor} ${column.borderColor} border-2 rounded-lg shadow-sm`}>
                    <div className={`${column.headerBg} ${column.textColor} p-4 rounded-t-lg border-b-2 ${column.borderColor}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center text-lg">
                          <span className="mr-2 text-xl">{column.icon}</span>
                          {column.title}
                        </h3>
                        <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">{columnIssues.length}</span>
                      </div>
                    </div>
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-4 min-h-96 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''}`}
                        >
                          {columnIssues.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                              <div className="text-5xl mb-3">{snapshot.isDraggingOver ? '👆' : '📭'}</div>
                              <p className="text-sm font-medium">{snapshot.isDraggingOver ? 'Drop issue here' : 'No issues yet'}</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {columnIssues.map((issue, index) => (
                                <Draggable key={issue._id} draggableId={issue._id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`bg-zinc-700 text-white rounded-lg shadow-sm hover:scale-105 hover:shadow-lg transition-all duration-200 ${snapshot.isDragging ? 'rotate-1 scale-105 shadow-xl z-50' : ''}`}
                                    >
                                      <div {...provided.dragHandleProps} className="p-4 cursor-grab active:cursor-grabbing">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-lg">{getTypeIcon(issue.type)}</span>
                                            <span className="text-xs text-gray-300 font-mono">#{issue._id?.slice(-6)}</span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingIssue(issue);
                                              setShowEditModal(true);
                                            }}
                                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                            title="Edit issue"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                        </div>
                                        <h4 className="font-medium text-white mb-2 line-clamp-2 leading-tight">{issue.title}</h4>
                                        {issue.description && <p className="text-sm text-gray-300 mb-3 line-clamp-2 leading-relaxed">{issue.description}</p>}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
                                            <span className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded-full">{issue.type}</span>
                                          </div>
                                          {issue.assignee && (
                                            <div className="flex items-center space-x-2">
                                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                {issue.assignee.name?.charAt(0)?.toUpperCase() || '?'}
                                              </div>
                                              <span className="text-xs text-gray-300 max-w-20 truncate">{issue.assignee.name}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {isDragging && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
          <span className="text-sm font-medium">Moving issue...</span>
        </div>
      )}

      {showCreateIssue && (
        <CreateIssueModal
          open={showCreateIssue}
          onClose={() => setShowCreateIssue(false)}
          projectId={projectId}
          projectMembers={project.members || []}
          onCreated={(newIssue) => {
            setIssues(prev => [...prev, newIssue]);
            setShowCreateIssue(false);
            addToast('Issue created successfully', { type: 'success' });
          }}
        />
      )}

      {showEditModal && editingIssue && (
        <EditTicketModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingIssue(null);
          }}
          issue={editingIssue}
          onUpdated={(updatedIssue) => {
            setIssues(prev => prev.map(issue => issue._id === updatedIssue._id ? updatedIssue : issue));
            setShowEditModal(false);
            setEditingIssue(null);
            addToast('Issue updated successfully', { type: 'success' });
          }}
        />
      )}

      {showInvite && (
        <InviteModal
          open={showInvite}
          onClose={() => setShowInvite(false)}
          project={project}
          onInvited={fetchProject}
        />
      )}
    </div>
  );
}

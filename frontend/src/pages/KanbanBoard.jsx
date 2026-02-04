import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import CreateIssueModal from '../components/CreateIssueModal';
import EditTicketModal from '../components/EditTicketModal';

const columns = [
  { id: 'open', title: 'To Do', bgColor: 'bg-slate-100', borderColor: 'border-slate-300', headerBg: 'bg-slate-200', textColor: 'text-slate-800' },
  { id: 'in-progress', title: 'In Progress', bgColor: 'bg-amber-100', borderColor: 'border-amber-300', headerBg: 'bg-amber-200', textColor: 'text-amber-800' },
  { id: 'done', title: 'Done', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300', headerBg: 'bg-emerald-200', textColor: 'text-emerald-800' }
];

export default function KanbanBoard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [issues, setIssues] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', assignee: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadIssues();
    }
  }, [selectedProject, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, usersResponse] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(projectsResponse.data || []);
      setUsers(usersResponse.data || []);
      if (projectsResponse.data && projectsResponse.data.length > 0) {
        setSelectedProject(projectsResponse.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      addToast('Failed to load projects and users', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadIssues = async () => {
    if (!selectedProject) return;
    try {
      const params = new URLSearchParams({ project: selectedProject });
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.assignee) params.set('assignee', filters.assignee);
      if (filters.search?.trim()) params.set('search', filters.search.trim());
      const response = await api.get(`/issues?${params}`);
      setIssues(response.data || []);
    } catch (error) {
      console.error('Failed to load issues:', error);
      addToast('Failed to load issues', { type: 'error' });
      setIssues([]);
    }
  };

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = async (result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    
    const issueId = draggableId;
    const newStatus = destination.droppableId;
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

  const currentProject = projects.find(p => p._id === selectedProject);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Kanban Board</h2>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Found</h2>
          <p className="text-gray-600 mb-8">Create a project first to use the Kanban board.</p>
          <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{currentProject?.name || 'Kanban Board'}</h1>
          <div className="flex items-center space-x-3">
            <button onClick={loadIssues} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
              Refresh
            </button>
            <button onClick={() => setShowCreateModal(true)} className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              + Create Issue
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={filters.assignee}
            onChange={(e) => setFilters(f => ({ ...f, assignee: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All assignees</option>
            {currentProject?.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <span className="text-sm text-gray-500">{issues.length} ticket{issues.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="p-6">
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((column) => {
              const columnIssues = getIssuesByStatus(column.id);
              return (
                <div key={column.id} className={`${column.bgColor} ${column.borderColor} border-2 rounded-lg shadow-sm`}>
                  <div className={`${column.headerBg} ${column.textColor} p-4 rounded-t-lg border-b-2 ${column.borderColor}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{column.title}</h3>
                      <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">{columnIssues.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className={`p-4 min-h-96 max-h-96 overflow-y-auto transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''}`}>
                        {columnIssues.length === 0 ? (
                          <div className="text-center py-16 text-gray-400">
                            <p className="text-sm font-medium">No issues yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {columnIssues.map((issue, index) => (
                              <Draggable key={issue._id} draggableId={issue._id} index={index}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-zinc-700 text-white rounded-lg shadow-sm p-4 cursor-grab ${snapshot.isDragging ? 'shadow-xl rotate-1' : ''}`}>
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="text-xs text-gray-300 font-mono">#{issue._id?.slice(-6)}</span>
                                      <button onClick={(e) => { e.stopPropagation(); setEditingIssue(issue); setShowEditModal(true); }} className="text-xs text-gray-400 hover:text-blue-400">
                                        Edit
                                      </button>
                                    </div>
                                    <h4 className="font-medium text-white mb-2 line-clamp-2">{issue.title}</h4>
                                    {issue.description && <p className="text-sm text-gray-300 mb-2 line-clamp-2">{issue.description}</p>}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
                                        <span className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded-full">{issue.type}</span>
                                      </div>
                                      {issue.assignee && (
                                        <div className="flex items-center space-x-1">
                                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                            {issue.assignee.name?.charAt(0)?.toUpperCase()}
                                          </div>
                                        </div>
                                      )}
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
      </div>

      {showCreateModal && (
        <CreateIssueModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          projectId={selectedProject}
          projectMembers={currentProject?.members || users}
          onCreated={(newIssue) => { setIssues(prev => [...prev, newIssue]); setShowCreateModal(false); addToast('Issue created successfully', { type: 'success' }); }}
        />
      )}

      {showEditModal && editingIssue && (
        <EditTicketModal
          open={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingIssue(null); }}
          issue={editingIssue}
          onUpdated={(updatedIssue) => { setIssues(prev => prev.map(issue => issue._id === updatedIssue._id ? updatedIssue : issue)); setShowEditModal(false); setEditingIssue(null); addToast('Issue updated successfully', { type: 'success' }); }}
        />
      )}
    </div>
  );
}

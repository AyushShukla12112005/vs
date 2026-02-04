import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import BackButton from '../components/BackButton';
import CreateIssueModal from '../components/CreateIssueModal';
import Progress from '../components/ui/Progress';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { TaskAssigneesSelector } from '../components/task/TaskAssigneesSelector';
import { TaskPrioritySelector } from '../components/task/TaskPrioritySelector';
import { TaskStatusSelector } from '../components/task/TaskStatusSelector';
import { Watchers } from '../components/task/Watchers';
import Modal from '../components/Modal';
import { format } from 'date-fns';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateIssue, setIsCreateIssue] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetail, setShowIssueDetail] = useState(false);
  const [taskFilter, setTaskFilter] = useState('All');

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, issuesRes, usersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/issues?projectId=${projectId}`),
        api.get('/users')
      ]);
      
      setProject(projectRes.data);
      setIssues(issuesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      addToast('Failed to load project data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getProjectProgress = () => {
    if (!issues.length) return 0;
    const completedIssues = issues.filter(issue => issue.status === 'done').length;
    return Math.round((completedIssues / issues.length) * 100);
  };

  const handleIssueClick = (issueId) => {
    const issue = issues.find(i => i._id === issueId);
    if (issue) {
      setSelectedIssue(issue);
      setShowIssueDetail(true);
    }
  };

  const handleIssueUpdate = (updatedIssue) => {
    setIssues(prev => prev.map(issue => 
      issue._id === updatedIssue._id ? updatedIssue : issue
    ));
    
    if (selectedIssue && selectedIssue._id === updatedIssue._id) {
      setSelectedIssue(updatedIssue);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      await api.put(`/issues/${issueId}`, { status: newStatus });
      setIssues(prev => prev.map(issue => 
        issue._id === issueId ? { ...issue, status: newStatus } : issue
      ));
      addToast('Issue status updated', { type: 'success' });
    } catch (error) {
      console.error('Failed to update issue status:', error);
      addToast('Failed to update issue status', { type: 'error' });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-500 text-white';
      case 'low':
        return 'bg-slate-500 text-white';
      default:
        return 'bg-surface-500 text-white';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'bug':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'feature':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Project not found</h2>
          <p className="text-surface-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const projectProgress = getProjectProgress();
  const filteredIssues = taskFilter === 'All' 
    ? issues 
    : issues.filter(issue => {
        switch (taskFilter) {
          case 'To Do': return issue.status === 'open';
          case 'In Progress': return issue.status === 'in-progress';
          case 'Done': return issue.status === 'done';
          default: return true;
        }
      });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3 mt-4">
            <h1 className="text-xl md:text-2xl font-bold text-surface-900">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-surface-600 mt-2">{project.description}</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-32">
            <div className="text-sm text-surface-600">Progress:</div>
            <div className="flex-1">
              <Progress value={projectProgress} className="h-2" />
            </div>
            <span className="text-sm text-surface-600">{projectProgress}%</span>
          </div>
          <button
            onClick={() => setIsCreateIssue(true)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Add Issue
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setTaskFilter('All')}>
              All Issues
            </TabsTrigger>
            <TabsTrigger value="todo" onClick={() => setTaskFilter('To Do')}>
              To Do
            </TabsTrigger>
            <TabsTrigger value="in-progress" onClick={() => setTaskFilter('In Progress')}>
              In Progress
            </TabsTrigger>
            <TabsTrigger value="done" onClick={() => setTaskFilter('Done')}>
              Done
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-surface-600">Status:</span>
            <div className="flex gap-2">
              <Badge variant="outline" size="sm">
                {issues.filter(issue => issue.status === 'open').length} To Do
              </Badge>
              <Badge variant="outline" size="sm">
                {issues.filter(issue => issue.status === 'in-progress').length} In Progress
              </Badge>
              <Badge variant="outline" size="sm">
                {issues.filter(issue => issue.status === 'done').length} Done
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <IssueColumn
              title="To Do"
              issues={issues.filter(issue => issue.status === 'open')}
              onIssueClick={handleIssueClick}
              onStatusChange={updateIssueStatus}
            />
            <IssueColumn
              title="In Progress"
              issues={issues.filter(issue => issue.status === 'in-progress')}
              onIssueClick={handleIssueClick}
              onStatusChange={updateIssueStatus}
            />
            <IssueColumn
              title="Done"
              issues={issues.filter(issue => issue.status === 'done')}
              onIssueClick={handleIssueClick}
              onStatusChange={updateIssueStatus}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="todo">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.filter(issue => issue.status === 'open').map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onClick={() => handleIssueClick(issue._id)}
                onStatusChange={updateIssueStatus}
              />
            ))}
            {issues.filter(issue => issue.status === 'open').length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-surface-600">No to-do issues found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.filter(issue => issue.status === 'in-progress').map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onClick={() => handleIssueClick(issue._id)}
                onStatusChange={updateIssueStatus}
              />
            ))}
            {issues.filter(issue => issue.status === 'in-progress').length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-surface-600">No in-progress issues found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="done">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.filter(issue => issue.status === 'done').map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onClick={() => handleIssueClick(issue._id)}
                onStatusChange={updateIssueStatus}
              />
            ))}
            {issues.filter(issue => issue.status === 'done').length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-surface-600">No completed issues found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Issue Modal */}
      <CreateIssueModal
        open={isCreateIssue}
        onClose={() => setIsCreateIssue(false)}
        projectId={projectId}
        onIssueCreated={(newIssue) => {
          setIssues(prev => [...prev, newIssue]);
          setIsCreateIssue(false);
        }}
      />

      {/* Issue Detail Modal */}
      {showIssueDetail && selectedIssue && (
        <Modal
          open={showIssueDetail}
          onClose={() => {
            setShowIssueDetail(false);
            setSelectedIssue(null);
          }}
          title={`Issue Details - ${selectedIssue.title}`}
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
            {/* Issue Header */}
            <div className="border-b border-surface-200 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(selectedIssue.type)}
                  <div>
                    <h2 className="text-xl font-semibold text-surface-900">{selectedIssue.title}</h2>
                    <p className="text-sm text-surface-500">#{selectedIssue._id.slice(-6)}</p>
                  </div>
                </div>
                <Badge className={getPriorityColor(selectedIssue.priority)} size="sm">
                  {selectedIssue.priority || 'Medium'}
                </Badge>
              </div>
              
              {selectedIssue.description && (
                <p className="text-surface-700 leading-relaxed">{selectedIssue.description}</p>
              )}
            </div>

            {/* Issue Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-surface-600 mb-2">Status</h3>
                <TaskStatusSelector
                  status={selectedIssue.status}
                  issueId={selectedIssue._id}
                  onUpdate={handleIssueUpdate}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-surface-600 mb-2">Priority</h3>
                <TaskPrioritySelector
                  priority={selectedIssue.priority}
                  issueId={selectedIssue._id}
                  onUpdate={handleIssueUpdate}
                />
              </div>
            </div>

            {/* Assignees */}
            <TaskAssigneesSelector
              issue={selectedIssue}
              assignees={selectedIssue.assignees || []}
              projectMembers={users.map(user => ({ user }))}
              onUpdate={handleIssueUpdate}
            />

            {/* Watchers */}
            <Watchers watchers={selectedIssue.watchers || []} />

            {/* Issue Metadata */}
            <div className="border-t border-surface-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-surface-500">Created:</span>
                  <span className="ml-2 text-surface-900">
                    {format(new Date(selectedIssue.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-surface-500">Updated:</span>
                  <span className="ml-2 text-surface-900">
                    {format(new Date(selectedIssue.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
                {selectedIssue.dueDate && (
                  <div>
                    <span className="text-surface-500">Due Date:</span>
                    <span className={`ml-2 ${
                      new Date(selectedIssue.dueDate) < new Date() ? 'text-red-500 font-medium' : 'text-surface-900'
                    }`}>
                      {format(new Date(selectedIssue.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                {selectedIssue.assignedTo && (
                  <div>
                    <span className="text-surface-500">Assigned to:</span>
                    <span className="ml-2 text-surface-900">{selectedIssue.assignedTo.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const IssueColumn = ({ title, issues, onIssueClick, onStatusChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-surface-900">{title}</h2>
        <Badge variant="outline" size="sm">
          {issues.length}
        </Badge>
      </div>
      
      <div className="space-y-3 min-h-[200px] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
        {issues.length === 0 ? (
          <div className="text-center text-sm text-surface-500 py-8">
            No issues yet
          </div>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onClick={() => onIssueClick(issue._id)}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

const IssueCard = ({ issue, onClick, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-500 text-white';
      case 'low':
        return 'bg-slate-500 text-white';
      default:
        return 'bg-surface-500 text-white';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'bug':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'feature':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <Badge className={getPriorityColor(issue.priority)} size="sm">
            {issue.priority || 'Medium'}
          </Badge>
          
          <div className="flex gap-1">
            {issue.status !== 'open' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(issue._id, 'open');
                }}
                className="p-1 rounded hover:bg-surface-100 text-surface-600"
                title="Mark as To Do"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            
            {issue.status !== 'in-progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(issue._id, 'in-progress');
                }}
                className="p-1 rounded hover:bg-surface-100 text-surface-600"
                title="Mark as In Progress"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            
            {issue.status !== 'done' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(issue._id, 'done');
                }}
                className="p-1 rounded hover:bg-surface-100 text-surface-600"
                title="Mark as Done"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getTypeIcon(issue.type)}
            <h4 className="font-medium text-surface-900 line-clamp-2">{issue.title}</h4>
          </div>
          
          {issue.description && (
            <p className="text-sm text-surface-600 line-clamp-2">{issue.description}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            {issue.assignedTo && (
              <div className="flex items-center gap-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={issue.assignedTo.profilePicture} />
                  <AvatarFallback className="text-xs">
                    {issue.assignedTo.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-surface-600 text-xs">{issue.assignedTo.name}</span>
              </div>
            )}
          </div>
          
          {issue.dueDate && (
            <div className="text-xs text-surface-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(issue.dueDate), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetails;
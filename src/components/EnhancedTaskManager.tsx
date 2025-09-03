import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock, 
  User, 
  Flag, 
  MessageCircle, 
  Paperclip,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Send,
  Filter,
  Search,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  reporter: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
  dueDate: Date;
  createdDate: Date;
  project: string;
  messages: number;
  attachments: number;
  tags: string[];
  watchers: string[];
  timeTracked: number; // in minutes
  estimatedTime: number; // in minutes
  subtasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  assignee: string;
  priority: string;
  dueDate: Date | undefined;
  project: string;
  tags: string;
  estimatedTime: string;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-brown-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  review: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  blocked: 'bg-red-100 text-red-800 border-red-200'
};

const teamMembers = [
  { id: '1', name: 'Sarah Chen', role: 'Project Manager', avatar: 'SC' },
  { id: '2', name: 'Michael Torres', role: 'Finance Lead', avatar: 'MT' },
  { id: '3', name: 'David Kim', role: 'Technical Lead', avatar: 'DK' },
  { id: '4', name: 'Amara Okafor', role: 'Field Coordinator', avatar: 'AO' },
  { id: '5', name: 'Lisa Zhang', role: 'Data Analyst', avatar: 'LZ' }
];

const projects = [
  'Clean Cooking Kibera',
  'E-Bus Mombasa', 
  'Solar PV Schools',
  'Biogas Digesters',
  'Wind Power Initiative'
];

interface EnhancedTaskManagerProps {
  tasks: Task[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdDate' | 'messages' | 'attachments' | 'subtasks' | 'timeTracked'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function EnhancedTaskManager({ tasks = [], onTaskCreate, onTaskUpdate, onTaskDelete }: EnhancedTaskManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: undefined,
    project: '',
    tags: '',
    estimatedTime: ''
  });

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length
  };

  const handleCreateTask = () => {
    if (!formData.title || !formData.assignee || !formData.dueDate) return;

    const newTask = {
      title: formData.title,
      description: formData.description,
      assignee: formData.assignee,
      reporter: 'Current User', // In real app, get from auth
      priority: formData.priority as Task['priority'],
      status: 'pending' as Task['status'],
      dueDate: formData.dueDate,
      project: formData.project,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      watchers: [],
      estimatedTime: parseInt(formData.estimatedTime) || 0
    };

    onTaskCreate(newTask);
    setIsCreateDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: undefined,
      project: '',
      tags: '',
      estimatedTime: ''
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Flag className="h-3 w-3 text-red-600" />;
      case 'high': return <Flag className="h-3 w-3 text-orange-600" />;
      case 'medium': return <Flag className="h-3 w-3 text-yellow-600" />;
      default: return <Flag className="h-3 w-3 text-blue-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'in_progress': return <Clock className="h-3 w-3" />;
      case 'blocked': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Create Task Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Task description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Assignee *</label>
                      <Select value={formData.assignee} onValueChange={(value) => setFormData({ ...formData, assignee: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map(member => (
                            <SelectItem key={member.id} value={member.name}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                                </Avatar>
                                {member.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Due Date *</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dueDate}
                            onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Project</label>
                      <Select value={formData.project} onValueChange={(value) => setFormData({ ...formData, project: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project} value={project}>{project}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Estimated Time (hours)</label>
                      <Input
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                        placeholder="8"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">{task.title}</h3>
                    <Badge className={priorityColors[task.priority]}>
                      {getPriorityIcon(task.priority)}
                      {task.priority}
                    </Badge>
                    <Badge className={statusColors[task.status]}>
                      {getStatusIcon(task.status)}
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assignee}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(task.dueDate), 'MMM dd')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {task.messages}
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      {task.attachments}
                    </div>
                    {task.project && (
                      <Badge variant="outline" className="text-xs">{task.project}</Badge>
                    )}
                  </div>

                  {task.estimatedTime > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round((task.timeTracked / task.estimatedTime) * 100)}%</span>
                      </div>
                      <Progress value={(task.timeTracked / task.estimatedTime) * 100} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {task.assignee.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-sm">Try adjusting your filters or create a new task.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={priorityColors[selectedTask.priority]}>
                        {getPriorityIcon(selectedTask.priority)}
                        {selectedTask.priority}
                      </Badge>
                      <Badge className={statusColors[selectedTask.status]}>
                        {getStatusIcon(selectedTask.status)}
                        {selectedTask.status.replace('_', ' ')}
                      </Badge>
                      {selectedTask.project && (
                        <Badge variant="outline">{selectedTask.project}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTaskDelete(selectedTask.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">{selectedTask.description || 'No description provided'}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Assignee</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {selectedTask.assignee.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{selectedTask.assignee}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Due Date</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(selectedTask.dueDate), 'PPP')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Created</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(selectedTask.createdDate), 'PPP')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Reporter</span>
                        <span className="text-sm text-muted-foreground">{selectedTask.reporter}</span>
                      </div>

                      {selectedTask.estimatedTime > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Time Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(selectedTask.timeTracked / 60)}h / {Math.round(selectedTask.estimatedTime / 60)}h
                            </span>
                          </div>
                          <Progress value={(selectedTask.timeTracked / selectedTask.estimatedTime) * 100} />
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity">
                  <div className="space-y-4">
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Activity feed coming soon</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attachments">
                  <div className="space-y-4">
                    <div className="text-center text-muted-foreground py-8">
                      <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No attachments yet</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Attachment
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
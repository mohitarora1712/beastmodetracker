
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';

interface CustomTask {
  _id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  created_at: string;
  updated_at: string;
  user: string;
}

const API = 'http://localhost:5000/api/custom-tasks';
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<CustomTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CustomTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: ''
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: getAuthHeaders() });
      const data = await res.json();
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load custom tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTask) {
        const res = await fetch(`${API}/${editingTask._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || null,
            emoji: formData.emoji || null
          })
        });
        if (!res.ok) throw new Error('Failed to update task');
        toast({
          title: "✅ Task Updated",
          description: "Your custom task has been updated successfully.",
        });
      } else {
        const res = await fetch(API, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || null,
            emoji: formData.emoji || null
          })
        });
        if (!res.ok) throw new Error('Failed to create task');
        toast({
          title: "🎉 Task Created",
          description: "Your custom task has been created successfully.",
        });
      }

      setFormData({ title: '', description: '', emoji: '' });
      setEditingTask(null);
      setOpen(false);
      loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (task: CustomTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      emoji: task.emoji || ''
    });
    setOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`${API}/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete task');
      toast({
        title: "🗑️ Task Deleted",
        description: "Your custom task has been deleted.",
      });
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', emoji: '' });
    setEditingTask(null);
  };

  const TaskForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Emoji (optional)
        </label>
        <Input
          value={formData.emoji}
          onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
          placeholder="🎯"
          className="bg-gray-700 border-gray-600 text-white w-full"
          maxLength={2}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Title *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter task title"
          className="bg-gray-700 border-gray-600 text-white w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description (optional)
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter task description"
          className="bg-gray-700 border-gray-600 text-white w-full min-h-20 resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
        >
          {editingTask ? 'Update Task' : 'Create Task'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setOpen(false);
          }}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 sm:flex-none"
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  const TriggerButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
    <Button
      ref={ref}
      onClick={() => {
        resetForm();
        props.onClick?.(props as any);
      }}
      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
      {...props}
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Custom Task
    </Button>
  ));

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading custom tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-white">Custom Tasks</CardTitle>
          
          {isMobile ? (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <TriggerButton />
              </DrawerTrigger>
              <DrawerContent className="bg-gray-800 border-gray-700">
                <DrawerHeader>
                  <DrawerTitle className="text-white">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <TaskForm />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <TriggerButton />
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </DialogTitle>
                </DialogHeader>
                <TaskForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p>No custom tasks yet.</p>
            <p className="text-sm">Create your first custom task to get started!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
                  completedTasks.includes(task._id)
                    ? 'bg-green-900 border-green-500 shadow-green-500/20 shadow-lg'
                    : 'bg-gray-700 border-gray-600 hover:border-orange-500 hover:bg-gray-650'
                }`}
                onClick={() => handleTaskToggle(task._id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center flex-1 min-w-0 gap-3">
                    {task.emoji && (
                      <span className="text-lg flex-shrink-0">{task.emoji}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-300 text-sm break-words">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      completedTasks.includes(task._id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500'
                    }`}>
                      {completedTasks.includes(task._id) && (
                        <span className="text-white text-xs sm:text-sm">✓</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(task);
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task._id);
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskManager;

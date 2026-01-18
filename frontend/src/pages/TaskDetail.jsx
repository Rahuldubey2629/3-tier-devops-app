import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services'
import { ArrowLeft, Edit, Trash2, MessageSquare, Calendar, User, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTask(id),
  })

  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully')
      navigate('/tasks')
    },
  })

  const commentMutation = useMutation({
    mutationFn: ({ taskId, text }) => taskService.addComment(taskId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id])
      setComment('')
      toast.success('Comment added')
    },
  })

  const task = data?.data

  const handleAddComment = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      commentMutation.mutate({ taskId: id, text: comment })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!task) {
    return <div className="text-center py-12">Task not found</div>
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  const statusColors = {
    todo: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Tasks</span>
        </button>

        <div className="flex space-x-2">
          <button className="btn btn-secondary flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => deleteMutation.mutate(id)}
            className="btn btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColors[task.status]}`}>
            {task.status}
          </span>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.category && (
            <span
              className="px-3 py-1 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: task.category.color + '20',
                color: task.category.color
              }}
            >
              {task.category.name}
            </span>
          )}
        </div>

        {task.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <User className="w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500">Assigned To</p>
              <p className="font-medium">
                {task.assignedTo?.firstName} {task.assignedTo?.lastName || task.assignedTo?.username}
              </p>
            </div>
          </div>

          {task.dueDate && (
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{format(new Date(task.dueDate), 'PPP')}</p>
              </div>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Comments ({task.comments?.length || 0})
        </h2>

        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="input min-h-[100px] resize-none"
          />
          <button
            type="submit"
            disabled={!comment.trim() || commentMutation.isPending}
            className="btn btn-primary mt-2"
          >
            {commentMutation.isPending ? 'Adding...' : 'Add Comment'}
          </button>
        </form>

        <div className="space-y-4">
          {task.comments?.map((comment) => (
            <div key={comment._id} className="border-l-4 border-primary-200 pl-4 py-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">
                  {comment.user?.firstName} {comment.user?.lastName || comment.user?.username}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(comment.createdAt), 'PPp')}
                </span>
              </div>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          ))}

          {(!task.comments || task.comments.length === 0) && (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services'
import { CheckCircle2, Clock, AlertCircle, Archive, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['taskStats'],
    queryFn: taskService.getTaskStats,
  })

  const { data: recentTasks } = useQuery({
    queryKey: ['tasks', { limit: 5 }],
    queryFn: () => taskService.getTasks({ limit: 5 }),
  })

  const stats = statsData?.data || {}
  const statusCounts = {
    todo: 0,
    'in-progress': 0,
    completed: 0,
    archived: 0,
  }

  stats.byStatus?.forEach(item => {
    statusCounts[item._id] = item.count
  })

  const statCards = [
    {
      title: 'To Do',
      value: statusCounts.todo,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      value: statusCounts['in-progress'],
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Completed',
      value: statusCounts.completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Tasks',
      value: stats.total || 0,
      icon: Archive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your tasks.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
          <Link to="/tasks" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {recentTasks?.data?.length > 0 ? (
          <div className="space-y-4">
            {recentTasks.data.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.category && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {task.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.dueDate && (
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">Due</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tasks yet. Create your first task!</p>
            <Link to="/tasks" className="btn btn-primary mt-4 inline-block">
              Create Task
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

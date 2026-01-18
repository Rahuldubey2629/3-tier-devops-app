import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '../../services'
import { X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

export default function CategoryModal({ isOpen, onClose, category = null }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (category) {
      reset(category)
    } else {
      reset({ name: '', description: '', color: '#6366f1', icon: 'folder' })
    }
  }, [category, reset])

  const mutation = useMutation({
    mutationFn: (data) => {
      if (category) {
        return categoryService.updateCategory(category._id, data)
      }
      return categoryService.createCategory(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      toast.success(category ? 'Category updated successfully' : 'Category created successfully')
      reset()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Operation failed')
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  if (!isOpen) return null

  const popularColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="input"
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="input min-h-[80px] resize-none"
              placeholder="Enter category description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2 mb-2">
              {popularColors.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    {...register('color')}
                    value={color}
                    className="sr-only peer"
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-900 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-gray-400 transition-all"
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
            <input
              type="color"
              {...register('color')}
              className="input h-10"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{category ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{category ? 'Update' : 'Create'} Category</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

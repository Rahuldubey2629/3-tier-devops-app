import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services'
import { useAuthStore } from '../store/authStore'
import { User, Mail, Calendar, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      avatar: user?.avatar || ''
    }
  })

  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  })

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (response) => {
      updateUser(response.data)
      queryClient.invalidateQueries(['profile'])
      toast.success('Profile updated successfully')
    },
  })

  const onSubmit = (data) => {
    updateMutation.mutate(data)
  }

  const profile = data?.data || user

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="card lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.firstName} {profile?.lastName || profile?.username}
            </h2>
            <p className="text-gray-600 mt-1">{profile?.email}</p>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Joined {profile?.createdAt && format(new Date(profile.createdAt), 'MMM yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Update Profile</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  className="input"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  className="input"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={profile?.username || ''}
                className="input bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  className="input bg-gray-100 flex-1"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                {...register('avatar')}
                className="input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn btn-primary flex items-center space-x-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="font-medium text-gray-900">
              {profile?.isActive ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">Inactive</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium text-gray-900 capitalize">{profile?.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium text-gray-900">
              {profile?.createdAt && format(new Date(profile.createdAt), 'PPP')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Login</p>
            <p className="font-medium text-gray-900">
              {profile?.lastLogin ? format(new Date(profile.lastLogin), 'PPP') : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

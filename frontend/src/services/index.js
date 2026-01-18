import api from './api'

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export const taskService = {
  getTasks: async (params) => {
    const response = await api.get('/tasks', { params })
    return response.data
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  createTask: async (data) => {
    const response = await api.post('/tasks', data)
    return response.data
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },

  addComment: async (id, data) => {
    const response = await api.post(`/tasks/${id}/comments`, data)
    return response.data
  },

  getTaskStats: async () => {
    const response = await api.get('/tasks/stats')
    return response.data
  },
}

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  createCategory: async (data) => {
    const response = await api.post('/categories', data)
    return response.data
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/users')
    return response.data
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
}

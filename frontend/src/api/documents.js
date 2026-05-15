import client from './client'

export const uploadDocument = (formData, onProgress) =>
  client.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  }).then((r) => r.data)

export const listDocuments = (params) =>
  client.get('/documents', { params }).then((r) => r.data)

export const getDocument = (id) =>
  client.get(`/documents/${id}`).then((r) => r.data)

export const updateDocument = (id, body) =>
  client.put(`/documents/${id}`, body).then((r) => r.data)

export const deleteDocument = (id) =>
  client.delete(`/documents/${id}`).then((r) => r.data)

export const searchDocuments = (filters) =>
  client.get('/documents/search', { params: filters }).then((r) => r.data)

export const recentDocuments = () =>
  client.get('/documents/recent').then((r) => r.data)

export const previewUrl = (id) => `/api/v1/documents/${id}/preview`
export const downloadUrl = (id) => `/api/v1/documents/${id}/download`

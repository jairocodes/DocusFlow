import client from './client'

export const listFolders = () =>
  client.get('/folders').then((r) => r.data)

export const createFolder = (nombre, color_hex) =>
  client.post('/folders', { nombre, color_hex }).then((r) => r.data)

export const updateFolder = (id, body) =>
  client.put(`/folders/${id}`, body).then((r) => r.data)

export const deleteFolder = (id) =>
  client.delete(`/folders/${id}`).then((r) => r.data)

export const getFolderDocuments = (id, params) =>
  client.get(`/folders/${id}/documents`, { params }).then((r) => r.data)

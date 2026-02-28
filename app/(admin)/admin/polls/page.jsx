'use client'

import { AlertDialogFooter } from "@/components/ui/alert-dialog"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Eye, AlertCircle, BarChart3, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchCsrfToken } from '@/hooks/use-auth'

const apiRequest = async (url, method = 'GET', body = null) => {
  const csrfToken = await fetchCsrfToken()
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    }, ...(body && { body: JSON.stringify(body) }),
  })
  let json = null
  try {
    json = await response.json()
  } catch (err) {
    // non-json response
  }
  if (!response.ok) {
    console.error('API error', response.status, json)
    // surface server message if available
    const msg = json && (json.detail || JSON.stringify(json))
    throw new Error(msg || `Request failed: ${response.status}`)
  }
  return json
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPoll, setEditingPoll] = useState(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deletingPollId, setDeletingPollId] = useState(null)
  const [viewingPoll, setViewingPoll] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', options: ['', ''], category: 'general', multipleVotes: false, endDate: '', })
  // convert server poll object into the shape our UI expects
  const normalizePoll = p => ({
    ...p,
    totalVotes: p.total_votes,
    endDate: p.end_date,
    multipleVotes: p.multiple_votes,
    options: (p.options||[]).map(o=>({text:o.text,votes:o.votes,id:o.id})),
  })

  const fetchPolls = async () => {
    try {
      setLoading(true)
      const data = await apiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/users/polls/`)
      const list = Array.isArray(data) ? data : data.data
      setPolls((list || []).map(normalizePoll))
    } catch (error) {
      toast.error('Failed to load polls')
      console.error(error)
    } finally { setLoading(false) }
  }
  // build payload matching API snake_case expectations
  const buildPayload = form => ({
    title: form.title,
    description: form.description||null,
    category: form.category,
    multiple_votes: form.multipleVotes,
    end_date: form.endDate||null,
    options: form.options
      .filter(o=>o.trim())
      .map(text=>({text})),
  })

  const handleCreateOrUpdate = async () => {
    if (!formData.title.trim() || formData.options.filter((o) => o.trim()).length < 2) {
      toast.error('Title and at least 2 options are required')
      return
    }

    try {
      const url = editingPoll
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/polls/${editingPoll.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/users/polls/`
      const method = editingPoll ? 'PUT' : 'POST'
      const payload = buildPayload(formData)
      const data = await apiRequest(url, method, payload)
      toast.success(editingPoll ? 'Poll updated' : 'Poll created')
      const newPoll = normalizePoll(data.data || data)
      setPolls(
        editingPoll
          ? polls.map((p) => (p.id === newPoll.id ? newPoll : p))
          : [newPoll, ...polls]
      )
      setOpenDialog(false)
      setEditingPoll(null)
      setFormData({ title: '', description: '', options: ['', ''], category: 'general', multipleVotes: false, endDate: '' })
    } catch (error) {
      toast.error('Failed to save poll')
      console.error(error)
    }
  }
  const handleEdit = (poll) => {
    setEditingPoll(poll)
    setFormData({
      title: poll.title,
      description: poll.description || '',
      options: poll.options.map((o) => o.text),
      category: poll.category,
      multipleVotes: poll.multipleVotes,
      endDate: poll.endDate ? new Date(poll.endDate).toISOString().slice(0, 16) : '',
    })
    setOpenDialog(true)
  }
  const handleDeleteClick = (pollId) => {
    setDeletingPollId(pollId)
    setDeleteAlertOpen(true)
  }
  const handleDelete = async () => {
    try {
      await apiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/users/polls/${deletingPollId}/`, 'DELETE')
      setPolls(polls.filter((p) => p.id !== deletingPollId))
      toast.success('Poll deleted')
      setDeleteAlertOpen(false)
      setDeletingPollId(null)
    } catch (error) {
      toast.error('Failed to delete poll')
      console.error(error)
    }
  }
  const handleAddOption = () => { setFormData({ ...formData, options: [...formData.options, ''] }) }
  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      setFormData({ ...formData, options: formData.options.filter((_, i) => i !== index) })
    }
  }
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }
  useEffect(() => { fetchPolls() }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-bhagva-700" />
              Community Polls
            </h1>
            <p className="text-gray-600 mt-1">Create and manage community polls</p>
          </div>
          <Button
            onClick={() => {
              setEditingPoll(null)
              setFormData({ title: '', description: '', options: ['', ''], category: 'general', multipleVotes: false, endDate: '' })
              setOpenDialog(true)
            }}
            className="bg-bhagva-700 hover:bg-bhagva-800 w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Poll
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-bhagva-50 to-bhagva-100 border-bhagva-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-bhagva-900">Total Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-bhagva-700">{polls.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{polls.filter(p => p.is_active).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">{polls.reduce((sum, p) => sum + p.total_votes, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Polls List */}
      {polls.length === 0 ? (
        <Card className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No polls created yet. Create one to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {polls.map((poll, index) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{poll.title}</CardTitle>
                      {poll.description && (
                        <p className="text-sm text-gray-600">{poll.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-bhagva-100 text-bhagva-800">
                          {poll.category}
                        </span>
                        {poll.is_active ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-600"><strong>Options:</strong> {poll.options.length}</p>
                    <p className="text-sm text-gray-600"><strong>Total Votes:</strong> {poll.totalVotes}</p>
                    {poll.endDate && (
                      <p className="text-sm text-gray-600"><strong>Ends:</strong> {new Date(poll.endDate).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingPoll(poll)}
                      className="flex-1 md:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(poll)}
                      className="flex-1 md:flex-none"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(poll.id)}
                      className="text-red-600 hover:text-red-700 flex-1 md:flex-none"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPoll ? 'Edit Poll' : 'Create New Poll'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Poll Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter poll title"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description (optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter poll description"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Date (optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.multipleVotes}
                  onChange={(e) => setFormData({ ...formData, multipleVotes: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Allow multiple votes</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Options</label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="mt-2 w-full bg-transparent"
              >
                Add Option
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateOrUpdate} className="bg-bhagva-700 hover:bg-bhagva-800">
              {editingPoll ? 'Update Poll' : 'Create Poll'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Poll Dialog */}
      {viewingPoll && (
        <Dialog open={!!viewingPoll} onOpenChange={() => setViewingPoll(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewingPoll.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {viewingPoll.description && (
                <p className="text-gray-600">{viewingPoll.description}</p>
              )}

              <div className="space-y-3">
                {viewingPoll.options.map((option, index) => {
                  const percentage = viewingPoll.totalVotes > 0 ? (option.votes / viewingPoll.totalVotes) * 100 : 0

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{option.text}</span>
                        <span className="text-sm text-gray-600">{option.votes} votes ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-bhagva-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-sm text-gray-600 pt-4 border-t space-y-1">
                <p><strong>Category:</strong> {viewingPoll.category}</p>
                <p><strong>Total Votes:</strong> {viewingPoll.totalVotes}</p>
                <p><strong>Status:</strong> {viewingPoll.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setViewingPoll(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2, BarChart3, ChevronRight } from 'lucide-react'

export default function PollsPage() {
  const [polls, setPolls] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [votedPolls, setVotedPolls] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userIdTemp] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest_' + Date.now() : '')

  useEffect(() => {
    fetchPolls()
  }, [])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/polls`)
      if (!response.ok) throw new Error('Failed to fetch polls')
      const data = await response.json()
      setPolls(data.data || [])
      setError('')
    } catch (err) {
      setError('Failed to load polls')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (pollId, optionIndex) => {
    if (votedPolls.has(pollId)) {
      alert('You have already voted on this poll')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex, userId: userIdTemp }),
      })

      if (!response.ok) throw new Error('Failed to submit vote')

      const data = await response.json()
      setPolls(polls.map(p => p._id === pollId ? data.data : p))
      setVotedPolls(new Set([...votedPolls, pollId]))
    } catch (err) {
      alert('Error submitting vote: ' + err.message)
    }
  }

  const filteredPolls = selectedCategory === 'all' 
    ? polls 
    : polls.filter(p => p.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bhagva-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-bhagva-900 mb-4">Community Polls</h1>
            <p className="text-lg text-gray-600">Loading polls...</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bhagva-50 to-white py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bhagva-100 mb-4">
            <BarChart3 className="w-8 h-8 text-bhagva-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-bhagva-900 mb-3">Community Polls</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your opinions and help shape our community by participating in our polls
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-8">
          <Tabs 
            defaultValue="all" 
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-bhagva-100">
              <TabsTrigger value="all">All Polls</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Polls Grid */}
        {filteredPolls.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No polls available at the moment</p>
            <p className="text-gray-500">Check back soon for new community polls</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {filteredPolls.map((poll, index) => {
              const hasVoted = votedPolls.has(poll._id)
              const isPollEnded = poll.endDate && new Date(poll.endDate) < new Date()

              return (
                <motion.div
                  key={poll._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-0 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-2xl text-bhagva-900 mb-2">{poll.title}</CardTitle>
                          {poll.description && (
                            <CardDescription className="text-base">{poll.description}</CardDescription>
                          )}
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-bhagva-100 text-bhagva-800 whitespace-nowrap">
                          {poll.category}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Poll Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600 pb-4 border-b">
                        <span>{poll.totalVotes} votes</span>
                        {hasVoted && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>You voted</span>
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        {poll.options.map((option, optionIndex) => {
                          const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0

                          return (
                            <button
                              key={optionIndex}
                              onClick={() => !hasVoted && !isPollEnded && handleVote(poll._id, optionIndex)}
                              disabled={hasVoted || isPollEnded}
                              className="w-full text-left group"
                            >
                              <div className="relative overflow-hidden rounded-lg bg-gray-100 p-4 transition-all duration-300 hover:bg-bhagva-50 disabled:cursor-not-allowed">
                                {/* Background progress bar */}
                                <div
                                  className="absolute inset-0 bg-bhagva-200 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />

                                {/* Content */}
                                <div className="relative flex items-center justify-between">
                                  <span className="font-medium text-gray-900 group-hover:text-bhagva-900 transition-colors">
                                    {option.text}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-700">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>

                                {/* Vote count */}
                                <p className="relative text-xs text-gray-600 mt-1">
                                  {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Poll Status */}
                      <div className="pt-2 border-t">
                        {isPollEnded ? (
                          <p className="text-sm text-red-600 font-medium">This poll has ended</p>
                        ) : hasVoted ? (
                          <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Thank you for voting!
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">Click on an option to vote</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

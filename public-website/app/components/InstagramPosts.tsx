'use client'

import { useEffect, useState } from 'react'

interface InstagramPost {
  id: string
  media_type: string
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
  thumbnail_url?: string
}

interface InstagramPostsProps {
  username?: string
  limit?: number
}

export default function InstagramPosts({ username = 'yaraspace_hairspa', limit = 4 }: InstagramPostsProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/instagram?username=${username}&limit=${limit}`)
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          setPosts(data.data)
        } else {
          // If no posts from API, use Instagram embed approach
          // For now, we'll show a message or use oEmbed
          setError(data.message || 'No posts available')
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching Instagram posts:', err)
        setError('Failed to load Instagram posts')
        setLoading(false)
      }
    }

    fetchPosts()
  }, [username, limit])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-soft">Loading Instagram posts...</p>
      </div>
    )
  }

  if (error || posts.length === 0) {
    // Fallback: Show Instagram profile link and embed using Instagram's embed feature
    // Note: To show actual posts, configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in .env
    return (
      <div className="text-center py-12">
        <p className="text-soft mb-6 font-poppins">Следите за нами в Instagram, чтобы видеть наши последние работы</p>
        <a
          href={`https://www.instagram.com/${username}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:text-dark transition-colors font-semibold mb-8"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @{username}
        </a>
        <div className="text-sm text-soft font-poppins">
          <p>Для отображения постов настройте Instagram API в переменных окружения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden rounded-2xl bg-base shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
        >
          {post.media_type === 'VIDEO' ? (
            <img
              src={post.thumbnail_url || post.media_url}
              alt={post.caption || 'Instagram post'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <img
              src={post.media_url}
              alt={post.caption || 'Instagram post'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300 flex items-center justify-center">
            {post.media_type === 'VIDEO' && (
              <svg
                className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </a>
      ))}
    </div>
  )
}

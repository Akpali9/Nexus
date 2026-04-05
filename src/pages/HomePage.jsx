import { useState } from 'react'
import StoriesBar from '../components/stories/StoriesBar'
import PostCard from '../components/feed/PostCard'
import CreatePost from '../components/feed/CreatePost'
import RightSidebar from '../components/layout/RightSidebar'
import { MOCK_POSTS } from '../store/appStore'

export default function HomePage() {
  const [posts, setPosts] = useState(MOCK_POSTS)

  const handlePost = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  return (
    <div style={{ display: 'flex', gap: 24, padding: '24px 24px 24px 0', minHeight: '100vh' }}>
      {/* Center Feed */}
      <div style={{ flex: 1, maxWidth: 640, minWidth: 0 }}>
        <StoriesBar />
        <CreatePost onPost={handlePost} />
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Right sidebar */}
      <RightSidebar />
    </div>
  )
}

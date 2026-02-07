import { FeedTabs, PostCreator } from '@/components/content';

export default function HomePage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Embr</h1>
      <PostCreator className="mb-6" />
      <FeedTabs />
    </main>
  );
}

import { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button, Card, PageState } from '@/components/ui';
import { contentApi } from '@shared/api/content.api';
import { getApiErrorMessage } from '@/lib/api/error';
import { FeedType, Post } from '@shared/types/content.types';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await contentApi.getFeed({ feedType: FeedType.FOR_YOU, page: 1, limit: 10 });
      setPosts(response.data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Unable to load feed.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <ProtectedRoute>
      <AppShell title="Feed" subtitle="Live content from your network." accent="warm1">
        {loading ? (
          <Card padding="lg">
            <PageState title="Loading feed" description="Fetching the latest posts for you." />
          </Card>
        ) : null}

        {!loading && error ? (
          <Card padding="lg">
            <PageState title="Could not load feed" description={error} actionLabel="Retry" onAction={loadFeed} />
          </Card>
        ) : null}

        {!loading && !error && posts.length === 0 ? (
          <Card padding="lg">
            <PageState title="No posts yet" description="Follow creators and come back to see your feed." />
          </Card>
        ) : null}

        {!loading && !error && posts.length > 0 ? (
          <section style={{ display: 'grid', gap: '0.9rem' }}>
            {posts.map((post) => (
              <Card key={post.id} padding="md">
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {post.author.profile.displayName || post.author.username}
                </p>
                <p className="ui-help-text" style={{ marginTop: '0.2rem' }}>
                  @{post.author.username}
                </p>
                <p style={{ marginBottom: '0.6rem' }}>{post.content || 'Media post'}</p>
                <Button type="button" variant="ghost" disabled>
                  Interactions in P1 ({`EMBR-FE-P1-001`})
                </Button>
              </Card>
            ))}
          </section>
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}

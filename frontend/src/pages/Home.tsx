import { DefaultSpaceId } from '@nest/shared';

import { BlogList } from '../components/BlogList';
import { Sidebar } from '../components/SideBar';
import { useFeeds, useSpace } from '../hooks/useSpace';

export const Home = () => {
  const { spaceQuery } = useSpace(DefaultSpaceId);
  const { feeds, fetchNextPage, isEnd, isLoading } = useFeeds();
  const error = spaceQuery.error;

  if (spaceQuery.isError) return <p className="error">{spaceQuery.error.message}</p>;
  if (spaceQuery.isLoading) return <div>Loading...</div>;

  return (
    <div className="home">
      <main>
        {error && <p className="error">{error?.message}</p>}
        {!!feeds?.length && (
          <>
            <BlogList posts={feeds} />
            <button hidden={isEnd} disabled={isEnd} onClick={() => fetchNextPage()}>
              Load More
            </button>
          </>
        )}
        {feeds?.length === 0 && !isLoading && !error && (
          <div className="not-found">
            <p>Follow users or join to different spaces to see their blogs here</p>
          </div>
        )}
      </main>
      <Sidebar />
    </div>
  );
};

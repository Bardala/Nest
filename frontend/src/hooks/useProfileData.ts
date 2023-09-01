import { GetUserCardRes, UserBlogsRes, UserSpacesRes } from '@nest/shared';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuthContext } from '../context/AuthContext';
import { ApiError } from '../fetch/auth';
import { userBlogsApi, userCardApi, userSpacesApi } from '../utils/api';
import { useScroll } from './useScroll';

export const useProfileData = (id: string) => {
  const { currUser } = useAuthContext();
  const isMyPage = currUser?.id === id;
  const cardKey = ['userCard', id];
  const spacesKey = ['userSpaces', id];
  const blogsKey = ['userBlogs', id];
  const pageSize = 3;
  const [isEnd, setIsEnd] = useState(false);

  const userCardQuery = useQuery<GetUserCardRes, ApiError>(cardKey, userCardApi(id), {
    enabled: !!currUser?.jwt && !!id,
  });

  const userSpacesQuery = useQuery<UserSpacesRes, ApiError>(spacesKey, userSpacesApi(id), {
    enabled: isMyPage && !!currUser?.jwt && !!id && !!userCardQuery.data?.userCard,
    refetchOnWindowFocus: false,
  });

  const userBlogsQuery = useInfiniteQuery<UserBlogsRes, ApiError>(blogsKey, userBlogsApi(id), {
    enabled: !!currUser?.jwt && !!id && !!userCardQuery.data?.userCard,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    getNextPageParam: lastPage => {
      return lastPage.page + 1;
    },
    onSuccess: data => {
      if (data.pages[data.pages.length - 1].blogs.length < pageSize) {
        setIsEnd(true);
      }
    },
  });

  useScroll(userBlogsQuery);

  return {
    userCardQuery,
    userSpacesQuery,
    userBlogsQuery,
    isMyPage,
    isEnd,
  };
};

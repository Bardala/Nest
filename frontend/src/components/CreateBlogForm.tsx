import { CreateBlogReq, CreateBlogRes, HOST } from '@nest/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuthContext } from '../context/AuthContext';
import { fetchFn } from '../fetch/auth';

export const CreateBlogForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { currUser } = useAuthContext();

  const { id } = useParams();
  const queryClient = useQueryClient();

  const createBlogMutation = useMutation({
    mutationFn: () =>
      fetchFn<CreateBlogReq, CreateBlogRes>(
        `${HOST}/blog`,
        'POST',
        { title, content, spaceId: id || '1' },
        currUser?.jwt
      ),
    onSuccess: data => {
      queryClient.invalidateQueries(['space', id || '1']);
      console.log('data', data);
      setTitle('');
      setContent('');
    },
    onError: err => {
      console.log('err', err);
    },
  });

  const handleSubmit = (e: MouseEvent | FormEvent) => {
    e.preventDefault();
    createBlogMutation.mutate();
  };

  return (
    <>
      <form className="create-blog-from" onSubmit={handleSubmit}>
        {createBlogMutation.isError && <p>{JSON.stringify(createBlogMutation.error)}</p>}
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <label htmlFor="content">Content</label>
        <textarea
          name="content"
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <button type="submit" disabled={createBlogMutation.isLoading}>
          Create
        </button>
        {createBlogMutation.isLoading && <p>Creating...</p>}
      </form>
    </>
  );
};
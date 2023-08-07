import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';

import { isArabic } from '../assists';
import { MyMarkdown } from '../components/MyMarkdown';
import { useCreateBlog } from '../hooks/useCreateBlog';
import '../styles/create-blog-page.css';

export const CreateBlogPage: React.FC = () => {
  const { spaceId, spaceName } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const shortLength = 500;
  const remaining = shortLength - content.length;
  const enabled = content.length > shortLength;

  const { createBlogMutation } = useCreateBlog(spaceId!, title, content);

  const handleSubmit = (e: MouseEvent | FormEvent) => {
    e.preventDefault();
    createBlogMutation.mutate();
    if (createBlogMutation.isSuccess) {
      setTitle('');
      setContent('');
    }
  };

  return (
    <>
      <h4>
        Add a New Blog to <i>{spaceName}</i> Space
      </h4>
      <div className="create">
        <form onSubmit={e => handleSubmit(e)}>
          <input
            className="title-input"
            type="text"
            value={title}
            placeholder="blog title"
            onChange={e => setTitle(e.target.value)}
          />

          <textarea
            placeholder="blog body"
            className="body-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            minLength={shortLength}
          ></textarea>

          <i className="remaining-char" hidden={enabled}>
            you should enter at least {remaining} characters
          </i>

          <button disabled={createBlogMutation.isLoading || !enabled}>Add Blog</button>
        </form>

        <div className="blog-content">
          <article className={isArabic(content) ? 'arabic' : ''}>
            <MyMarkdown markdown={content} />
          </article>
        </div>
      </div>
      {createBlogMutation.isError && <p className="error">{createBlogMutation.error.message}</p>}
    </>
  );
};

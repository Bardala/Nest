import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import asyncHandler from 'express-async-handler';

import { BlogController } from './controllers/blog.controller';
import { CommentController } from './controllers/comment.controller';
import { SpaceController } from './controllers/space.controller';
import { UserController } from './controllers/user.controller';
import { db, initDb } from './dataStore';
import { requireAuth } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';

(async () => {
  dotenv.config();
  await initDb();

  const app = express();
  const port = process.env.PORT;

  app.use(express.json());
  app.use(cors());

  const user = new UserController(db);
  const blog = new BlogController(db);
  const space = new SpaceController(db);
  const comm = new CommentController(db);

  app.use((req, res, next) => {
    console.log(req.path, req.method, req.body, req.params, res.statusCode);
    next();
  });

  // *Auth Routes
  app.post('/api/v0/signup', asyncHandler(user.signup));
  app.post('/api/v0/login', asyncHandler(user.login));

  app.use(requireAuth);

  // *User Routes
  app.get('/api/v0/getUserCard/:id', asyncHandler(user.getUserCard));
  app.post('/api/v0/followUser/:id', asyncHandler(user.createFollow));
  app.delete('/api/v0/unFollowUser/:id', asyncHandler(user.deleteFollow));
  app.get('/api/v0/getFollowers/:id', asyncHandler(user.getFollowers));
  app.get('/api/v0/usersList', asyncHandler(user.getUsersList));
  app.get('/api/v0/getUserCard/:id', asyncHandler(user.getUserCard));
  app.get('/api/v0/getUserBlogs/:id', asyncHandler(user.getUserBlogs));
  app.get('/api/v0/getUserSpaces/:id', asyncHandler(user.getUserSpaces));

  // *Blog Routes
  app.post('/api/v0/blog', asyncHandler(blog.createBlog));
  app.put('/api/v0/blog/:blogId', asyncHandler(blog.updateBlog));
  app.get('/api/v0/blog/:blogId', asyncHandler(blog.getBlog));
  app.delete('/api/v0/blog/:blogId', asyncHandler(blog.deleteBlog));

  app.get('/api/v0/blogComments/:blogId', asyncHandler(blog.getBlogComments));
  app.get('/api/v0/blogLikes/:blogId', asyncHandler(blog.getBlogLikes));
  app.get('/api/v0/blogLikesList/:blogId', asyncHandler(blog.getBlogLikesList));
  app.post('/api/v0/likeBlog/:blogId', asyncHandler(blog.likeBlog));
  app.delete('/api/v0/unLikeBlog/:blogId', asyncHandler(blog.unLikeBlog));

  // *Space Routes
  app.post('/api/v0/space', asyncHandler(space.createSpace));
  app.put('/api/v0/space/:spaceId', asyncHandler(space.updateSpace));
  app.get('/api/v0/space/:spaceId', asyncHandler(space.getSpace));
  app.delete('/api/v0/space/:spaceId', asyncHandler(space.deleteSpace));

  app.get('/api/v0/getDefaultSpace', asyncHandler(space.getDefaultSpace));
  app.post('/api/v0/joinSpace/:spaceId', asyncHandler(space.joinSpace));
  app.post('/api/v0/addMember/:spaceId', asyncHandler(space.addMember));
  app.get('/api/v0/spaceMembers/:spaceId', asyncHandler(space.getSpaceMembers));

  // *Comment Routes
  app.post('/api/v0/comment', asyncHandler(comm.createComment));
  app.put('/api/v0/comment', asyncHandler(comm.updateComment));
  app.delete('/api/v0/comment/:commentId', asyncHandler(comm.deleteComment));

  app.use(errorHandler);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
})();

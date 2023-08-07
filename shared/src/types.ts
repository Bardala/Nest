// todo: rename the file .d.ts

export interface Blog {
  id: string;
  title: string;
  content: string;
  userId: string;
  spaceId: string;
  author?: string;
  timestamp?: number;
}

export interface Comment {
  id: string;
  content: string;
  blogId: string;
  userId: string;
  // author?: string; // todo: remove and use CommentWithUser instead
  timestamp?: number;
}
export interface CommentWithUser extends Comment {
  author: string;
}

export type SpaceStatus = 'public' | 'private';

export interface Space {
  id: string;
  name: string;
  status: SpaceStatus;
  description: string;
  ownerId: string;
  timestamp?: string;
}

export interface SpaceMember {
  memberId: string;
  spaceId: string;
  isAdmin: boolean;
  username?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  timestamp?: string;
}

export interface UserCard {
  id: string;
  username: string;
  email: string;
  timestamp: string;
  followersNum: number;
  followingNum: number;
  isFollowing: number;
}

export type ChatMessage = {
  id: string;
  userId: string;
  username: string;
  spaceId: string;
  content: string;
  timestamp: number;
};

export type LikedUser = Pick<User, 'id' | 'username'>;

export interface Like {
  blogId: string;
  userId: string;
}

export type Short = {
  id: string;
  title: string;
  content: string;
  userId: string;
  spaceId: string;
  author?: string;
  timestamp?: number;
};
// export type ShComment = {
//   id: string;
//   content: string;
//   shortId: string;
//   userId: string;
//   author?: string;
//   timestamp?: number;
// };
// export type ShCommentWithUser = ShComment & { username: string };
// export type ShLike = {
//   shortId: string;
//   userId: string;
// };
// export type ShLikedUser = Pick<User, 'id' | 'username'>;

export interface JwtObject {
  userId: string;
}

export type StatusMessage =
  | 'OK'
  | 'Forbidden'
  | 'Not Found'
  | 'Internal Server Error'
  | 'Bad Request'
  | 'Unauthorized';

export type WithError<T> = T & { error: string };

export type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

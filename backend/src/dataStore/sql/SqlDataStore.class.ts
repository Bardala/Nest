import { DataStoreDao } from "..";
import {
  User,
  Blog,
  Comment,
  Space,
  Like,
  UserCard,
  SpaceMember,
} from "../../../../shared/src/types";
import mysql, { RowDataPacket } from "mysql2";
import { Pool } from "mysql2/promise";

export class SqlDataStore implements DataStoreDao {
  private pool!: Pool;

  async runDB() {
    this.pool = mysql
      .createPool({
        host: process.env.MY_SQL_DB_HOST,
        user: process.env.MY_SQL_DB_USER,
        database: process.env.MY_SQL_DB_DATABASE,
        password: process.env.MY_SQL_DB_PASSWORD,
      })
      .promise();

    return this;
  }

  updateUser(_user: User): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteUser(_userId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async createComment(comment: Comment): Promise<void> {
    await this.pool.query<RowDataPacket[]>(
      "INSERT INTO comments SET id=?, blogId=?, userId=?, content=?",
      [comment.id, comment.blogId, comment.userId, comment.content],
    );
  }
  async updateComment(comment: Pick<Comment, "content" | "id">): Promise<void> {
    const query = `
    UPDATE comments 
    SET content=?
    WHERE id=?
    `;
    await this.pool.query<RowDataPacket[]>(query, [
      comment.content,
      comment.id,
    ]);
  }
  async getComment(commentId: string): Promise<Comment> {
    const query = `
    SELECT * FROM comments WHERE id=?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(query, commentId);
    return rows[0] as Comment;
  }
  async deleteComment(commentId: string): Promise<void> {
    const query = `
    DELETE FROM comments WHERE id=?
    `;
    await this.pool.query(query, commentId);
  }

  async spaceMembers(spaceId: string): Promise<SpaceMember[]> {
    const query = `
    SELECT users.username, users.id
    FROM members RIGHT JOIN users
    ON members.memberId = users.id
    WHERE spaceId=?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(query, spaceId);
    return rows as SpaceMember[];
  }

  async isMember(spaceId: string, memberId: string): Promise<boolean> {
    const query = `
    SELECT COUNT(*) AS res FROM members 
    WHERE spaceId=? AND memberId=?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(query, [
      spaceId,
      memberId,
    ]);
    const result = rows[0]["res"] as number;
    return result !== 1 ? false : true;
  }

  async updateBlog(blog: Blog): Promise<void> {
    const query = `
    UPDATE blogs
    SET title=?, content=?, spaceId=?
    WHERE id=?
    `;
    await this.pool.query<RowDataPacket[]>(query, [
      blog.title,
      blog.content,
      blog.spaceId,
      blog.id,
    ]);
  }
  async getBlogComments(blogId: string): Promise<Comment[]> {
    const query = `
    SELECT * FROM comments WHERE blogId=?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(query, blogId);

    return rows as Comment[];
  }
  async blogLikes(blogId: string): Promise<number> {
    const query = `
    SELECT COUNT(*) FORM likes WHERE blogId=?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(query, blogId);

    return rows[0][0];
  }
  async blogLikesList(blogId: string): Promise<Like[]> {
    const query = `
    SELECT * FROM likes WHERE  blogId=?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(query, blogId);

    return rows as Like[];
  }

  async getFollowers(followingId: string): Promise<string[]> {
    const query = `
    SELECT users.username
    FROM users
    INNER JOIN follows ON users.id = follows.followerId
    WHERE follows.followingId = ?
  `;

    const [rows] = await this.pool.query<RowDataPacket[]>(query, [followingId]);

    return rows.map((obj) => obj.username);
  }

  async createUser(user: User): Promise<void> {
    await this.pool.query<RowDataPacket[]>(
      "INSERT INTO users SET id=?, username=?, password=?, email=?",
      [user.id, user.username, user.password, user.email],
    );
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [userId],
    );
    return rows[0] as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );

    return rows[0] as User;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    return rows[0] as User;
  }

  async getUserCard(
    userId: string,
    cardOwnerId: string,
  ): Promise<UserCard | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `
      SELECT users.id, users.username, users.email, users.timestamp,  
      (SELECT COUNT(*) FROM follows WHERE follows.followingId = users.id) AS followersNum,
      (SELECT COUNT(*) FROM follows WHERE follows.followerId = users.id) AS followingNum,
      (SELECT COUNT(*) FROM follows WHERE follows.followerId = ? AND follows.followingId = users.id) AS isFollowing
      FROM users
      WHERE users.id = ?
    `,
      [userId, cardOwnerId],
    );

    return rows[0] as UserCard;
  }

  async getUsers(): Promise<User[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM users",
    );
    return rows as User[];
  }

  async getUsersList(): Promise<string[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT username FRoM users",
    );

    // rows = [
    //   {username: 'islam'},
    //   {username: 'ali'},
    // ]

    return rows.map((obj) => obj.username);
  }

  async isFollow(followingId: string, userId: string): Promise<boolean> {
    const query = `
    SELECT followerId FROM follows 
    WHERE 
    followingId = ? AND followerId = ?
    `;

    const [rows] = await this.pool.query<RowDataPacket[]>(query, [
      followingId,
      userId,
    ]);

    return rows[0] ? true : false;
  }

  async createFollow(followerId: string, followingId: string): Promise<void> {
    await this.pool.query<RowDataPacket[]>(
      "INSERT INTO follows SET followerId=?, followingId=?",
      [followerId, followingId],
    );
  }

  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    await this.pool.query<RowDataPacket[]>(
      "DELETE FROM follows WHERE followerId=? AND followingId=?",
      [followerId, followingId],
    );
  }

  async createBlog(blog: Blog): Promise<void> {
    await this.pool.query(
      "INSERT INTO blogs SET id=?, title=?, content=?, userId=?, spaceId=?",
      [blog.id, blog.title, blog.content, blog.userId, blog.spaceId],
    );
  }

  async getBlogs(spaceId: string): Promise<Blog[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM blogs WHERE spaceId = ?",
      [spaceId],
    );
    return rows as Blog[];
  }

  async getBlog(blogId: string): Promise<Blog | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM blogs WHERE id=?",
      [blogId],
    );
    return rows[0] as Blog;
  }

  async deleteBlog(blogId: string): Promise<void> {
    await this.pool.query<RowDataPacket[]>("DELETE FROM blogs WHERE id=?", [
      blogId,
    ]);
  }

  async getUserBlogs(userId: string): Promise<Blog[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM blogs WHERE userId = ?",
      [userId],
    );
    return rows[0] as Blog[];
  }

  async getComments(blogId: string): Promise<Comment[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM comments WHERE blogId = ?",
      [blogId],
    );
    return rows[0] as Comment[];
  }

  async createSpace(space: Space): Promise<void> {
    await this.pool.query<RowDataPacket[]>(
      "INSERT INTO spaces SET description=?, id=?, name=?, ownerId=?, status=?",
      [space.description, space.id, space.name, space.ownerId, space.status],
    );
  }

  getDefaultSpace(): Promise<Space | undefined> {
    throw new Error("Method not implemented.");
  }

  async getSpace(spaceId: string): Promise<Space | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM spaces WHERE id = ?",
      [spaceId],
    );
    return rows[0] as Space;
  }

  async updateSpace(space: Space): Promise<Space | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "UPDATE spaces SET name=?, status=?, description=? WHERE id=?",
      [space.name, space.status, space.description, space.id],
    );
    return rows[0] as Space;
  }

  async addMember(spaceId: string, memberId: string): Promise<void> {
    await this.pool.query<RowDataPacket[]>(
      "INSERT INTO members SET memberId=?, spaceId=?",
      [memberId, spaceId],
    );
  }

  async deleteSpace(spaceId: string): Promise<void> {
    await this.pool.query<RowDataPacket[]>("DELETE FROM spaces WHERE id=?", [
      spaceId,
    ]);
  }

  async getSpaces(userId: string): Promise<Space[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM spaces WHERE userId = ?",
      userId,
    );
    return rows[0] as Space[];
  }

  async createLike(like: Like): Promise<void> {
    await this.pool.query<RowDataPacket[]>(
      "INSERT INTO likes id=?, blogId=?, userId=?",
      [like.id, like.blogId, like.userId],
    );
  }

  async removeLike(like: Like): Promise<void> {
    const query = `
    DELETE FROM likes WHERE blogId=? AND userId=?,
    `;
    await this.pool.query<RowDataPacket[]>(query, [like.blogId, like.userId]);
  }
}

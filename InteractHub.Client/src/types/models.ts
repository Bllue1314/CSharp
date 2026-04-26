// src/types/models.ts
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export type User = {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export type Post = {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}

export type Comment = {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

export type Notification = {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  postId?: number;
}

export type FriendUser = {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}
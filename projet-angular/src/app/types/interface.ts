export interface Pet {
  id: number;
  name: string;
  /** Keycloak id of whoever published the listing. Set by the server. */
  ownerId?: string;
  ownerName?: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  gender: 'male' | 'female';
  color: string;
  description: string;
  imageUrl: string;
  isVaccinated: boolean;
  location: string;
  contactEmail: string;
  contactPhone: string;
  dateAdded: Date;
  likes: number;
  comments: Comment[];
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  /** Keycloak id of the author. Set by the server. */
  authorId?: string;
  datePublished: Date;
  likes: number;
  comments: Comment[];
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface Comment {
  id: number;
  /** Keycloak user id (UUID). */
  userId: string;
  userName: string;
  content: string;
  datePosted: Date;
}

export type SortOption = 'newest' | 'most-liked';

export interface Report {
  id: number;
  type: 'pet' | 'blog';
  itemId: number;
  itemTitle: string;
  /** Keycloak user id (UUID). */
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  dateReported: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

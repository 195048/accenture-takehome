// Shapes returned by JSONPlaceholder (the upstream API we proxy).

export interface Geo {
  lat: string;
  lng: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

// --- Enriched shapes: the server-side joins our API exposes ---

// GET /api/users/:id
export interface UserWithPosts extends User {
  posts: Post[];
}

// GET /api/posts/:id
export interface PostWithDetails extends Post {
  author: User;
  comments: Comment[];
}

// Envelope for the paginated posts list (GET /api/posts).
export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

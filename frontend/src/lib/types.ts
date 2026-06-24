// Frontend mirror of the backend's response shapes. Keeping these in sync with
// the API gives us type-safety all the way from the server to the components.

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
  phone: string;
  website: string;
  address: Address;
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

// Enriched shapes returned by the backend's join endpoints.
export interface UserWithPosts extends User {
  posts: Post[];
}

export interface PostWithDetails extends Post {
  author: User;
  comments: Comment[];
}

// Envelope returned by GET /api/posts.
export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

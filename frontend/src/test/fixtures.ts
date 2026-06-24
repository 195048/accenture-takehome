import type { Post, User } from "../lib/types";

export const testUsers: User[] = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "leanne@example.com",
    phone: "1-770-736-8031",
    website: "hildegard.org",
    address: {
      street: "Kulas Light",
      suite: "Apt. 556",
      city: "Gwenborough",
      zipcode: "92998-3874",
      geo: { lat: "-37.3159", lng: "81.1496" },
    },
    company: { name: "Romaguera-Crona", catchPhrase: "Multi-layered", bs: "harness e-markets" },
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "ervin@example.com",
    phone: "010-692-6593",
    website: "anastasia.net",
    address: {
      street: "Victor Plains",
      suite: "Suite 879",
      city: "Wisokyburgh",
      zipcode: "90566-7771",
      geo: { lat: "-43.9509", lng: "-34.4618" },
    },
    company: { name: "Deckow-Crist", catchPhrase: "Proactive", bs: "synergize markets" },
  },
];

export const testPosts: Post[] = [
  { userId: 1, id: 1, title: "alpha post", body: "first body" },
  { userId: 1, id: 2, title: "beta post", body: "second body" },
  { userId: 2, id: 3, title: "gamma article", body: "third body" },
];

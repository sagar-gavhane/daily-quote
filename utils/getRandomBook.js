// A curated list of influential books across various genres
const books = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Literary Fiction",
    yearPublished: 1960,
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian Fiction",
    yearPublished: 1949,
  },
  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    genre: "Self-Help",
    yearPublished: 1937,
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    genre: "Personal Development",
    yearPublished: 1989,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    yearPublished: 2011,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    yearPublished: 1988,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    yearPublished: 2018,
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    genre: "Spirituality",
    yearPublished: 1997,
  },
];

export function getRandomBook() {
  const randomIndex = Math.floor(Math.random() * books.length);
  return books[randomIndex];
}

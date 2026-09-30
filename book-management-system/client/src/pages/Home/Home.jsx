import { useContext } from "react";
import { BookContext } from "../../context/BookContext";

export const Home = () => {
  const { books, setBooks } = useContext(BookContext)
  console.log(books);
  return <div>Home</div>;
};

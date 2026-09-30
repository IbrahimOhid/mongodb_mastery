import { useState } from "react";
import { BookContext } from "./BookContext";

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    books,
    currentPage,
    isLoading,
    error,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

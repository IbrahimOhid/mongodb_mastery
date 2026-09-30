import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BookProvider } from "./context/BookProvider";

const App = () => {
  return (
    <div>
      <BookProvider>
        <Navbar />
        <main className="min-h-[calc(100vh-100px)] mt-16">
          <Outlet />
        </main>
        <Footer />
      </BookProvider>
    </div>
  );
};

export default App;

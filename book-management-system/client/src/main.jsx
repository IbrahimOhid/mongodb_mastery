import { BrowserRouter, Route, Routes } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Shop from "./pages/Shop.jsx";
import { Home } from "./pages/Home/Home.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Home/>} />
        <Route path="/books" element={<Shop/>} />
        <Route path="/ebooks" element={<div>ebooks Page</div>} />
        <Route path="/membership" element={<div>Membership Page</div>} />
        <Route path="/books/add" element={<div>Add Book Page</div>} />
      </Route>
    </Routes>
  </BrowserRouter>
);

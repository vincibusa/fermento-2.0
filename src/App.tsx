
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./Pages/HomePage";
import Menu from "./Pages/Menu";
import ReservationPage from "./Pages/ReservationPage";
import Gallery from "./Pages/Gallery";
import Footer from "./components/Footer";
import ContentWrapper from "./components/ContentWrapper";
import { NavbarProvider } from "./contexts/NavbarContenxt";
import RestaurantBlog from "./Pages/RestaurantBlog";
import LanguageSelector from "./components/LanguageSelector";



function App() {
  return (
    <NavbarProvider>
      <Navbar  />
      <ContentWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/reservation" element={<ReservationPage />} />
       
          <Route path="/galleria" element={<Gallery />} />
<Route path="/blog" element={<RestaurantBlog />} />
        </Routes>
  
      </ContentWrapper>
<LanguageSelector />
      <Footer />
    </NavbarProvider>
  );
}

export default App;

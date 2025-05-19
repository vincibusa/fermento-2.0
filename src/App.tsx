import { Routes, Route, useLocation } from "react-router-dom";
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
import LoginPage from "./Pages/LoginPage";
import SEOSchema from "./components/SEOSchema";
import { ShiftProvider } from "./contexts/ShiftContext";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isMenuPage = location.pathname === "/menu";
  const isBlogPage = location.pathname === "/blog";

  // Determina quale schema usare in base alla pagina corrente
  const getSchemaType = () => {
    if (isMenuPage) return "menu";
    if (isBlogPage) return "article";
    return "restaurant";
  };

  return (
    <NavbarProvider>
      <ShiftProvider>
        {/* Mostra la navbar solo se non è la pagina di login */}
        {!isLoginPage && <Navbar />}
        
        {/* Aggiungi il componente SEOSchema per i dati strutturati */}
        <SEOSchema type={getSchemaType()} />
        
        <ContentWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/reservation" element={<ReservationPage />} />
            <Route path="/galleria" element={<Gallery />} />
            <Route path="/blog" element={<RestaurantBlog />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </ContentWrapper>
        
        {/* Mostra il selettore di lingua e il footer solo se non è la pagina di login */}
        {!isLoginPage && <LanguageSelector />}
        {!isLoginPage && <Footer />}
      </ShiftProvider>
    </NavbarProvider>
  );
}

export default App;
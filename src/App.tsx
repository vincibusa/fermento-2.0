import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./Pages/HomePage";
import Menu from "./Pages/Menu";

import Gallery from "./Pages/Gallery";
import Footer from "./components/Footer";
import ContentWrapper from "./components/ContentWrapper";
import { NavbarProvider } from "./contexts/NavbarContenxt";
import RestaurantBlog from "./Pages/RestaurantBlog";
import LanguageSelector from "./components/LanguageSelector";

import SEOSchema from "./components/SEOSchema";


function App() {
  const location = useLocation();
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
        <Navbar />
        
        {/* Aggiungi il componente SEOSchema per i dati strutturati */}
        <SEOSchema type={getSchemaType()} />
        
        <ContentWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<Menu />} />

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
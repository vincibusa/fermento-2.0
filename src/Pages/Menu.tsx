import { useState } from "react";
import { FaPizzaSlice, FaWineGlass } from "react-icons/fa";
import { GiFullPizza, GiHotMeal } from "react-icons/gi";
import { BiDrink } from "react-icons/bi";

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("Pizze Classiche");

  const categories = [
    { name: "Pizze Classiche", icon: <FaPizzaSlice /> },
    { name: "Pizze Speciali", icon: <GiFullPizza /> },
    { name: "Calzoni", icon: <GiHotMeal /> },
    { name: "Antipasti", icon: <FaWineGlass /> },
    { name: "Bevande", icon: <BiDrink /> }
  ];

  const menuItems = [
    {
      category: "Pizze Classiche",
      items: [
        {
          name: "Margherita",
          description: "Pomodoro, mozzarella, basilico fresco",
          price: "€10",
          dietary: ["vegetarian"],
          image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"
        },
        {
          name: "Marinara",
          description: "Pomodoro, aglio, origano, olio d'oliva",
          price: "€9",
          dietary: ["vegan"],
          image:
            "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47"
        },
        {
          name: "Capricciosa",
          description:
            "Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi, olive",
          price: "€12",
          dietary: ["meat"],
          image:
            "https://images.unsplash.com/photo-1600273571173-a4a5c3c7ff21"
        },
        {
          name: "Quattro Formaggi",
          description:
            "Mozzarella, gorgonzola, parmigiano, fontina",
          price: "€11",
          dietary: ["vegetarian"],
          image:
            "https://images.unsplash.com/photo-1584642857260-26c0f14f8c0d"
        },
        {
          name: "Diavola",
          description:
            "Pomodoro, mozzarella, salame piccante",
          price: "€12",
          dietary: ["spicy"],
          image:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591"
        },
        {
          name: "Prosciutto e Funghi",
          description:
            "Mozzarella, prosciutto crudo, funghi porcini",
          price: "€13",
          dietary: ["meat"],
          image:
            "https://images.unsplash.com/photo-1594007650023-b2c514e8b5c8"
        },
        {
          name: "Napoli",
          description:
            "Pomodoro, mozzarella, acciughe, capperi, olive",
          price: "€11",
          dietary: ["pescatarian"],
          image:
            "https://images.unsplash.com/photo-1610129628831-2ae396bc4357"
        },
        {
          name: "Ortolana",
          description:
            "Mozzarella, verdure miste, pomodorini e basilico",
          price: "€10",
          dietary: ["vegan"],
          image:
            "https://images.unsplash.com/photo-1552332386-f8dd00dc2f95"
        }
      ]
    },
    {
      category: "Pizze Speciali",
      items: [
        {
          name: "Diavola",
          description:
            "Pomodoro, mozzarella, salame piccante",
          price: "€12",
          dietary: ["spicy"],
          image:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591"
        }
      ]
    }
  ];

  const filteredItems =
    menuItems.filter((cat) => cat.category === activeCategory)[0]?.items ||
    [];

  return (
    <div className="h-screen p-4 md:p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Sezione categorie fissa in alto */}
        <div className="mb-4">
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                    activeCategory === category.name
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "bg-card dark:bg-dark-card hover:bg-secondary/20 dark:hover:bg-dark-secondary/20"
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sezione scrollabile dei filtered items */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-4 border-b border-border dark:border-dark-border hover:bg-secondary/5 dark:hover:bg-dark-secondary/5 transition-colors duration-200 px-4"
            >
              <div className="flex-1">
                <h3 className="text-xl font-heading text-foreground dark:text-dark-foreground mb-1">
                  {item.name}
                </h3>
                <p className="text-accent dark:text-dark-accent text-sm mb-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.dietary.map((diet, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs rounded-full bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary"
                    >
                      {diet}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xl font-bold text-primary dark:text-dark-primary ml-4">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;

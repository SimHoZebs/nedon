const categoryStyle: {
  [key: string]: { icon: string; color: string } | undefined;
} = {
  Travel: { icon: "mdi:car-outline", color: "bg-yellow-300" },
  Taxi: { icon: "bx:taxi", color: "bg-yellow-300" },
  "Fast Food": { icon: "mdi:food", color: "bg-red-300" },
  "Food and Drink": {
    icon: "fluent:food-24-regular",
    color: "bg-blue-300",
  },
  "Airlines and Aviation Services": {
    icon: "mdi:airplane",
    color: "bg-teal-300",
  },
  "Coffee Shop": { icon: "mdi:coffee", color: "bg-orange-300" },
  Shops: { icon: "mdi:shopping-outline", color: "bg-green-300" },
  Payment: { icon: "mdi:exchange", color: "bg-green-300" },
  Transfer: { icon: "mdi:exchange", color: "bg-green-300" },
  "Gyms and Fitness Centers": {
    icon: "mingcute:fitness-line",
    color: "bg-green-300",
  },
  Recreation: {
    icon: "material-symbols:relax-outline",
    color: "bg-green-300",
  },
};

export default categoryStyle;

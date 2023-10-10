const categoryStyleArray: {
  [key: string]:
    | { icon: string; bgColor: string; textColor: string }
    | undefined;
} = {
  Travel: {
    icon: "mdi:car-outline",
    bgColor: "bg-purple-300",
    textColor: "text-yellow-300",
  },
  Taxi: {
    icon: "bx:taxi",
    bgColor: "bg-yellow-300",
    textColor: "text-yellow-300",
  },
  "Fast Food": {
    icon: "ion:fast-food-outline",
    bgColor: "bg-red-300",
    textColor: "text-red-300",
  },
  "Food and Drink": {
    icon: "fluent:food-24-regular",
    bgColor: "bg-yellow-300",
    textColor: "text-yellow-300",
  },
  "Airlines and Aviation Services": {
    icon: "lucide:plane-takeoff",
    bgColor: "bg-teal-300",
    textColor: "text-teal-300",
  },
  "Coffee Shop": {
    icon: "ci:coffee",
    bgColor: "bg-orange-300",
    textColor: "text-orange-300",
  },
  Shops: {
    icon: "mdi:shopping-outline",
    bgColor: "bg-green-300",
    textColor: "text-green-300",
  },
  Payment: {
    icon: "mdi:exchange",
    bgColor: "bg-zinc-300",
    textColor: "text-zinc-300",
  },
  Transfer: {
    icon: "mdi:exchange",
    bgColor: "bg-green-300",
    textColor: "text-green-300",
  },
  "Gyms and Fitness Centers": {
    icon: "mingcute:fitness-line",
    bgColor: "bg-green-300",
    textColor: "text-green-300",
  },
  Recreation: {
    icon: "material-symbols:relax-outline",
    bgColor: "bg-green-300",
    textColor: "text-green-300",
  },
  Overdraft: {
    icon: "ph:hand-coins-bold",
    bgColor: "bg-red-300",
    textColor: "text-red-300",
  },
  Rent: {
    icon: "tabler:home-dollar",
    bgColor: "bg-green-300",
    textColor: "text-green-300",
  },
  Deposit: {
    icon: "mdi:instant-deposit",
    bgColor: "bg-zinc-300",
    textColor: "text-zinc-300",
  },
  Restaurants: {
    icon: "material-symbols:food-bank-outline-rounded",
    bgColor: "bg-yellow-300",
    textColor: "text-yellow-300",
  },
  "Credit Card": {
    icon: "mdi:credit-card-outline",
    bgColor: "bg-yellow-300",
    textColor: "text-zinc-300",
  },
  Credit: {
    icon: "mdi:bank-outline",
    bgColor: "bg-orange-300",
    textColor: "text-orange-300",
  },
  Health: {
    icon: "akar-icons:health",
    bgColor: "bg-green-300",
    textColor: "text-green-300",
  },
  "Bank Fees": {
    icon: "mingcute:bank-line",
    bgColor: "bg-green-300",
    textColor: "text-green-300",
  },
  Unknown: {
    icon: "mdi:shape-outline",
    bgColor: "bg-zinc-400",
    textColor: "text-zinc-400",
  },
};

export default categoryStyleArray;

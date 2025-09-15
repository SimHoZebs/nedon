export const plaidCategories: {
  [primary: string]: {
    [detailed: string]: {
      description: string;
      icon: string;
      bgColor: string;
      textColor: string;
      border: string;
    };
  };
} = {
  INCOME: {
    INCOME_DIVIDENDS: {
      description: "Dividends from investment accounts",
      icon: "icon-[mdi--cash]",
      bgColor: "bg-green-300",
      textColor: "text-green-300",
      border: "border border-1 border-green-300",
    },
    INCOME_INTEREST_EARNED: {
      description: "Income from interest on savings accounts",
      icon: "icon-[mdi--cash]",
      bgColor: "bg-green-300",
      textColor: "text-green-300",
      border: "border border-1 border-green-300",
    },
    INCOME_RETIREMENT_PENSION: {
      description: "Income from pension payments",
      icon: "icon-[mdi--cash]",
      bgColor: "bg-green-300",
      textColor: "text-green-300",
      border: "border border-1 border-green-300",
    },
    INCOME_TAX_REFUND: {
      description: "Income from tax refunds",
      icon: "icon-[mdi--cash]",
      bgColor: "bg-green-300",
      textColor: "text-green-300",
      border: "border border-1 border-green-300",
    },
    INCOME_UNEMPLOYMENT: {
      description:
        "Income from unemployment benefits, including unemployment insurance and healthcare",
      icon: "icon-[mdi--cash]",
      bgColor: "bg-green-300",
      textColor: "text-green-300",
      border: "border border-1 border-green-300",
    },
    INCOME_WAGES: {
      description: "Income from salaries, gig-economy work, and tips earned",
      icon: "icon-[mdi--cash]",
      bgColor: "bg-green-300",
      textColor: "text-green-300",
      border: "border border-1 border-green-300",
    },
    INCOME_OTHER_INCOME: {
      description:
        "Other miscellaneous income, including alimony, social security, child support, and rental",
      icon: "icon-[mdi--cash]",
      bgColor: "bg-green-300",
      textColor: "text-green-300",
      border: "border border-1 border-green-300",
    },
  },
  TRANSFER_IN: {
    TRANSFER_IN_CASH_ADVANCES_AND_LOANS: {
      description: "Loans and cash advances deposited into a bank account",
      icon: "icon-[mdi--cash-plus]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    TRANSFER_IN_DEPOSIT: {
      description: "Cash, checks, and ATM deposits into a bank account",
      icon: "icon-[mdi--arrow-down]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS: {
      description: "Inbound transfers to an investment or retirement account",
      icon: "icon-[mdi--arrow-down]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    TRANSFER_IN_SAVINGS: {
      description: "Inbound transfers to a savings account",
      icon: "icon-[mdi--arrow-down]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    TRANSFER_IN_ACCOUNT_TRANSFER: {
      description: "General inbound transfers from another account",
      icon: "icon-[mdi--arrow-down]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    TRANSFER_IN_OTHER_TRANSFER_IN: {
      description: "Other miscellaneous inbound transactions",
      icon: "icon-[mdi--arrow-down]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
  },
  TRANSFER_OUT: {
    TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS: {
      description:
        "Transfers to an investment or retirement account, including investment apps such as Acorns, Betterment",
      icon: "icon-[mdi--arrow-up]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    TRANSFER_OUT_SAVINGS: {
      description: "Outbound transfers to savings accounts",
      icon: "icon-[mdi--arrow-up]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    TRANSFER_OUT_WITHDRAWAL: {
      description: "Withdrawals from a bank account",
      icon: "icon-[mdi--arrow-up]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    TRANSFER_OUT_ACCOUNT_TRANSFER: {
      description: "General outbound transfers to another account",
      icon: "icon-[mdi--arrow-up]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    TRANSFER_OUT_OTHER_TRANSFER_OUT: {
      description: "Other miscellaneous outbound transactions",
      icon: "icon-[mdi--arrow-up]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
  },
  LOAN_PAYMENTS: {
    LOAN_PAYMENTS_CAR_PAYMENT: {
      description: "Car loans and leases",
      icon: "icon-[mdi--credit-card]",
      bgColor: "bg-orange-300",
      textColor: "text-orange-300",
      border: "border border-1 border-orange-300",
    },
    LOAN_PAYMENTS_CREDIT_CARD_PAYMENT: {
      description:
        "Payments to a credit card. These are positive amounts for credit card subtypes and negative for depository subtypes",
      icon: "icon-[mdi--credit-card]",
      bgColor: "bg-orange-300",
      textColor: "text-orange-300",
      border: "border border-1 border-orange-300",
    },
    LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT: {
      description:
        "Personal loans, including cash advances and buy now pay later repayments",
      icon: "icon-[mdi--credit-card]",
      bgColor: "bg-orange-300",
      textColor: "text-orange-300",
      border: "border border-1 border-orange-300",
    },
    LOAN_PAYMENTS_MORTGAGE_PAYMENT: {
      description: "Payments on mortgages",
      icon: "icon-[mdi--credit-card]",
      bgColor: "bg-orange-300",
      textColor: "text-orange-300",
      border: "border border-1 border-orange-300",
    },
    LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT: {
      description:
        "Payments on student loans. For college tuition, refer to General Services - Education",
      icon: "icon-[mdi--credit-card]",
      bgColor: "bg-orange-300",
      textColor: "text-orange-300",
      border: "border border-1 border-orange-300",
    },
    LOAN_PAYMENTS_OTHER_PAYMENT: {
      description: "Other miscellaneous debt payments",
      icon: "icon-[mdi--credit-card]",
      bgColor: "bg-orange-300",
      textColor: "text-orange-300",
      border: "border border-1 border-orange-300",
    },
  },
  BANK_FEES: {
    BANK_FEES_ATM_FEES: {
      description: "Fees incurred for out-of-network ATMs",
      icon: "icon-[mdi--bank]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    BANK_FEES_FOREIGN_TRANSACTION_FEES: {
      description: "Fees incurred on non-domestic transactions",
      icon: "icon-[mdi--bank]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    BANK_FEES_INSUFFICIENT_FUNDS: {
      description: "Fees relating to insufficient funds",
      icon: "icon-[mdi--bank]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    BANK_FEES_INTEREST_CHARGE: {
      description:
        "Fees incurred for interest on purchases, including not-paid-in-full or interest on cash advances",
      icon: "icon-[mdi--bank]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    BANK_FEES_OVERDRAFT_FEES: {
      description: "Fees incurred when an account is in overdraft",
      icon: "icon-[mdi--bank]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    BANK_FEES_OTHER_BANK_FEES: {
      description: "Other miscellaneous bank fees",
      icon: "icon-[mdi--bank]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
  },
  ENTERTAINMENT: {
    ENTERTAINMENT_CASINOS_AND_GAMBLING: {
      description: "Gambling, casinos, and sports betting",
      icon: "icon-[mdi--movie]",
      bgColor: "bg-purple-300",
      textColor: "text-purple-300",
      border: "border border-1 border-purple-300",
    },
    ENTERTAINMENT_MUSIC_AND_AUDIO: {
      description:
        "Digital and in-person music purchases, including music streaming services",
      icon: "icon-[mdi--movie]",
      bgColor: "bg-purple-300",
      textColor: "text-purple-300",
      border: "border border-1 border-purple-300",
    },
    ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS: {
      description:
        "Purchases made at sporting events, music venues, concerts, museums, and amusement parks",
      icon: "icon-[mdi--movie]",
      bgColor: "bg-purple-300",
      textColor: "text-purple-300",
      border: "border border-1 border-purple-300",
    },
    ENTERTAINMENT_TV_AND_MOVIES: {
      description: "In home movie streaming services and movie theaters",
      icon: "icon-[mdi--movie]",
      bgColor: "bg-purple-300",
      textColor: "text-purple-300",
      border: "border border-1 border-purple-300",
    },
    ENTERTAINMENT_VIDEO_GAMES: {
      description: "Digital and in-person video game purchases",
      icon: "icon-[mdi--movie]",
      bgColor: "bg-purple-300",
      textColor: "text-purple-300",
      border: "border border-1 border-purple-300",
    },
    ENTERTAINMENT_OTHER_ENTERTAINMENT: {
      description:
        "Other miscellaneous entertainment purchases, including night life and adult entertainment",
      icon: "icon-[mdi--movie]",
      bgColor: "bg-purple-300",
      textColor: "text-purple-300",
      border: "border border-1 border-purple-300",
    },
  },
  FOOD_AND_DRINK: {
    FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR: {
      description: "Beer, Wine & Liquor Stores",
      icon: "icon-[mdi--food]",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-300",
      border: "border border-1 border-yellow-300",
    },
    FOOD_AND_DRINK_COFFEE: {
      description: "Purchases at coffee shops or cafes",
      icon: "icon-[mdi--food]",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-300",
      border: "border border-1 border-yellow-300",
    },
    FOOD_AND_DRINK_FAST_FOOD: {
      description: "Dining expenses for fast food chains",
      icon: "icon-[mdi--food]",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-300",
      border: "border border-1 border-yellow-300",
    },
    FOOD_AND_DRINK_GROCERIES: {
      description:
        "Purchases for fresh produce and groceries, including farmers' markets",
      icon: "icon-[mdi--food]",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-300",
      border: "border border-1 border-yellow-300",
    },
    FOOD_AND_DRINK_RESTAURANT: {
      description:
        "Dining expenses for restaurants, bars, gastropubs, and diners",
      icon: "icon-[mdi--food]",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-300",
      border: "border border-1 border-yellow-300",
    },
    FOOD_AND_DRINK_VENDING_MACHINES: {
      description: "Purchases made at vending machine operators",
      icon: "icon-[mdi--food]",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-300",
      border: "border border-1 border-yellow-300",
    },
    FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK: {
      description:
        "Other miscellaneous food and drink, including desserts, juice bars, and delis",
      icon: "icon-[mdi--food]",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-300",
      border: "border border-1 border-yellow-300",
    },
  },
  GENERAL_MERCHANDISE: {
    GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS: {
      description: "Books, magazines, and news",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES: {
      description: "Apparel, shoes, and jewelry",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_CONVENIENCE_STORES: {
      description: "Purchases at convenience stores",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_DEPARTMENT_STORES: {
      description:
        "Retail stores with wide ranges of consumer goods, typically specializing in clothing and home goods",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_DISCOUNT_STORES: {
      description: "Stores selling goods at a discounted price",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_ELECTRONICS: {
      description: "Electronics stores and websites",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES: {
      description: "Photo, gifts, cards, and floral stores",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_OFFICE_SUPPLIES: {
      description: "Stores that specialize in office goods",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_ONLINE_MARKETPLACES: {
      description:
        "Multi-purpose e-commerce platforms such as Etsy, Ebay and Amazon",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_PET_SUPPLIES: {
      description: "Pet supplies and pet food",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_SPORTING_GOODS: {
      description: "Sporting goods, camping gear, and outdoor equipment",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_SUPERSTORES: {
      description:
        "Superstores such as Target and Walmart, selling both groceries and general merchandise",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_TOBACCO_AND_VAPE: {
      description: "Purchases for tobacco and vaping products",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
    GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE: {
      description:
        "Other miscellaneous merchandise, including toys, hobbies, and arts and crafts",
      icon: "icon-[mdi--shopping]",
      bgColor: "bg-indigo-300",
      textColor: "text-indigo-300",
      border: "border border-1 border-indigo-300",
    },
  },
  HOME_IMPROVEMENT: {
    HOME_IMPROVEMENT_FURNITURE: {
      description: "Furniture, bedding, and home accessories",
      icon: "icon-[mdi--hammer-wrench]",
      bgColor: "bg-amber-300",
      textColor: "text-amber-300",
      border: "border border-1 border-amber-300",
    },
    HOME_IMPROVEMENT_HARDWARE: {
      description: "Building materials, hardware stores, paint, and wallpaper",
      icon: "icon-[mdi--hammer-wrench]",
      bgColor: "bg-amber-300",
      textColor: "text-amber-300",
      border: "border border-1 border-amber-300",
    },
    HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE: {
      description: "Plumbing, lighting, gardening, and roofing",
      icon: "icon-[mdi--hammer-wrench]",
      bgColor: "bg-amber-300",
      textColor: "text-amber-300",
      border: "border border-1 border-amber-300",
    },
    HOME_IMPROVEMENT_SECURITY: {
      description: "Home security system purchases",
      icon: "icon-[mdi--hammer-wrench]",
      bgColor: "bg-amber-300",
      textColor: "text-amber-300",
      border: "border border-1 border-amber-300",
    },
    HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT: {
      description:
        "Other miscellaneous home purchases, including pool installation and pest control",
      icon: "icon-[mdi--hammer-wrench]",
      bgColor: "bg-amber-300",
      textColor: "text-amber-300",
      border: "border border-1 border-amber-300",
    },
  },
  MEDICAL: {
    MEDICAL_DENTAL_CARE: {
      description: "Dentists and general dental care",
      icon: "icon-[mdi--medical-bag]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    MEDICAL_EYE_CARE: {
      description: "Optometrists, contacts, and glasses stores",
      icon: "icon-[mdi--medical-bag]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    MEDICAL_NURSING_CARE: {
      description: "Nursing care and facilities",
      icon: "icon-[mdi--medical-bag]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    MEDICAL_PHARMACIES_AND_SUPPLEMENTS: {
      description: "Pharmacies and nutrition shops",
      icon: "icon-[mdi--medical-bag]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    MEDICAL_PRIMARY_CARE: {
      description: "Doctors and physicians",
      icon: "icon-[mdi--medical-bag]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    MEDICAL_VETERINARY_SERVICES: {
      description: "Prevention and care procedures for animals",
      icon: "icon-[mdi--medical-bag]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
    MEDICAL_OTHER_MEDICAL: {
      description:
        "Other miscellaneous medical, including blood work, hospitals, and ambulances",
      icon: "icon-[mdi--medical-bag]",
      bgColor: "bg-red-300",
      textColor: "text-red-300",
      border: "border border-1 border-red-300",
    },
  },
  PERSONAL_CARE: {
    PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS: {
      description: "Gyms, fitness centers, and workout classes",
      icon: "icon-[mdi--dumbbell]",
      bgColor: "bg-pink-300",
      textColor: "text-pink-300",
      border: "border border-1 border-pink-300",
    },
    PERSONAL_CARE_HAIR_AND_BEAUTY: {
      description:
        "Manicures, haircuts, waxing, spa/massages, and bath and beauty products",
      icon: "icon-[mdi--content-cut]",
      bgColor: "bg-pink-300",
      textColor: "text-pink-300",
      border: "border border-1 border-pink-300",
    },
    PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING: {
      description: "Wash and fold, and dry cleaning expenses",
      icon: "icon-[mdi--washing-machine]",
      bgColor: "bg-pink-300",
      textColor: "text-pink-300",
      border: "border border-1 border-pink-300",
    },
    PERSONAL_CARE_OTHER_PERSONAL_CARE: {
      description:
        "Other miscellaneous personal care, including mental health apps and services",
      icon: "icon-[mdi--account-heart]",
      bgColor: "bg-pink-300",
      textColor: "text-pink-300",
      border: "border border-1 border-pink-300",
    },
  },
  GENERAL_SERVICES: {
    GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING: {
      description: "Financial planning, and tax and accounting services",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_AUTOMOTIVE: {
      description: "Oil changes, car washes, repairs, and towing",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_CHILDCARE: {
      description: "Babysitters and daycare",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_CONSULTING_AND_LEGAL: {
      description: "Consulting and legal services",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_EDUCATION: {
      description:
        "Elementary, high school, professional schools, and college tuition",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_INSURANCE: {
      description: "Insurance for auto, home, and healthcare",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_POSTAGE_AND_SHIPPING: {
      description: "Mail, packaging, and shipping services",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_STORAGE: {
      description: "Storage services and facilities",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    GENERAL_SERVICES_OTHER_GENERAL_SERVICES: {
      description:
        "Other miscellaneous services, including advertising and cloud storage",
      icon: "icon-[mdi--wrench]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
  },
  GOVERNMENT_AND_NON_PROFIT: {
    GOVERNMENT_AND_NON_PROFIT_DONATIONS: {
      description: "Charitable, political, and religious donations",
      icon: "icon-[mdi--government]",
      bgColor: "bg-slate-300",
      textColor: "text-slate-300",
      border: "border border-1 border-slate-300",
    },
    GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES: {
      description:
        "Government departments and agencies, such as driving licences, and passport renewal",
      icon: "icon-[mdi--government]",
      bgColor: "bg-slate-300",
      textColor: "text-slate-300",
      border: "border border-1 border-slate-300",
    },
    GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT: {
      description: "Tax payments, including income and property taxes",
      icon: "icon-[mdi--government]",
      bgColor: "bg-slate-300",
      textColor: "text-slate-300",
      border: "border border-1 border-slate-300",
    },
    GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT: {
      description: "Other miscellaneous government and non-profit agencies",
      icon: "icon-[mdi--government]",
      bgColor: "bg-slate-300",
      textColor: "text-slate-300",
      border: "border border-1 border-slate-300",
    },
  },
  TRANSPORTATION: {
    TRANSPORTATION_BIKES_AND_SCOOTERS: {
      description: "Bike and scooter rentals",
      icon: "icon-[mdi--car]",
      bgColor: "bg-cyan-300",
      textColor: "text-cyan-300",
      border: "border border-1 border-cyan-300",
    },
    TRANSPORTATION_GAS: {
      description: "Purchases at a gas station",
      icon: "icon-[mdi--car]",
      bgColor: "bg-cyan-300",
      textColor: "text-cyan-300",
      border: "border border-1 border-cyan-300",
    },
    TRANSPORTATION_PARKING: {
      description: "Parking fees and expenses",
      icon: "icon-[mdi--car]",
      bgColor: "bg-cyan-300",
      textColor: "text-cyan-300",
      border: "border border-1 border-cyan-300",
    },
    TRANSPORTATION_PUBLIC_TRANSIT: {
      description:
        "Public transportation, including rail and train, buses, and metro",
      icon: "icon-[mdi--car]",
      bgColor: "bg-cyan-300",
      textColor: "text-cyan-300",
      border: "border border-1 border-cyan-300",
    },
    TRANSPORTATION_TAXIS_AND_RIDE_SHARES: {
      description: "Taxi and ride share services",
      icon: "icon-[mdi--car]",
      bgColor: "bg-cyan-300",
      textColor: "text-cyan-300",
      border: "border border-1 border-cyan-300",
    },
    TRANSPORTATION_TOLLS: {
      description: "Toll expenses",
      icon: "icon-[mdi--car]",
      bgColor: "bg-cyan-300",
      textColor: "text-cyan-300",
      border: "border border-1 border-cyan-300",
    },
    TRANSPORTATION_OTHER_TRANSPORTATION: {
      description: "Other miscellaneous transportation expenses",
      icon: "icon-[mdi--car]",
      bgColor: "bg-cyan-300",
      textColor: "text-cyan-300",
      border: "border border-1 border-cyan-300",
    },
  },
  TRAVEL: {
    TRAVEL_FLIGHTS: {
      description: "Airline expenses",
      icon: "icon-[mdi--airplane]",
      bgColor: "bg-teal-300",
      textColor: "text-teal-300",
      border: "border border-1 border-teal-300",
    },
    TRAVEL_LODGING: {
      description: "Hotels, motels, and hosted accommodation such as Airbnb",
      icon: "icon-[mdi--airplane]",
      bgColor: "bg-teal-300",
      textColor: "text-teal-300",
      border: "border border-1 border-teal-300",
    },
    TRAVEL_RENTAL_CARS: {
      description: "Rental cars, charter buses, and trucks",
      icon: "icon-[mdi--airplane]",
      bgColor: "bg-teal-300",
      textColor: "text-teal-300",
      border: "border border-1 border-teal-300",
    },
    TRAVEL_OTHER_TRAVEL: {
      description: "Other miscellaneous travel expenses",
      icon: "icon-[mdi--airplane]",
      bgColor: "bg-teal-300",
      textColor: "text-teal-300",
      border: "border border-1 border-teal-300",
    },
  },
  RENT_AND_UTILITIES: {
    RENT_AND_UTILITIES_GAS_AND_ELECTRICITY: {
      description: "Gas and electricity bills",
      icon: "icon-[mdi--home]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    RENT_AND_UTILITIES_INTERNET_AND_CABLE: {
      description: "Internet and cable bills",
      icon: "icon-[mdi--home]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    RENT_AND_UTILITIES_RENT: {
      description: "Rent payment",
      icon: "icon-[mdi--home]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT: {
      description: "Sewage and garbage disposal bills",
      icon: "icon-[mdi--home]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    RENT_AND_UTILITIES_TELEPHONE: {
      description: "Cell phone bills",
      icon: "icon-[mdi--home]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    RENT_AND_UTILITIES_WATER: {
      description: "Water bills",
      icon: "icon-[mdi--home]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
    RENT_AND_UTILITIES_OTHER_UTILITIES: {
      description: "Other miscellaneous utility bills",
      icon: "icon-[mdi--home]",
      bgColor: "bg-blue-300",
      textColor: "text-blue-300",
      border: "border border-1 border-blue-300",
    },
  },
} as const;

export type PlaidCat = typeof plaidCategories;

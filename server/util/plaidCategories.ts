export type PlaidCategory = {
  [key: string]: {
    [key: string]: {
      description: string;
    };
  };
};
export const plaidCategories: PlaidCategory = {
  INCOME: {
    INCOME_DIVIDENDS: {
      description: "Dividends from investment accounts",
    },
    INCOME_INTEREST_EARNED: {
      description: "Income from interest on savings accounts",
    },
    INCOME_RETIREMENT_PENSION: {
      description: "Income from pension payments",
    },
    INCOME_TAX_REFUND: {
      description: "Income from tax refunds",
    },
    INCOME_UNEMPLOYMENT: {
      description:
        "Income from unemployment benefits, including unemployment insurance and healthcare",
    },
    INCOME_WAGES: {
      description: "Income from salaries, gig-economy work, and tips earned",
    },
    INCOME_OTHER_INCOME: {
      description:
        "Other miscellaneous income, including alimony, social security, child support, and rental",
    },
  },
  TRANSFER_IN: {
    TRANSFER_IN_CASH_ADVANCES_AND_LOANS: {
      description: "Loans and cash advances deposited into a bank account",
    },
    TRANSFER_IN_DEPOSIT: {
      description: "Cash, checks, and ATM deposits into a bank account",
    },
    TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS: {
      description: "Inbound transfers to an investment or retirement account",
    },
    TRANSFER_IN_SAVINGS: {
      description: "Inbound transfers to a savings account",
    },
    TRANSFER_IN_ACCOUNT_TRANSFER: {
      description: "General inbound transfers from another account",
    },
    TRANSFER_IN_OTHER_TRANSFER_IN: {
      description: "Other miscellaneous inbound transactions",
    },
  },
  TRANSFER_OUT: {
    TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS: {
      description:
        "Transfers to an investment or retirement account, including investment apps such as Acorns, Betterment",
    },
    TRANSFER_OUT_SAVINGS: {
      description: "Outbound transfers to savings accounts",
    },
    TRANSFER_OUT_WITHDRAWAL: {
      description: "Withdrawals from a bank account",
    },
    TRANSFER_OUT_ACCOUNT_TRANSFER: {
      description: "General outbound transfers to another account",
    },
    TRANSFER_OUT_OTHER_TRANSFER_OUT: {
      description: "Other miscellaneous outbound transactions",
    },
  },
  LOAN_PAYMENTS: {
    LOAN_PAYMENTS_CAR_PAYMENT: {
      description: "Car loans and leases",
    },
    LOAN_PAYMENTS_CREDIT_CARD_PAYMENT: {
      description:
        "Payments to a credit card. These are positive amounts for credit card subtypes and negative for depository subtypes",
    },
    LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT: {
      description:
        "Personal loans, including cash advances and buy now pay later repayments",
    },
    LOAN_PAYMENTS_MORTGAGE_PAYMENT: {
      description: "Payments on mortgages",
    },
    LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT: {
      description:
        "Payments on student loans. For college tuition, refer to General Services - Education",
    },
    LOAN_PAYMENTS_OTHER_PAYMENT: {
      description: "Other miscellaneous debt payments",
    },
  },
  BANK_FEES: {
    BANK_FEES_ATM_FEES: {
      description: "Fees incurred for out-of-network ATMs",
    },
    BANK_FEES_FOREIGN_TRANSACTION_FEES: {
      description: "Fees incurred on non-domestic transactions",
    },
    BANK_FEES_INSUFFICIENT_FUNDS: {
      description: "Fees relating to insufficient funds",
    },
    BANK_FEES_INTEREST_CHARGE: {
      description:
        "Fees incurred for interest on purchases, including not-paid-in-full or interest on cash advances",
    },
    BANK_FEES_OVERDRAFT_FEES: {
      description: "Fees incurred when an account is in overdraft",
    },
    BANK_FEES_OTHER_BANK_FEES: {
      description: "Other miscellaneous bank fees",
    },
  },
  ENTERTAINMENT: {
    ENTERTAINMENT_CASINOS_AND_GAMBLING: {
      description: "Gambling, casinos, and sports betting",
    },
    ENTERTAINMENT_MUSIC_AND_AUDIO: {
      description:
        "Digital and in-person music purchases, including music streaming services",
    },
    ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS: {
      description:
        "Purchases made at sporting events, music venues, concerts, museums, and amusement parks",
    },
    ENTERTAINMENT_TV_AND_MOVIES: {
      description: "In home movie streaming services and movie theaters",
    },
    ENTERTAINMENT_VIDEO_GAMES: {
      description: "Digital and in-person video game purchases",
    },
    ENTERTAINMENT_OTHER_ENTERTAINMENT: {
      description:
        "Other miscellaneous entertainment purchases, including night life and adult entertainment",
    },
  },
  FOOD_AND_DRINK: {
    FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR: {
      description: "Beer, Wine & Liquor Stores",
    },
    FOOD_AND_DRINK_COFFEE: {
      description: "Purchases at coffee shops or cafes",
    },
    FOOD_AND_DRINK_FAST_FOOD: {
      description: "Dining expenses for fast food chains",
    },
    FOOD_AND_DRINK_GROCERIES: {
      description:
        "Purchases for fresh produce and groceries, including farmers' markets",
    },
    FOOD_AND_DRINK_RESTAURANT: {
      description:
        "Dining expenses for restaurants, bars, gastropubs, and diners",
    },
    FOOD_AND_DRINK_VENDING_MACHINES: {
      description: "Purchases made at vending machine operators",
    },
    FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK: {
      description:
        "Other miscellaneous food and drink, including desserts, juice bars, and delis",
    },
  },
  GENERAL_MERCHANDISE: {
    GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS: {
      description: "Books, magazines, and news",
    },
    GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES: {
      description: "Apparel, shoes, and jewelry",
    },
    GENERAL_MERCHANDISE_CONVENIENCE_STORES: {
      description: "Purchases at convenience stores",
    },
    GENERAL_MERCHANDISE_DEPARTMENT_STORES: {
      description:
        "Retail stores with wide ranges of consumer goods, typically specializing in clothing and home goods",
    },
    GENERAL_MERCHANDISE_DISCOUNT_STORES: {
      description: "Stores selling goods at a discounted price",
    },
    GENERAL_MERCHANDISE_ELECTRONICS: {
      description: "Electronics stores and websites",
    },
    GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES: {
      description: "Photo, gifts, cards, and floral stores",
    },
    GENERAL_MERCHANDISE_OFFICE_SUPPLIES: {
      description: "Stores that specialize in office goods",
    },
    GENERAL_MERCHANDISE_ONLINE_MARKETPLACES: {
      description:
        "Multi-purpose e-commerce platforms such as Etsy, Ebay and Amazon",
    },
    GENERAL_MERCHANDISE_PET_SUPPLIES: {
      description: "Pet supplies and pet food",
    },
    GENERAL_MERCHANDISE_SPORTING_GOODS: {
      description: "Sporting goods, camping gear, and outdoor equipment",
    },
    GENERAL_MERCHANDISE_SUPERSTORES: {
      description:
        "Superstores such as Target and Walmart, selling both groceries and general merchandise",
    },
    GENERAL_MERCHANDISE_TOBACCO_AND_VAPE: {
      description: "Purchases for tobacco and vaping products",
    },
    GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE: {
      description:
        "Other miscellaneous merchandise, including toys, hobbies, and arts and crafts",
    },
  },
  HOME_IMPROVEMENT: {
    HOME_IMPROVEMENT_FURNITURE: {
      description: "Furniture, bedding, and home accessories",
    },
    HOME_IMPROVEMENT_HARDWARE: {
      description: "Building materials, hardware stores, paint, and wallpaper",
    },
    HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE: {
      description: "Plumbing, lighting, gardening, and roofing",
    },
    HOME_IMPROVEMENT_SECURITY: {
      description: "Home security system purchases",
    },
    HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT: {
      description:
        "Other miscellaneous home purchases, including pool installation and pest control",
    },
  },
  MEDICAL: {
    MEDICAL_DENTAL_CARE: {
      description: "Dentists and general dental care",
    },
    MEDICAL_EYE_CARE: {
      description: "Optometrists, contacts, and glasses stores",
    },
    MEDICAL_NURSING_CARE: {
      description: "Nursing care and facilities",
    },
    MEDICAL_PHARMACIES_AND_SUPPLEMENTS: {
      description: "Pharmacies and nutrition shops",
    },
    MEDICAL_PRIMARY_CARE: {
      description: "Doctors and physicians",
    },
    MEDICAL_VETERINARY_SERVICES: {
      description: "Prevention and care procedures for animals",
    },
    MEDICAL_OTHER_MEDICAL: {
      description:
        "Other miscellaneous medical, including blood work, hospitals, and ambulances",
    },
  },
  PERSONAL_CARE: {
    PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS: {
      description: "Gyms, fitness centers, and workout classes",
    },
    PERSONAL_CARE_HAIR_AND_BEAUTY: {
      description:
        "Manicures, haircuts, waxing, spa/massages, and bath and beauty products",
    },
    PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING: {
      description: "Wash and fold, and dry cleaning expenses",
    },
    PERSONAL_CARE_OTHER_PERSONAL_CARE: {
      description:
        "Other miscellaneous personal care, including mental health apps and services",
    },
  },
  GENERAL_SERVICES: {
    GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING: {
      description: "Financial planning, and tax and accounting services",
    },
    GENERAL_SERVICES_AUTOMOTIVE: {
      description: "Oil changes, car washes, repairs, and towing",
    },
    GENERAL_SERVICES_CHILDCARE: {
      description: "Babysitters and daycare",
    },
    GENERAL_SERVICES_CONSULTING_AND_LEGAL: {
      description: "Consulting and legal services",
    },
    GENERAL_SERVICES_EDUCATION: {
      description:
        "Elementary, high school, professional schools, and college tuition",
    },
    GENERAL_SERVICES_INSURANCE: {
      description: "Insurance for auto, home, and healthcare",
    },
    GENERAL_SERVICES_POSTAGE_AND_SHIPPING: {
      description: "Mail, packaging, and shipping services",
    },
    GENERAL_SERVICES_STORAGE: {
      description: "Storage services and facilities",
    },
    GENERAL_SERVICES_OTHER_GENERAL_SERVICES: {
      description:
        "Other miscellaneous services, including advertising and cloud storage",
    },
  },
  GOVERNMENT_AND_NON_PROFIT: {
    GOVERNMENT_AND_NON_PROFIT_DONATIONS: {
      description: "Charitable, political, and religious donations",
    },
    GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES: {
      description:
        "Government departments and agencies, such as driving licences, and passport renewal",
    },
    GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT: {
      description: "Tax payments, including income and property taxes",
    },
    GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT: {
      description: "Other miscellaneous government and non-profit agencies",
    },
  },
  TRANSPORTATION: {
    TRANSPORTATION_BIKES_AND_SCOOTERS: {
      description: "Bike and scooter rentals",
    },
    TRANSPORTATION_GAS: {
      description: "Purchases at a gas station",
    },
    TRANSPORTATION_PARKING: {
      description: "Parking fees and expenses",
    },
    TRANSPORTATION_PUBLIC_TRANSIT: {
      description:
        "Public transportation, including rail and train, buses, and metro",
    },
    TRANSPORTATION_TAXIS_AND_RIDE_SHARES: {
      description: "Taxi and ride share services",
    },
    TRANSPORTATION_TOLLS: {
      description: "Toll expenses",
    },
    TRANSPORTATION_OTHER_TRANSPORTATION: {
      description: "Other miscellaneous transportation expenses",
    },
  },
  TRAVEL: {
    TRAVEL_FLIGHTS: {
      description: "Airline expenses",
    },
    TRAVEL_LODGING: {
      description: "Hotels, motels, and hosted accommodation such as Airbnb",
    },
    TRAVEL_RENTAL_CARS: {
      description: "Rental cars, charter buses, and trucks",
    },
    TRAVEL_OTHER_TRAVEL: {
      description: "Other miscellaneous travel expenses",
    },
  },
  RENT_AND_UTILITIES: {
    RENT_AND_UTILITIES_GAS_AND_ELECTRICITY: {
      description: "Gas and electricity bills",
    },
    RENT_AND_UTILITIES_INTERNET_AND_CABLE: {
      description: "Internet and cable bills",
    },
    RENT_AND_UTILITIES_RENT: {
      description: "Rent payment",
    },
    RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT: {
      description: "Sewage and garbage disposal bills",
    },
    RENT_AND_UTILITIES_TELEPHONE: {
      description: "Cell phone bills",
    },
    RENT_AND_UTILITIES_WATER: {
      description: "Water bills",
    },
    RENT_AND_UTILITIES_OTHER_UTILITIES: {
      description: "Other miscellaneous utility bills",
    },
  },
};

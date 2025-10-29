import type { Project } from "../storage/types";

export const coffeeShopExample: Project = {
  version: 1,
  id: "example-coffee-shop",
  name: "☕️ Coffee Shop Example",
  description: "A coffee shop selling artisan coffee specialities as well as a selection of pastries and baked goods.",
  currency: "GBP",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  upfrontCosts: [
    {
      id: "coffee-machine",
      name: "Coffee Machine",
      amount: 16000,
      projectId: "example-coffee-shop"
    }
  ],
  productSales: {
    "espresso": {
      volume: 40,
      period: "daily"
    },
    "cappuccino": {
      volume: 80,
      period: "daily"
    },
    "croissant": {
      volume: 30,
      period: "daily"
    }
  },
  fixedCosts: [
    {
      id: "rent",
      name: "Shop Rent",
      amount: 2500,
      frequency: "monthly",
      category: "premises",
      projectId: "example-coffee-shop"
    },
    {
      id: "utilities",
      name: "Utilities (Electricity, Water, Internet)",
      amount: 800,
      frequency: "monthly",
      category: "premises",
      projectId: "example-coffee-shop"
    },
    {
      id: "insurance",
      name: "Business Insurance",
      amount: 150,
      frequency: "monthly",
      category: "insurance",
      projectId: "example-coffee-shop"
    },
    {
      id: "staff-1",
      name: "Barista (Full-time)",
      amount: 2200,
      frequency: "monthly",
      category: "staff",
      projectId: "example-coffee-shop"
    },
    {
      id: "staff-2",
      name: "Barista (Part-time)",
      amount: 1200,
      frequency: "monthly",
      category: "staff",
      projectId: "example-coffee-shop"
    },
    {
      id: "equipment",
      name: "Coffee Machine Maintenance",
      amount: 200,
      frequency: "monthly",
      category: "equipment",
      projectId: "example-coffee-shop"
    }
  ],
  products: [
    {
      id: "espresso",
      name: "☕️ Espresso",
      price: 2.50,
      projectId: "example-coffee-shop",
      associatedCosts: [
        {
          id: "espresso-beans",
          name: "Coffee Beans",
          amount: 0.30,
          productId: "espresso",
          projectId: "example-coffee-shop"
        },
        {
          id: "espresso-cup",
          name: "Cup & Lid",
          amount: 0.15,
          productId: "espresso",
          projectId: "example-coffee-shop"
        }
      ]
    },
    {
      id: "cappuccino",
      name: "☕️🥛 Cappuccino",
      price: 3.50,
      projectId: "example-coffee-shop",
      associatedCosts: [
        {
          id: "cappuccino-beans",
          name: "Coffee Beans",
          amount: 0.30,
          productId: "cappuccino",
          projectId: "example-coffee-shop"
        },
        {
          id: "cappuccino-milk",
          name: "Milk",
          amount: 0.25,
          productId: "cappuccino",
          projectId: "example-coffee-shop"
        },
        {
          id: "cappuccino-cup",
          name: "Cup & Lid",
          amount: 0.15,
          productId: "cappuccino",
          projectId: "example-coffee-shop"
        }
      ]
    },
    {
      id: "croissant",
      name: "🥐 Croissant",
      price: 2.80,
      projectId: "example-coffee-shop",
      associatedCosts: [
        {
          id: "croissant-cost",
          name: "Wholesale Croissant Cost",
          amount: 0.80,
          productId: "croissant",
          projectId: "example-coffee-shop"
        },
        {
          id: "croissant-packaging",
          name: "Packaging",
          amount: 0.10,
          productId: "croissant",
          projectId: "example-coffee-shop"
        }
      ]
    }
  ]
}; 
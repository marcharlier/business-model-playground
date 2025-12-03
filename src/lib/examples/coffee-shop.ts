import type { Project } from "../storage/types";

export const coffeeShopExample: Project = {
  version: 2,
  id: "example-coffee-shop",
  name: "☕️ Coffee Shop Example",
  description: "A coffee shop selling artisan coffee specialities as well as a selection of pastries and baked goods.",
  currency: "GBP",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  costStructure: {
    upfrontCosts: [
      {
        id: "coffee-machine",
        name: "Coffee Machine",
        amount: 16000,
        projectId: "example-coffee-shop"
      }
    ],
    fixedRunningCosts: [
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
    ]
  },
  revenueStreams: {
    products: [
      {
        id: "espresso",
        name: "☕️ Espresso",
        price: 2.50,
        projectId: "example-coffee-shop",
        sales: {
          volume: 40,
          period: "daily"
        },
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
        sales: {
          volume: 80,
          period: "daily"
        },
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
        sales: {
          volume: 30,
          period: "daily"
        },
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
  },
  partnerships: [
    {
      id: "partnership-local-roasters",
      text: "Local artisan roasters for seasonal bean supply"
    },
    {
      id: "partnership-pastry-bakery",
      text: "Neighbourhood bakery providing fresh pastries daily"
    }
  ],
  activities: [
    {
      id: "activity-training",
      text: "Barista training & menu experimentation"
    },
    {
      id: "activity-community-events",
      text: "Host weekly cupping & community events"
    }
  ],
  valueProposition: [
    {
      id: "value-premium-coffee",
      text: "Premium single-origin coffee with fast friendly service"
    },
    {
      id: "value-cozy-space",
      text: "Cozy third-space with reliable Wi-Fi for remote work"
    }
  ],
  customerRelationships: [
    {
      id: "relationship-loyalty",
      text: "Stamp-based loyalty program & birthday perks"
    },
    {
      id: "relationship-social",
      text: "Active Instagram updates & DM support"
    }
  ],
  customerSegments: [
    {
      id: "segment-commuters",
      text: "Morning commuters needing quick takeaway"
    },
    {
      id: "segment-remote-workers",
      text: "Remote workers and students camping for Wi-Fi"
    },
    {
      id: "segment-weekend-families",
      text: "Weekend families looking for treats"
    }
  ],
  resources: [
    {
      id: "resource-baristas",
      text: "Experienced barista team"
    },
    {
      id: "resource-equipment",
      text: "High-end espresso equipment & grinders"
    },
    {
      id: "resource-location",
      text: "Corner unit with indoor/outdoor seating"
    }
  ],
  channels: [
    {
      id: "channel-walkins",
      text: "Walk-in foot traffic from high street"
    },
    {
      id: "channel-online",
      text: "Instagram & Google Maps updates"
    },
    {
      id: "channel-catering",
      text: "Office catering for nearby startups"
    }
  ]
}; 
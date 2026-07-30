import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Car {
  id: string;
  model: string;
  manufacturer: string;
  category: 'Sedan' | 'SUV' | 'Hatchback' | 'Electric' | 'Sports' | 'Luxury';
  quantity: number;
  price: number;
  year: number;
  imageUrl?: string;
  marketShare: number;
  monthlySales: number;
}

// In-memory car store seeded with initial Indian market inventory (Prices in INR)
let carsStore: Car[] = [
  {
    id: '1',
    model: 'Nexon EV',
    manufacturer: 'Tata Motors',
    category: 'Electric',
    quantity: 6,
    price: 1449000,
    year: 2024,
    marketShare: 24.5,
    monthlySales: 3850,
  },
  {
    id: '2',
    model: 'Thar Roxx',
    manufacturer: 'Mahindra',
    category: 'SUV',
    quantity: 4,
    price: 1299000,
    year: 2024,
    marketShare: 18.2,
    monthlySales: 4200,
  },
  {
    id: '3',
    model: 'Creta',
    manufacturer: 'Hyundai',
    category: 'SUV',
    quantity: 12,
    price: 1099000,
    year: 2024,
    marketShare: 25.0,
    monthlySales: 16500,
  },
  {
    id: '4',
    model: 'Swift',
    manufacturer: 'Maruti Suzuki',
    category: 'Hatchback',
    quantity: 15,
    price: 649000,
    year: 2024,
    marketShare: 28.0,
    monthlySales: 18200,
  },
  {
    id: '5',
    model: 'XUV700',
    manufacturer: 'Mahindra',
    category: 'SUV',
    quantity: 5,
    price: 1399000,
    year: 2024,
    marketShare: 16.5,
    monthlySales: 6100,
  },
  {
    id: '6',
    model: 'Fortuner',
    manufacturer: 'Toyota',
    category: 'SUV',
    quantity: 3,
    price: 3343000,
    year: 2024,
    marketShare: 14.2,
    monthlySales: 3100,
  },
  {
    id: '7',
    model: 'Slavia',
    manufacturer: 'Skoda',
    category: 'Sedan',
    quantity: 8,
    price: 1163000,
    year: 2024,
    marketShare: 8.5,
    monthlySales: 1950,
  },
  {
    id: '8',
    model: '3 Series Gran Limousine',
    manufacturer: 'BMW',
    category: 'Luxury',
    quantity: 2,
    price: 6060000,
    year: 2024,
    marketShare: 6.0,
    monthlySales: 480,
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve SPA index page when /api/admin is hit via GET in browser
  app.get("/api/admin", (req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
      next();
    } else {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    }
  });

  // API Endpoints
  app.get("/api/cars", (req, res) => {
    res.json(carsStore);
  });

  app.post("/api/cars", (req, res) => {
    const carData = req.body;
    if (carData.id) {
      carsStore = carsStore.map((c) => (c.id === carData.id ? { ...c, ...carData } : c));
      res.json(carData);
    } else {
      const newCar: Car = {
        ...carData,
        id: "car_" + Date.now(),
        marketShare: carData.marketShare || 5.0,
        monthlySales: carData.monthlySales || 100,
      };
      carsStore.push(newCar);
      res.status(201).json(newCar);
    }
  });

  app.delete("/api/cars/:id", (req, res) => {
    const { id } = req.params;
    carsStore = carsStore.filter((c) => c.id !== id);
    res.json({ success: true, id });
  });

  app.post("/api/auth/register", (req, res) => {
    const userData = req.body;
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { ...userData, id: "usr_" + Date.now() },
    });
  });

  app.post("/api/admin/login", (req, res) => {
    const { name, email, password } = req.body || {};
    if (name && email && password && password.length >= 6) {
      res.json({ success: true, token: "admin-jwt-token-carbyte-2026" });
    } else {
      res.status(401).json({ success: false, message: "Invalid administrator credentials" });
    }
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CAR BYTE server running on http://localhost:${PORT}`);
  });
}

startServer();

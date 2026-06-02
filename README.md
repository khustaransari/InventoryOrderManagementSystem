# Inventory & Order Management System

A production-ready full-stack Inventory & Order Management System for managing products, customers, orders, and inventory tracking.

## Live Links

| | Link |
|---|---|
| **Frontend (Vercel)** | https://frontend-beta-dusky-58.vercel.app |
| **Backend API (Render)** | https://inventory-backend-3jfa.onrender.com |
| **Backend API Docs (Swagger)** | https://inventory-backend-3jfa.onrender.com/docs |
| **Docker Hub Image** | https://hub.docker.com/r/khustar786/inventory-backend |
| **GitHub Repository** | https://github.com/khustaransari/InventoryOrderManagementSystem |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JavaScript) |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Containerization | Docker |
| Orchestration | Docker Compose |

## Run Locally with Docker

```bash
git clone https://github.com/khustaransari/InventoryOrderManagementSystem.git
cd InventoryOrderManagementSystem
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Features

- **Products** — Add, view, update, delete products with SKU and stock tracking
- **Customers** — Add, view, delete customers with email uniqueness
- **Orders** — Create orders with automatic stock deduction and total calculation
- **Dashboard** — Summary stats and low stock alerts
- **Business Logic** — Unique SKU/email, stock validation, auto stock restore on order cancel

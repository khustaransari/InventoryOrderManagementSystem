import { useEffect, useState } from "react";
import { getDashboardStats } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="spinner">Loading...</div></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{stats.low_stock_products.length}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Low Stock Products (≤10 units)</h2>
        {stats.low_stock_products.length === 0 ? (
          <p style={{ color: "#888", fontSize: ".9rem" }}>All products are well stocked.</p>
        ) : (
          <ul className="low-stock-list">
            {stats.low_stock_products.map((p) => (
              <li key={p.id}>
                <span>{p.name} <span style={{ color: "#888", fontSize: ".8rem" }}>({p.sku})</span></span>
                <span className={`badge ${p.quantity === 0 ? "badge-danger" : "badge-warning"}`}>
                  {p.quantity} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

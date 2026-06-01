import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">InvOMS</span>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? "active" : ""}>Products</NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? "active" : ""}>Customers</NavLink>
        <NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>Orders</NavLink>
      </div>
    </nav>
  );
}

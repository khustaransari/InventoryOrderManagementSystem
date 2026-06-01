import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api";
import Alert from "../components/Alert";

const EMPTY_FORM = { name: "", sku: "", price: "", quantity: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts()
      .then((r) => setProducts(r.data))
      .catch(() => setAlert({ type: "error", message: "Failed to load products" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditProduct(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity, 10) };
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        setAlert({ type: "success", message: "Product updated." });
      } else {
        await createProduct(payload);
        setAlert({ type: "success", message: "Product created." });
      }
      closeModal();
      load();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.detail || "Failed to save product" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setAlert({ type: "success", message: "Product deleted." });
      load();
    } catch {
      setAlert({ type: "error", message: "Failed to delete product." });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      <div className="card">
        {loading ? (
          <div className="spinner">Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><p>No products yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>${parseFloat(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? "badge-danger" : p.quantity <= 10 ? "badge-warning" : "badge-success"}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ display: "flex", gap: ".5rem" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editProduct ? "Edit Product" : "Add Product"}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>SKU *</label>
                <input className="form-control" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input className="form-control" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input className="form-control" type="number" min="0" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from "../api";
import Alert from "../components/Alert";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_id: "", items: [{ product_id: "", quantity: 1 }] });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getOrders()
      .then((r) => setOrders(r.data))
      .catch(() => setAlert({ type: "error", message: "Failed to load orders" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getCustomers().then((r) => setCustomers(r.data)).catch(() => {});
    getProducts().then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setForm({ customer_id: "", items: [{ product_id: "", quantity: 1 }] });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: "", quantity: 1 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, value) => {
    const items = form.items.map((it, idx) => idx === i ? { ...it, [field]: value } : it);
    setForm({ ...form, items });
  };

  const computeTotal = () => {
    return form.items.reduce((acc, it) => {
      const p = products.find((x) => String(x.id) === String(it.product_id));
      return acc + (p ? p.price * (parseInt(it.quantity, 10) || 0) : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) return setAlert({ type: "error", message: "Select a customer." });
    if (form.items.some((it) => !it.product_id)) return setAlert({ type: "error", message: "Fill all product fields." });
    setSubmitting(true);
    try {
      await createOrder({
        customer_id: parseInt(form.customer_id, 10),
        items: form.items.map((it) => ({ product_id: parseInt(it.product_id, 10), quantity: parseInt(it.quantity, 10) })),
      });
      setAlert({ type: "success", message: "Order created." });
      load();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.detail || "Failed to create order" });
    } finally {
      setSubmitting(false);
      closeModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await deleteOrder(id);
      setAlert({ type: "success", message: "Order cancelled." });
      load();
    } catch {
      setAlert({ type: "error", message: "Failed to cancel order." });
    }
  };

  const viewDetail = async (id) => {
    try {
      const r = await getOrder(id);
      setDetailOrder(r.data);
    } catch {
      setAlert({ type: "error", message: "Failed to load order details." });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Order</button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      <div className="card">
        {loading ? (
          <div className="spinner">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🛒</div><p>No orders yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customer?.full_name || `#${o.customer_id}`}</td>
                    <td>{o.items?.length || 0}</td>
                    <td>${parseFloat(o.total_amount).toFixed(2)}</td>
                    <td><span className="badge badge-success">{o.status}</span></td>
                    <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                    <td style={{ display: "flex", gap: ".5rem" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => viewDetail(o.id)}>Details</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Order</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer *</label>
                <select className="form-control" required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                  <option value="">Select customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
              </div>

              <label style={{ fontWeight: 600, fontSize: ".85rem", color: "#555", display: "block", marginBottom: ".5rem" }}>Order Items *</label>
              {form.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <select className="form-control" value={item.product_id} onChange={(e) => updateItem(i, "product_id", e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} (${p.price} | stock: {p.quantity})</option>)}
                  </select>
                  <input className="form-control" type="number" min="1" style={{ width: 80 }} value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} />
                  {form.items.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: ".5rem" }} onClick={addItem}>+ Add Item</button>

              <div style={{ marginTop: "1rem", fontWeight: 600, color: "#1a1a2e" }}>
                Estimated Total: ${computeTotal().toFixed(2)}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? "Placing..." : "Place Order"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Order #{detailOrder.id}</span>
              <button className="modal-close" onClick={() => setDetailOrder(null)}>×</button>
            </div>
            <p><strong>Customer:</strong> {detailOrder.customer?.full_name} ({detailOrder.customer?.email})</p>
            <p style={{ margin: ".5rem 0" }}><strong>Status:</strong> <span className="badge badge-success">{detailOrder.status}</span></p>
            <p><strong>Date:</strong> {detailOrder.created_at ? new Date(detailOrder.created_at).toLocaleString() : "—"}</p>
            <hr style={{ margin: "1rem 0" }} />
            <table style={{ width: "100%", fontSize: ".9rem", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingBottom: ".5rem" }}>Product</th>
                  <th style={{ textAlign: "right", paddingBottom: ".5rem" }}>Qty</th>
                  <th style={{ textAlign: "right", paddingBottom: ".5rem" }}>Unit Price</th>
                  <th style={{ textAlign: "right", paddingBottom: ".5rem" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detailOrder.items.map((it) => (
                  <tr key={it.id}>
                    <td style={{ padding: ".4rem 0" }}>{it.product?.name || `#${it.product_id}`}</td>
                    <td style={{ textAlign: "right" }}>{it.quantity}</td>
                    <td style={{ textAlign: "right" }}>${it.unit_price.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>${(it.quantity * it.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr style={{ margin: "1rem 0" }} />
            <p style={{ textAlign: "right", fontWeight: 700, fontSize: "1.1rem" }}>Total: ${detailOrder.total_amount.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

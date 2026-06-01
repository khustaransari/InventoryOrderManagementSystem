import { useEffect, useState } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../api";
import Alert from "../components/Alert";

const EMPTY_FORM = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers()
      .then((r) => setCustomers(r.data))
      .catch(() => setAlert({ type: "error", message: "Failed to load customers" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCustomer(form);
      setAlert({ type: "success", message: "Customer created." });
      load();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.detail || "Failed to create customer" });
    } finally {
      setSubmitting(false);
      closeModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      setAlert({ type: "success", message: "Customer deleted." });
      load();
    } catch {
      setAlert({ type: "error", message: "Failed to delete customer." });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      <div className="card">
        {loading ? (
          <div className="spinner">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👥</div><p>No customers yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
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
              <span className="modal-title">Add Customer</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone * (10 digits)</label>
                <input className="form-control" required pattern="\d{10}" maxLength={10} inputMode="numeric" placeholder="e.g. 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
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

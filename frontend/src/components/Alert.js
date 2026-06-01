export default function Alert({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>×</button>}
    </div>
  );
}

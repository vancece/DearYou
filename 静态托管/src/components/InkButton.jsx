

export default function InkButton({ children, onClick, disabled, className = '' }) {
  return (
    <button
      className={`ink-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

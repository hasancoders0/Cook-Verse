export default function AppCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
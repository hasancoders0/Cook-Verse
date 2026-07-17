export default function AppButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-green-600 text-white hover:bg-green-700",

    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200",

    outline:
      "border border-green-600 text-green-600 hover:bg-green-600 hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-medium transition duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
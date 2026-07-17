import CONTAINER from "@/constants/container";

export default function AppContainer({
  children,
  size = "DEFAULT",
  className = "",
}) {
  return (
    <div
      className={`${CONTAINER[size]} ${className}`}
    >
      {children}
    </div>
  );
}
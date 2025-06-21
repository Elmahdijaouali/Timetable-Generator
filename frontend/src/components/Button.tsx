type props = {
  label: string;
  className?: string;
  onClick?: () => void;
};
export default function Button({
  label = "",
  className = "",
  onClick = () => {},
}: props) {
  return (
    <button
      className={`text-center mx-2 text-white  shadow-xl font-bold hover:cursor-pointer   bg-blue-500 p-2 rounded-md ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

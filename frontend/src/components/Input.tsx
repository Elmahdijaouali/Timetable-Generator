type props = {
  type: string;
  name: string;
  id: string;
  placeholder: string;
  className: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  type = "text",
  name = "",
  id = "",
  placeholder = "",
  className = "",
  value = "",
  onChange = () => {},
}: props) {
  return (
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`block w-full px-3 lg:text-xl py-2 rounded placeholder:text-gray-600 bg-gray-200 ${className}`}
    />
  );
}

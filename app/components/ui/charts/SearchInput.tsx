interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ 
  placeholder = "Buscar...", 
  value = "", 
  onChange 
}: SearchInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
    </div>
  );
}
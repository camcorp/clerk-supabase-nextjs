interface SearchInputProps {
    placeholder?: string;
    onSearch: (query: string) => void;
  }
  
  export default function SearchInput({ placeholder = "Buscar...", onSearch }: SearchInputProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(event.target.value);
    };
  
    return (
      <div className="mb-4">
        <input
          type="text"
          placeholder={placeholder}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </div>
    );
  }
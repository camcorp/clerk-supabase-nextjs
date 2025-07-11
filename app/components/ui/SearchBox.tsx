'use client';

import React, { useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase/client';

type SearchResult = Record<string, any>;

interface SearchBoxProps {
  tableName: string;
  searchField: string;
  displayFields: string[];
  placeholder?: string;
  limit?: number;
  orderBy?: {
    field: string;
    ascending: boolean;
  };
  onSelect: (result: SearchResult) => void;
  renderResultItem?: (result: SearchResult, isSelected: boolean) => React.ReactNode;
}

export default function SearchBox({
  tableName,
  searchField,
  displayFields,
  placeholder = 'Buscar...',
  limit = 10,
  orderBy,
  onSelect,
  renderResultItem
}: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  
  const supabase = useSupabaseClient();
  
  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Limpiar el RUT removiendo puntos y guiones para la búsqueda
      let searchValue = searchTerm;
      if (searchField === 'rut') {
        searchValue = searchTerm.replace(/[.-]/g, '').toUpperCase();
        
        // Validar que el RUT tenga al menos 4 caracteres
        if (searchValue.length < 4) {
          setError('El RUT debe tener al menos 4 caracteres');
          setIsSearching(false);
          return;
        }
      }
      
      console.log('Buscando en tabla:', tableName, 'campo:', searchField, 'valor:', searchValue);
      
      // Construir la consulta base
      let query = supabase
        .from(tableName)
        .select(displayFields.join(', '))
        .ilike(searchField, `%${searchValue}%`)
        .limit(limit);
      
      // Añadir ordenamiento si se especifica
      if (orderBy) {
        query = query.order(orderBy.field, { ascending: orderBy.ascending });
      }
      
      console.log('Ejecutando consulta...');
      const { data, error } = await query;
      
      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      
      console.log('Resultados encontrados:', data?.length || 0, data);
      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        setError('No se encontraron resultados para la búsqueda');
      }
    } catch (err: any) {
      console.error(`Error al buscar en ${tableName}:`, err.message);
      setError(`Error al realizar la búsqueda: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result);
    onSelect(result);
  };

  // Renderizado predeterminado de un elemento de resultado
  const defaultRenderResultItem = (result: SearchResult, isSelected: boolean) => (
    <div className={`p-4 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}>
      {displayFields.map((field) => (
        <p key={field} className={field === displayFields[0] ? 'font-medium' : 'text-sm text-gray-500'}>
          {field}: {result[field]}
        </p>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 mt-2 mb-4">{error}</p>
      )}
      
      {searchResults.length > 0 && (
        <div className="bg-white shadow overflow-hidden rounded-md mt-4">
          <ul className="divide-y divide-gray-200">
            {searchResults.map((result, index) => (
              <li key={index} onClick={() => handleSelectResult(result)}>
                {renderResultItem 
                  ? renderResultItem(result, selectedResult === result)
                  : defaultRenderResultItem(result, selectedResult === result)
                }
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
interface NoDataProps {
    message?: string;
  }
  
  export default function NoData({ message = "No hay datos disponibles." }: NoDataProps) {
    return (
      <div className="text-center py-6 text-gray-500">
        {message}
      </div>
    );
  }
// CandidateCard.jsx
export default function CandidateCard({ data, onVote }) {
  const { partido, nombre, logo } = data;
  
  return (
    <div className="rounded-lg shadow-md bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="h-40 bg-gray-100 flex items-center justify-center p-4">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
          {partido.charAt(partido.length - 1)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{partido}</h3>
        <p className="text-gray-600 text-sm mb-4">{nombre}</p>
        
        <button 
          onClick={() => onVote(data)} 
          className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
        >
          Votar
        </button>
      </div>
    </div>
  );
}



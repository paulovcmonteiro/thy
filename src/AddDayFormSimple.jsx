import React from 'react';

const AddDayFormSimple = ({ onClose, onSuccess }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Adicionar Dia (Versão Simples)</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Este é um componente de teste para verificar se os imports funcionam.
        </p>
        
        <button
          onClick={() => {
            console.log('✅ AddDayFormSimple funcionando!');
            onSuccess && onSuccess();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Testar Funcionamento
        </button>
      </div>
    </div>
  );
};

export default AddDayFormSimple; 
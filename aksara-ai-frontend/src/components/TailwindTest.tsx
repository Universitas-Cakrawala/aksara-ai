import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Tailwind CSS Test</h1>
      <div className="bg-white text-black p-6 rounded-lg shadow-lg">
        <p className="text-lg">Jika Anda dapat melihat styling ini dengan benar, maka Tailwind CSS sudah bekerja!</p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TailwindTest;
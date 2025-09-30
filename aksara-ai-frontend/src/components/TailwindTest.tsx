import React from 'react';

const TailwindTest: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
            <h1 className="mb-4 text-4xl font-bold">Tailwind CSS Test</h1>
            <div className="rounded-lg bg-white p-6 text-black shadow-lg">
                <p className="text-lg">
                    Jika Anda dapat melihat styling ini dengan benar, maka Tailwind CSS sudah bekerja!
                </p>
                <button className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                    Test Button
                </button>
            </div>
        </div>
    );
};

export default TailwindTest;

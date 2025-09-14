import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center space-x-8 mb-12">
          <a href="https://vite.dev" target="_blank" className="block">
            <img src={viteLogo} className="logo hover:scale-110 transition-transform" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="block">
            <img src={reactLogo} className="logo react hover:scale-110 transition-transform" alt="React logo" />
          </a>
        </div>
        
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Vite + React + Tailwind v4
        </h1>
        
        <div className="card max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <button 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mb-6"
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </button>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Edit <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App

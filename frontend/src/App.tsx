import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>基于区块链的新能源车辆碳减排计量系统</h1>
        <p>系统正在建设中...</p>
        <button onClick={() => setCount((count) => count + 1)}>
          点击计数: {count}
        </button>
      </header>
    </div>
  )
}

export default App

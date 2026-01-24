import { useEffect, useRef, useState } from 'react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardState, setBoardState] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameActive, setGameActive] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [gameMode, setGameMode] = useState('pvp');
  const [difficulty, setDifficulty] = useState('medium');
  const [variant, setVariant] = useState('classic');
  const [gridSize, setGridSize] = useState(3);
  const [moveHistory, setMoveHistory] = useState<Array<{ index: number; player: string }>>([]);
  const [showReplay, setShowReplay] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initializeBoard = () => {
    setBoardState(new Array(gridSize * gridSize).fill(''));
  };

  useEffect(() => {
    initializeBoard();
  }, [gridSize]);

  useEffect(() => {
    const saved = localStorage.getItem('tictactoe_state');
    if (saved) {
      const state = JSON.parse(saved);
      setScores(state.scores || { X: 0, O: 0, draw: 0 });
      setGameMode(state.gameMode || 'pvp');
      setDifficulty(state.difficulty || 'medium');
      setVariant(state.variant || 'classic');
      setGridSize(state.gridSize || 3);
      setShowReplay(state.showReplay !== undefined ? state.showReplay : true);
      setShowScore(state.showScore !== undefined ? state.showScore : true);
    }
    initializeBoard();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <iframe
        src="/tictactoe.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block'
        }}
        title="Tic Tac Toe Game"
      />
    </div>
  );
}

export default App;

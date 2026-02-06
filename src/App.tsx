import { useEffect, useRef, useState } from 'react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [variant, setVariant] = useState<'classic' | 'ultimate'>('ultimate');
  const [gameActive, setGameActive] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [showVersionSelect, setShowVersionSelect] = useState(false);
  const [forceRender, setForceRender] = useState(0);

  const classicBoard = useRef<string[]>(Array(9).fill("")).current;
  const ultimateBoards = useRef<Array<string[]>>(Array.from({ length: 9 }, () => Array(9).fill(""))).current;
  const ultimateBoardWinners = useRef<string[]>(Array(9).fill("")).current;
  const activeBoard = useRef<number>(-1);
  const mainBoardRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const checkWin = (arr: string[]) => {
    return wins.some(p =>
      arr[p[0]] &&
      arr[p[0]] === arr[p[1]] &&
      arr[p[0]] === arr[p[2]]
    );
  };

  const playMoveClassic = (index: number) => {
    if (gameOver || classicBoard[index]) return;

    classicBoard[index] = currentPlayer;
    if (mainBoardRef.current) {
      const cell = mainBoardRef.current.querySelectorAll(".cell")[index] as HTMLElement;
      cell.textContent = currentPlayer;
      cell.classList.add(currentPlayer.toLowerCase());
      cell.classList.add("played");
    }

    if (checkWin(classicBoard)) {
      if (statusRef.current) {
        statusRef.current.textContent = `🎉 Player ${currentPlayer} wins!`;
      }
      setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer as keyof typeof prev] + 1 }));
      setGameOver(true);
      return;
    }

    if (classicBoard.every(cell => cell !== "")) {
      if (statusRef.current) {
        statusRef.current.textContent = "It's a draw!";
      }
      setScores(prev => ({ ...prev, draw: prev.draw + 1 }));
      setGameOver(true);
      return;
    }

    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    if (statusRef.current) {
      statusRef.current.textContent = `Player ${currentPlayer === "X" ? "O" : "X"}'s turn`;
    }
  };

  const updateActiveBoardsUltimate = () => {
    if (!mainBoardRef.current) return;
    [...mainBoardRef.current.children].forEach((b, i) => {
      const element = b as HTMLElement;
      element.classList.toggle(
        "active",
        !gameOver && (activeBoard.current === -1 || activeBoard.current === i) && !ultimateBoardWinners[i]
      );
    });
  };

  const playMoveUltimate = (b: number, c: number) => {
    if (gameOver) return;
    if (activeBoard.current !== -1 && activeBoard.current !== b) return;
    if (ultimateBoards[b][c] || ultimateBoardWinners[b]) return;

    ultimateBoards[b][c] = currentPlayer;
    if (mainBoardRef.current) {
      const cell = mainBoardRef.current.children[b].querySelectorAll(".cell")[c] as HTMLElement;
      cell.textContent = currentPlayer;
      cell.classList.add(currentPlayer.toLowerCase());
      cell.classList.add("played");
    }

    if (checkWin(ultimateBoards[b])) {
      ultimateBoardWinners[b] = currentPlayer;
      if (mainBoardRef.current) {
        const big = mainBoardRef.current.children[b] as HTMLElement;
        big.classList.add(`won-${currentPlayer.toLowerCase()}`);
        big.dataset.winner = currentPlayer;
      }

      if (checkWin(ultimateBoardWinners as unknown as string[])) {
        if (statusRef.current) {
          statusRef.current.textContent = `🎉 Player ${currentPlayer} wins the game!`;
        }
        setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer as keyof typeof prev] + 1 }));
        setGameOver(true);
        setGameActive(false);
        return;
      }
    }

    activeBoard.current = ultimateBoardWinners[c] ? -1 : c;
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    if (statusRef.current) {
      statusRef.current.textContent = `Player ${currentPlayer === "X" ? "O" : "X"}'s turn`;
    }
    updateActiveBoardsUltimate();
  };

  const createBoardClassic = () => {
    if (!mainBoardRef.current) return;
    mainBoardRef.current.innerHTML = "";
    mainBoardRef.current.className = "classic-board";

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.onclick = () => playMoveClassic(i);
      mainBoardRef.current.appendChild(cell);
    }
  };

  const createBoardUltimate = () => {
    if (!mainBoardRef.current) return;
    mainBoardRef.current.innerHTML = "";
    mainBoardRef.current.className = "main-board";

    for (let b = 0; b < 9; b++) {
      const big = document.createElement("div");
      big.className = "big-board";
      big.dataset.index = String(b);

      const mini = document.createElement("div");
      mini.className = "mini-board";

      for (let c = 0; c < 9; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = () => playMoveUltimate(b, c);
        mini.appendChild(cell);
      }

      big.appendChild(mini);
      mainBoardRef.current.appendChild(big);
    }
    updateActiveBoardsUltimate();
  };

  const resetGame = () => {
    classicBoard.fill("");
    for (let i = 0; i < 9; i++) {
      ultimateBoards[i].fill("");
      ultimateBoardWinners[i] = "";
    }
    activeBoard.current = -1;
    setCurrentPlayer("X");
    setGameOver(false);
    setGameActive(true);
    if (statusRef.current) {
      statusRef.current.textContent = "Player X's turn";
    }
    if (variant === 'classic') {
      createBoardClassic();
    } else {
      createBoardUltimate();
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('tictactoe_state');
    if (saved) {
      const state = JSON.parse(saved);
      setScores(state.scores || { X: 0, O: 0, draw: 0 });
      setShowScore(state.showScore !== undefined ? state.showScore : true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tictactoe_state', JSON.stringify({ scores, showScore }));
  }, [scores, showScore]);

  useEffect(() => {
    if (variant === 'classic') {
      createBoardClassic();
    } else {
      createBoardUltimate();
    }
  }, [variant]);

  const selectVersion = (selectedVariant: 'classic' | 'ultimate') => {
    setVariant(selectedVariant);
    setShowVersionSelect(false);
    classicBoard.fill("");
    for (let i = 0; i < 9; i++) {
      ultimateBoards[i].fill("");
      ultimateBoardWinners[i] = "";
    }
    activeBoard.current = -1;
    setCurrentPlayer('X');
    setGameOver(false);
    setGameActive(true);
    if (statusRef.current) {
      statusRef.current.textContent = "Player X's turn";
    }
    setForceRender(prev => prev + 1);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#2f3b4c] flex flex-col justify-center items-center p-4">
      <style>{`
        .classic-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          max-width: 300px;
          width: 100%;
        }

        .main-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          max-width: 900px;
          width: 100%;
        }

        .big-board {
          background: #e5e7eb;
          border-radius: 14px;
          padding: 10px;
          position: relative;
          transition: outline 0.3s ease;
        }

        .big-board.active {
          outline: 3px solid #60a5fa;
        }

        .big-board.won-x::after,
        .big-board.won-o::after {
          content: attr(data-winner);
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          font-weight: bold;
          color: rgba(0,0,0,0.3);
          pointer-events: none;
          border-radius: 14px;
        }

        .mini-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .cell {
          background: white;
          border-radius: 6px;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .cell:hover:not(.played) {
          background: #f3f4f6;
          transform: scale(0.95);
        }

        .cell.x {
          color: #ef4444;
          font-weight: 900;
        }

        .cell.o {
          color: #2563eb;
          font-weight: 900;
        }

        .cell.played {
          cursor: not-allowed;
        }

        .controls {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          justify-content: center;
          flex-wrap: wrap;
          width: 100%;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: #4f46e5;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s ease;
          font-size: 0.95rem;
        }

        .btn:hover {
          background: #4338ca;
        }

        .btn:active {
          transform: scale(0.98);
        }

        .score-panel {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .score-panel h2 {
          margin: 0 0 12px 0;
          font-size: 1.2rem;
        }

        .score-row {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 8px;
        }

        .score-item {
          font-weight: bold;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1f2937;
          color: white;
          padding: 32px;
          border-radius: 16px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-content h2 {
          margin: 0 0 24px 0;
          font-size: 1.8rem;
        }

        .version-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .version-btn {
          padding: 16px;
          border: 2px solid transparent;
          border-radius: 10px;
          background: #4f46e5;
          color: white;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .version-btn:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }

        .version-btn.classic {
          font-size: 0.95rem;
        }

        .version-btn.ultimate {
          font-size: 0.95rem;
        }
      `}</style>

      {showVersionSelect && (
        <div className="modal-overlay" onClick={() => setShowVersionSelect(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select Game Version</h2>
            <div className="version-buttons">
              <button
                className="version-btn classic"
                onClick={() => selectVersion('classic')}
              >
                🎮 Classic (3x3)
              </button>
              <button
                className="version-btn ultimate"
                onClick={() => selectVersion('ultimate')}
              >
                ⚡ Ultimate (9x9)
              </button>
            </div>
          </div>
        </div>
      )}

      {showScore && (
        <div className="score-panel">
          <h2>Score</h2>
          <div className="score-row">
            <div className="score-item">X: {scores.X}</div>
            <div className="score-item">O: {scores.O}</div>
            <div className="score-item">Draw: {scores.draw}</div>
          </div>
        </div>
      )}

      <div ref={statusRef} style={{ textAlign: 'center', color: 'white', marginBottom: '12px', fontWeight: 'bold', fontSize: '1.2rem' }}>
        Player X's turn
      </div>

      <div ref={mainBoardRef} className="main-board"></div>

      <div className="controls">
        <button className="btn" onClick={resetGame}>Reset Game</button>
        <button className="btn" onClick={() => setShowScore(!showScore)}>
          {showScore ? 'Hide' : 'Show'} Score
        </button>
        <button className="btn" onClick={() => setShowVersionSelect(true)}>
          {variant === 'classic' ? '🎮' : '⚡'} {variant === 'classic' ? 'Classic' : 'Ultimate'}
        </button>
      </div>
    </div>
  );
}

export default App;

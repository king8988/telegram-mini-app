'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

const INFO_ITEMS = [
  { icon: '📱', label: 'Platform', key: 'platform' },
  { icon: '🌐', label: 'Environment', key: 'environment' },
  { icon: '🎯', label: 'SDK Status', key: 'sdk' },
];

export default function TicTacToe() {
  const [toast, setToast] = useState<string | null>(null);

  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameMode, setGameMode] = useState<'menu' | 'pvp' | 'pvc'>('menu');
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [trophyClicked, setTrophyClicked] = useState(false);

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const startGame = (mode: 'pvp' | 'pvc') => {
    setGameMode(mode);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setIsComputerTurn(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setIsComputerTurn(false);
    setTrophyClicked(false);
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isComputerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win.winner);
      setWinningLine(win.line);
    } else if (!newBoard.includes(null)) {
      setWinner('Draw');
    } else {
      setIsXNext(false);

      if (gameMode === 'pvc') {
        setIsComputerTurn(true);
        setTimeout(() => makeComputerMove(newBoard), 500);
      }
    }
  };

  const makeComputerMove = (currentBoard: (string | null)[]) => {
    if (winner) {
      setIsComputerTurn(false);
      return;
    }
    
    const available = currentBoard.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);
    if (available.length === 0) {
      setIsComputerTurn(false);
      return;
    }

    const randomIndex = available[Math.floor(Math.random() * available.length)];
    
    const newBoard = [...currentBoard];
    newBoard[randomIndex] = 'O';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win.winner);
      setWinningLine(win.line);
    } else if (!newBoard.includes(null)) {
      setWinner('Draw');
    } else {
      setIsXNext(true);
    }
    setIsComputerTurn(false);
  };

  return (
    <>
      <div className="ambient-glow" />
      <main className="app">
        {gameMode === 'menu' ? (
          <>
            <header className="header fade-in delay-1">
              <h1 className="greeting">
                Tic Tac <span className="greeting-accent">Toe</span>
              </h1>
              <p className="subtitle">Choose your opponent</p>
            </header>

            <div className="cards-grid">
              <div
                className="card purple fade-in delay-3"
                onClick={() => startGame('pvp')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && startGame('pvp')}
              >
                <div className="card-icon">👥</div>
                <div className="card-title">Player vs Player</div>
                <div className="card-desc">Play with a friend locally</div>
              </div>

              <div
                className="card blue fade-in delay-4"
                onClick={() => startGame('pvc')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && startGame('pvc')}
              >
                <div className="card-icon">🤖</div>
                <div className="card-title">Player vs CPU</div>
                <div className="card-desc">Challenge the computer</div>
              </div>
            </div>

            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="action-button fade-in delay-8" style={{ marginTop: '32px' }}>
                ← Back to Home
              </button>
            </Link>
          </>
        ) : (
          <div className="game-container">
            <div className="game-header">
              <button onClick={() => setGameMode('menu')} className="back-button">
                ← Back
              </button>
              <h2>Tic Tac Toe</h2>
              <div className="spacer" />
            </div>

            <div className="game-status">
              {winner ? (
                winner === 'Draw' ? <span>It's a Draw!</span> : (
                  <div className="winner-display">
                    <div className="confetti-container">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="confetti" style={{ 
                          left: `${Math.random() * 100}%`, 
                          animationDelay: `${Math.random() * 2}s`,
                          backgroundColor: ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'][Math.floor(Math.random() * 6)]
                        }} />
                      ))}
                    </div>
                    <div 
                      className={`trophy-container ${trophyClicked ? 'shake' : ''}`}
                      onClick={() => setTrophyClicked(!trophyClicked)}
                    >
                      <span className="trophy">🏆</span>
                      <div className="sparkles">
                        <span>✨</span>
                        <span>🌟</span>
                        <span>⭐</span>
                      </div>
                    </div>
                    <h2 className="winner-text">
                      {trophyClicked ? 'Winner Winner Chicken Dinner!' : `Player ${winner} Wins!`}
                    </h2>
                    <p className="tap-hint">{trophyClicked ? '(Tap to hide)' : '(Tap the trophy!)'}</p>
                  </div>
                )
              ) : (
                <span>Current Player: <span className="player-x">{isXNext ? 'X' : 'O'}</span></span>
              )}
            </div>

            <div className="board">
              {board.map((cell, i) => (
                <button
                  key={i}
                  className={`cell ${cell ? 'filled' : ''} ${winningLine?.includes(i) ? 'winning' : ''} ${cell === 'O' ? 'o-cell' : 'x-cell'}`}
                  onClick={() => handleCellClick(i)}
                  disabled={!!winner || !!cell}
                >
                  {cell}
                </button>
              ))}
            </div>

            <button className="action-button reset-btn" onClick={resetGame}>
              {winner ? 'Play Again' : 'Restart Game'}
            </button>
            
            {gameMode === 'pvc' && !winner && !isXNext && (
              <p className="thinking-text">Computer is thinking...</p>
            )}
          </div>
        )}
      </main>

      {/* Toast */}
      <div className={`toast ${toast ? 'visible' : ''}`}>{toast}</div>
    </>
  );
}

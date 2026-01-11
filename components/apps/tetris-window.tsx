'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, Pause, Play } from 'lucide-react'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
]

export function TetrisWindow() {
  const [board, setBoard] = useState<number[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<number[][]>([])
  const [position, setPosition] = useState({ x: 4, y: 0 })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const createNewPiece = useCallback(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    setCurrentPiece(shape)
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2), y: 0 })
  }, [])

  const checkCollision = useCallback((piece: number[][], pos: { x: number; y: number }, checkBoard: number[][]) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x
          const newY = pos.y + y
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true
          if (newY >= 0 && checkBoard[newY][newX]) return true
        }
      }
    }
    return false
  }, [])

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row])
    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = position.y + y
          const boardX = position.x + x
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = 1
          }
        }
      })
    })

    // Check for completed lines
    let linesCleared = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell === 1)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        linesCleared++
        y++
      }
    }

    setScore(prev => prev + linesCleared * 100)
    setBoard(newBoard)
    createNewPiece()
  }, [board, currentPiece, position, createNewPiece])

  const moveDown = useCallback(() => {
    if (gameOver || isPaused) return
    const newPos = { ...position, y: position.y + 1 }
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos)
    } else {
      if (position.y === 0) {
        setGameOver(true)
      } else {
        mergePiece()
      }
    }
  }, [position, currentPiece, board, checkCollision, mergePiece, gameOver, isPaused])

  const moveHorizontal = useCallback((direction: number) => {
    if (gameOver || isPaused) return
    const newPos = { ...position, x: position.x + direction }
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos)
    }
  }, [position, currentPiece, board, checkCollision, gameOver, isPaused])

  const rotate = useCallback(() => {
    if (gameOver || isPaused) return
    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map(row => row[i]).reverse()
    )
    if (!checkCollision(rotated, position, board)) {
      setCurrentPiece(rotated)
    }
  }, [currentPiece, position, board, checkCollision, gameOver, isPaused])

  useEffect(() => {
    createNewPiece()
  }, [createNewPiece])

  useEffect(() => {
    if (gameOver || isPaused) return
    const interval = setInterval(moveDown, 500)
    return () => clearInterval(interval)
  }, [moveDown, gameOver, isPaused])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveHorizontal(-1)
      if (e.key === 'ArrowRight') moveHorizontal(1)
      if (e.key === 'ArrowDown') moveDown()
      if (e.key === 'ArrowUp') rotate()
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [moveHorizontal, moveDown, rotate])

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)))
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    createNewPiece()
  }

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row])
    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = position.y + y
          const boardX = position.x + x
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = 2
          }
        }
      })
    })
    return displayBoard
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4 sm:p-6 overflow-auto">
      <div className="flex items-center justify-between w-full max-w-md mb-3 sm:mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Tetris</h2>
          <p className="text-white/60 text-xs sm:text-sm">Puntuación: {score}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            disabled={gameOver}
          >
            {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {gameOver && (
        <div className="mb-3 sm:mb-4 px-3 py-2 bg-white/20 border border-white rounded-lg">
          <p className="text-white font-semibold text-sm">Game Over!</p>
        </div>
      )}

      <div className="bg-white/5 p-2 sm:p-4 rounded-lg border border-white/10">
        <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(16px, 24px))` }}>
          {renderBoard().map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`aspect-square rounded-sm ${
                  cell === 2 ? 'bg-white' : cell === 1 ? 'bg-white/60' : 'bg-white/5'
                }`}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-3 sm:mt-4 text-white/40 text-xs text-center">
        <p>Usa las flechas para mover</p>
        <p>↑ para rotar, ↓ para bajar</p>
      </div>
    </div>
  )
}

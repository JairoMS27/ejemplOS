'use client'

import { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

const GRID_SIZE = 8
const MINES = 10

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

export function MinesweeperWindow() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    // Create empty grid
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      )

    // Place mines randomly
    let minesPlaced = 0
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * GRID_SIZE)
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true
        minesPlaced++
      }
    }

    // Calculate adjacent mines
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col].isMine) {
          let count = 0
          for (let r = Math.max(0, row - 1); r <= Math.min(GRID_SIZE - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(GRID_SIZE - 1, col + 1); c++) {
              if (newGrid[r][c].isMine) count++
            }
          }
          newGrid[row][col].adjacentMines = count
        }
      }
    }

    setGrid(newGrid)
    setGameOver(false)
    setWon(false)
  }

  const revealCell = (row: number, col: number) => {
    if (gameOver || won || grid[row][col].isRevealed || grid[row][col].isFlagged) return

    const newGrid = grid.map(r => [...r])

    if (newGrid[row][col].isMine) {
      setGameOver(true)
      // Reveal all mines
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c].isMine) newGrid[r][c].isRevealed = true
        }
      }
      setGrid(newGrid)
      return
    }

    // Flood fill for empty cells
    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return
      if (newGrid[r][c].isRevealed) return

      newGrid[r][c].isRevealed = true

      if (newGrid[r][c].adjacentMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc)
          }
        }
      }
    }

    reveal(row, col)
    setGrid(newGrid)

    // Check win condition
    checkWin(newGrid)
  }

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (gameOver || won || grid[row][col].isRevealed) return

    const newGrid = grid.map(r => [...r])
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged
    setGrid(newGrid)
  }

  const checkWin = (currentGrid: Cell[][]) => {
    let revealedCount = 0
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentGrid[row][col].isRevealed) revealedCount++
      }
    }
    if (revealedCount === GRID_SIZE * GRID_SIZE - MINES) {
      setWon(true)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-black p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Buscaminas</h2>
          <p className="text-white/60 text-xs sm:text-sm">
            {gameOver ? '💥 Perdiste' : won ? '🎉 Ganaste' : `💣 Minas: ${MINES}`}
          </p>
        </div>
        <button
          onClick={initializeGame}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white hover:bg-white/90 text-black rounded-lg transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(32px, 48px))` }}>
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(r, c, e)}
                className={`aspect-square rounded border font-bold text-xs sm:text-sm transition-all ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-red-500/20 border-red-500 text-red-500'
                      : cell.adjacentMines === 0
                        ? 'bg-white/5 border-white/20 text-white'
                        : 'bg-white/5 border-white/20 text-white font-bold'
                    : 'bg-white/10 border-white/30 hover:border-white/50 hover:bg-white/20 cursor-pointer'
                } ${cell.isFlagged && !cell.isRevealed ? 'bg-yellow-500/20 border-yellow-500' : ''}`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.adjacentMines > 0 ? (
                    cell.adjacentMines
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  '🚩'
                ) : (
                  ''
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

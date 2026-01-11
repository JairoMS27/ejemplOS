'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'

const GRID_SIZE = 4

export function Game2048() {
  const [grid, setGrid] = useState<number[][]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
    addNewTile(newGrid)
    addNewTile(newGrid)
    setGrid(newGrid)
    setScore(0)
    setGameOver(false)
  }, [])

  useEffect(() => {
    initializeGrid()
  }, [initializeGrid])

  const addNewTile = (currentGrid: number[][]) => {
    const emptyCells: { row: number; col: number }[] = []
    currentGrid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push({ row: r, col: c })
      })
    })
    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      currentGrid[row][col] = Math.random() < 0.9 ? 2 : 4
    }
  }

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return

    let newGrid = grid.map(row => [...row])
    let moved = false
    let newScore = score

    const moveLeft = (row: number[]) => {
      const filtered = row.filter(cell => cell !== 0)
      const merged: number[] = []
      let skip = false

      for (let i = 0; i < filtered.length; i++) {
        if (skip) {
          skip = false
          continue
        }
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2)
          newScore += filtered[i] * 2
          skip = true
          moved = true
        } else {
          merged.push(filtered[i])
        }
      }

      while (merged.length < GRID_SIZE) merged.push(0)
      return merged
    }

    if (direction === 'left') {
      newGrid = newGrid.map(row => {
        const newRow = moveLeft(row)
        if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true
        return newRow
      })
    } else if (direction === 'right') {
      newGrid = newGrid.map(row => {
        const reversed = moveLeft([...row].reverse())
        const newRow = reversed.reverse()
        if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true
        return newRow
      })
    } else if (direction === 'up') {
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = newGrid.map(row => row[col])
        const newColumn = moveLeft(column)
        if (JSON.stringify(newColumn) !== JSON.stringify(column)) moved = true
        newColumn.forEach((val, row) => {
          newGrid[row][col] = val
        })
      }
    } else if (direction === 'down') {
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = newGrid.map(row => row[col])
        const reversed = moveLeft([...column].reverse())
        const newColumn = reversed.reverse()
        if (JSON.stringify(newColumn) !== JSON.stringify(column)) moved = true
        newColumn.forEach((val, row) => {
          newGrid[row][col] = val
        })
      }
    }

    if (moved) {
      addNewTile(newGrid)
      setGrid(newGrid)
      setScore(newScore)

      // Check game over
      const hasEmpty = newGrid.some(row => row.includes(0))
      if (!hasEmpty) {
        let canMove = false
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (
              (r < GRID_SIZE - 1 && newGrid[r][c] === newGrid[r + 1][c]) ||
              (c < GRID_SIZE - 1 && newGrid[r][c] === newGrid[r][c + 1])
            ) {
              canMove = true
            }
          }
        }
        if (!canMove) setGameOver(true)
      }
    }
  }, [grid, score, gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move('left')
      if (e.key === 'ArrowRight') move('right')
      if (e.key === 'ArrowUp') move('up')
      if (e.key === 'ArrowDown') move('down')
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [move])

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-white/5 text-transparent',
      2: 'bg-white/15 text-white',
      4: 'bg-white/25 text-white',
      8: 'bg-white/35 text-white',
      16: 'bg-white/45 text-white',
      32: 'bg-white/55 text-white',
      64: 'bg-white/65 text-white',
      128: 'bg-white/75 text-black',
      256: 'bg-white/85 text-black',
      512: 'bg-white/90 text-black',
      1024: 'bg-white/95 text-black',
      2048: 'bg-white text-black',
    }
    return colors[value] || 'bg-white text-black'
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4 sm:p-6">
      <div className="flex items-center justify-between w-full max-w-md mb-4 sm:mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">2048</h2>
          <p className="text-white/60 text-xs sm:text-sm">Puntuación: {score}</p>
        </div>
        <button
          onClick={initializeGrid}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {gameOver && (
        <div className="mb-4 px-4 py-2 bg-white/20 border border-white rounded-lg">
          <p className="text-white font-semibold">Game Over!</p>
        </div>
      )}

      <div className="bg-white/5 p-2 sm:p-4 rounded-lg border border-white/10 w-full max-w-md">
        <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`aspect-square rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold transition-all ${
                  getTileColor(cell)
                }`}
              >
                {cell !== 0 && cell}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => move('up')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors sm:hidden"
          >
            <ArrowUp className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => move('left')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors sm:hidden"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => move('down')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors sm:hidden"
          >
            <ArrowDown className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => move('right')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors sm:hidden"
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="mt-4 text-white/40 text-xs text-center">
        <p className="hidden sm:block">Usa las flechas para mover las fichas</p>
        <p className="sm:hidden">Usa los botones o las flechas para mover</p>
      </div>
    </div>
  )
}

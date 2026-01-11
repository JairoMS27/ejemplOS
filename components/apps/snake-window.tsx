"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, RotateCcw } from "lucide-react"

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

export function SnakeWindow() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT")
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const savedHighScore = localStorage.getItem("snake_highscore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  }, [])

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection("RIGHT")
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
  }

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying) return

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] }

      switch (direction) {
        case "UP":
          head.y -= 1
          break
        case "DOWN":
          head.y += 1
          break
        case "LEFT":
          head.x -= 1
          break
        case "RIGHT":
          head.x += 1
          break
      }

      // Check collisions
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true)
        setIsPlaying(false)
        if (score > highScore) {
          setHighScore(score)
          localStorage.setItem("snake_highscore", score.toString())
        }
        return prevSnake
      }

      const newSnake = [head, ...prevSnake]

      // Check food
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 10)
        setFood(generateFood())
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameOver, isPlaying, score, highScore, generateFood])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP")
          break
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN")
          break
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT")
          break
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT")
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [direction])

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10))
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPlaying, gameOver, moveSnake, score])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-white p-4">
      <div className="mb-4 flex items-center gap-8">
        <div className="text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Puntuación</p>
          <p className="text-2xl font-bold font-mono text-green-400">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Récord</p>
          <p className="text-2xl font-bold font-mono text-yellow-400">{highScore}</p>
        </div>
      </div>

      <div
        className="relative bg-black border-2 border-zinc-700 rounded-lg shadow-2xl"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {snake.map((segment, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: i === 0 ? "#4ade80" : "#22c55e",
              zIndex: 10,
            }}
          />
        ))}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            backgroundColor: "#ef4444",
            boxShadow: "0 0 10px #ef4444",
          }}
        />

        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            {gameOver && (
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-red-500 mb-2">¡Game Over!</h2>
                <p className="text-zinc-400">Puntuación final: {score}</p>
              </div>
            )}
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
            >
              {gameOver ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {gameOver ? "Jugar de nuevo" : "Jugar"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-zinc-500 flex items-center gap-2">
        <span>Usa las flechas del teclado para moverte</span>
      </div>
    </div>
  )
}

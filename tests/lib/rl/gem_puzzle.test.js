import GemPuzzleRLEnvironment from '../../../lib/rl/gem_puzzle.js'

describe('env', () => {
	test('actions', () => {
		const env = new GemPuzzleRLEnvironment()
		expect(env.actions).toEqual([[0, 1, 2, 3]])
	})

	test('states', () => {
		const env = new GemPuzzleRLEnvironment()
		const states = env.states
		const n = env._size[0] * env._size[1]
		expect(states).toHaveLength(n)
		for (let i = 0; i < n; i++) {
			expect(states).toHaveLength(n)
		}
	})

	describe('evaluation', () => {
		test('set', () => {
			const env = new GemPuzzleRLEnvironment()
			const n = env._size[0] * env._size[1]
			env.evaluation = state => {
				expect(state).toHaveLength(n)
				return 1
			}

			const score = env._board.score()
			expect(score).toBe(1)
		})

		test('clear', () => {
			const env = new GemPuzzleRLEnvironment()
			const orgScore = env._board.score()
			env.evaluation = null

			const score = env._board.score()
			expect(score).toBe(orgScore)
		})
	})

	test('reset', () => {
		const env = new GemPuzzleRLEnvironment()
		const n = env._size[0] * env._size[1]

		const state = env.reset()
		expect(state).toHaveLength(n)
	})

	test('state', () => {
		const env = new GemPuzzleRLEnvironment()
		const n = env._size[0] * env._size[1]

		const state = env.state()
		expect(state).toHaveLength(n)
	})

	test('setState', () => {
		const env = new GemPuzzleRLEnvironment()

		const n = env._size[0] * env._size[1]
		const newState = Array.from({ length: n }, (_, i) => i - 1)
		env.setState(newState)

		const state = env.state()
		expect(state).toEqual(newState)
	})

	describe('step', () => {
		test('valid not finish', () => {
			const env = new GemPuzzleRLEnvironment()
			env._board.reset()

			const info = env.step([GemPuzzleRLEnvironment.UP])
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(-1)

			const n = env._size[0] * env._size[1]
			const state = info.state
			expect(state).toHaveLength(n)
		})

		test('valid finish', () => {
			const env = new GemPuzzleRLEnvironment()
			env._board.reset()

			env.step([GemPuzzleRLEnvironment.UP])
			const info = env.step([GemPuzzleRLEnvironment.DOWN])
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(10)

			const n = env._size[0] * env._size[1]
			const state = info.state
			expect(state).toHaveLength(n)
		})

		test('invalid not finish', () => {
			const env = new GemPuzzleRLEnvironment()
			env._board.reset()

			env.step([GemPuzzleRLEnvironment.UP])
			const info = env.step([GemPuzzleRLEnvironment.RIGHT])
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(-101)

			const n = env._size[0] * env._size[1]
			const state = info.state
			expect(state).toHaveLength(n)
		})

		test('invalid finish', () => {
			const env = new GemPuzzleRLEnvironment()
			env._board.reset()

			const info = env.step([GemPuzzleRLEnvironment.DOWN])
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(-90)

			const n = env._size[0] * env._size[1]
			const state = info.state
			expect(state).toHaveLength(n)
		})
	})
})

describe('board', () => {
	test('constructor', () => {
		const env = new GemPuzzleRLEnvironment()
		const board = env._board

		expect(board.size).toEqual([4, 4])
	})

	test('size', () => {
		const env = new GemPuzzleRLEnvironment()
		const board = env._board

		expect(board.size).toEqual([4, 4])
	})

	describe('finish', () => {
		test('init', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board

			expect(board.finish).toBeFalsy()
		})

		test('reset', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board.reset()

			expect(board.finish).toBeTruthy()
		})
	})

	test('emptyPosition', () => {
		const env = new GemPuzzleRLEnvironment()
		const board = env._board
		const ep = board.emptyPosition

		let emptyPos = [-1, -1]
		for (let i = 0; i < board.size[0]; i++) {
			for (let j = 0; j < board.size[1]; j++) {
				if (board.at([i, j]) === null) {
					emptyPos = [i, j]
				}
			}
		}

		expect(ep).toEqual(emptyPos)
	})

	test('toString', () => {
		const env = new GemPuzzleRLEnvironment()
		const board = env._board
		board.reset()

		expect(board.toString()).toBe(`0  1  2  3
4  5  6  7
8  9  10 11
12 13 14
`)
	})

	test('copy', () => {
		const env = new GemPuzzleRLEnvironment()
		const board = env._board
		const cp = board.copy()

		expect(cp.size).toEqual(board.size)
		for (let i = 0; i < board.size[0]; i++) {
			for (let j = 0; j < board.size[1]; j++) {
				expect(cp.at([i, j])).toBe(board.at([i, j]))
			}
		}
	})

	describe('score', () => {
		test('init', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			const score = board.score()

			let s = 0
			for (let i = 0; i < board.size[0]; i++) {
				for (let j = 0; j < board.size[1]; j++) {
					if (board.at([i, j]) === null) {
						continue
					}
					const v = board.at([i, j])
					s -= Math.abs(i - Math.floor(v / board.size[1])) + Math.abs(j - (v % board.size[1]))
				}
			}
			expect(score).toBe(s)
		})

		test('reset', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board.reset()
			const score = board.score()

			expect(score).toBe(0)
		})

		test('evaluator', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board._evaluator = () => {
				return 1
			}
			const score = board.score()

			expect(score).toBe(1)
		})
	})

	test.todo('at')

	describe('find', () => {
		test('number', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			for (let k = 0; k < 15; k++) {
				const ep = board.find(k)

				let emptyPos = [-1, -1]
				for (let i = 0; i < board.size[0]; i++) {
					for (let j = 0; j < board.size[1]; j++) {
						if (board.at([i, j]) === k) {
							emptyPos = [i, j]
						}
					}
				}

				expect(ep).toEqual(emptyPos)
			}
		})

		test('null', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			const ep = board.find(null)

			let emptyPos = [-1, -1]
			for (let i = 0; i < board.size[0]; i++) {
				for (let j = 0; j < board.size[1]; j++) {
					if (board.at([i, j]) === null) {
						emptyPos = [i, j]
					}
				}
			}

			expect(ep).toEqual(emptyPos)
		})

		test('not found', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			const ep = board.find(999)

			expect(ep).toBeNull()
		})
	})

	describe('move', () => {
		test('success', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board.reset()

			expect(board.emptyPosition).toEqual([3, 3])
			const upres = board.move(GemPuzzleRLEnvironment.UP)
			expect(upres).toBeTruthy()
			expect(board.emptyPosition).toEqual([2, 3])
			const ltres = board.move(GemPuzzleRLEnvironment.LEFT)
			expect(ltres).toBeTruthy()
			expect(board.emptyPosition).toEqual([2, 2])
			const dnres = board.move(GemPuzzleRLEnvironment.DOWN)
			expect(dnres).toBeTruthy()
			expect(board.emptyPosition).toEqual([3, 2])
			const rtres = board.move(GemPuzzleRLEnvironment.RIGHT)
			expect(rtres).toBeTruthy()
			expect(board.emptyPosition).toEqual([3, 3])
		})

		test('fail', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board.reset()

			expect(board.emptyPosition).toEqual([3, 3])
			const dnres = board.move(GemPuzzleRLEnvironment.DOWN)
			expect(dnres).toBeFalsy()
			expect(board.emptyPosition).toEqual([3, 3])
			const rtres = board.move(GemPuzzleRLEnvironment.RIGHT)
			expect(rtres).toBeFalsy()
			expect(board.emptyPosition).toEqual([3, 3])

			for (let i = 0; i < 3; i++) {
				board.move(GemPuzzleRLEnvironment.UP)
				board.move(GemPuzzleRLEnvironment.LEFT)
			}
			expect(board.emptyPosition).toEqual([0, 0])
			const upres = board.move(GemPuzzleRLEnvironment.UP)
			expect(upres).toBeFalsy()
			expect(board.emptyPosition).toEqual([0, 0])
			const ltres = board.move(GemPuzzleRLEnvironment.LEFT)
			expect(ltres).toBeFalsy()
			expect(board.emptyPosition).toEqual([0, 0])
		})
	})

	test('reset', () => {
		const env = new GemPuzzleRLEnvironment()
		const board = env._board
		board.reset()

		for (let i = 0, p = 0; i < board.size[0]; i++) {
			for (let j = 0; j < board.size[1]; j++, p++) {
				const v = p === board.size[0] * board.size[1] - 1 ? null : p
				expect(board.at([i, j])).toBe(v)
			}
		}
	})

	test('random', () => {
		const env = new GemPuzzleRLEnvironment()
		const board = env._board
		for (let i = 0; i < 100; i++) {
			board.random()

			const path = board.solve()

			path.forEach(m => board.move(m))
			expect(board.finish).toBeTruthy()
		}
	})

	describe('solve', () => {
		test('solved', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board.reset()

			const path = board.solve()

			expect(path).toHaveLength(0)
		})

		test('move bit before check 1', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board._size = [3, 3]
			board._board = [
				[3, 1, 5],
				[4, 0, null],
				[6, 2, 7],
			]

			const path = board.solve()
			path.forEach(m => board.move(m))
			expect(board.finish).toBeTruthy()
		})

		test('move bit before check 2', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board._size = [3, 3]
			board._board = [
				[3, 5, 2],
				[1, 7, null],
				[0, 6, 4],
			]

			const path = board.solve()
			path.forEach(m => board.move(m))
			expect(board.finish).toBeTruthy()
		})

		test('move bit before check 3', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board._size = [4, 4]
			board._board = [
				[4, 0, 3, 2],
				[8, 6, 1, 7],
				[5, 10, null, 14],
				[12, 11, 13, 9],
			]

			const path = board.solve()
			path.forEach(m => board.move(m))
			expect(board.finish).toBeTruthy()
		})

		test('need swap horizontal', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board._size = [3, 3]
			board._board = [
				[0, 2, 1],
				[3, 5, 4],
				[6, 7, null],
			]

			const path = board.solve()
			path.forEach(m => board.move(m))
			expect(board.finish).toBeTruthy()
		})

		test('need swap vertical', () => {
			const env = new GemPuzzleRLEnvironment()
			const board = env._board
			board._size = [3, 3]
			board._board = [
				[0, 1, 2],
				[6, 5, 4],
				[3, 7, null],
			]

			const path = board.solve()
			path.forEach(m => board.move(m))
			expect(board.finish).toBeTruthy()
		})
	})
})

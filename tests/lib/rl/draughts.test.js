import DraughtsRLEnvironment from '../../../lib/rl/draughts.js'

describe('board', () => {
	test('constructor', () => {
		const env = new DraughtsRLEnvironment()
		const board = env._board

		expect(board.size).toEqual([8, 8])
		for (let i = 0; i < 8; i += 2) {
			expect(board.at([0, i])).toBe(DraughtsRLEnvironment.RED)
			expect(board.at([1, i + 1])).toBe(DraughtsRLEnvironment.RED)
			expect(board.at([2, i])).toBe(DraughtsRLEnvironment.RED)

			expect(board.at([5, i + 1])).toBe(DraughtsRLEnvironment.WHITE)
			expect(board.at([6, i])).toBe(DraughtsRLEnvironment.WHITE)
			expect(board.at([7, i + 1])).toBe(DraughtsRLEnvironment.WHITE)
		}
		expect(board.finish).toBeFalsy()
		expect(board.count.red).toBe(12)
		expect(board.count.white).toBe(12)
		expect(board.winner).toBeNull()
		expect(board.score(DraughtsRLEnvironment.RED)).toBe(0)
		expect(board.score(DraughtsRLEnvironment.WHITE)).toBe(0)
	})

	test('choices', () => {
		const env = new DraughtsRLEnvironment()
		const board = env._board

		const choiceRed = board.choices(DraughtsRLEnvironment.RED)
		expect(choiceRed).toEqual([
			{ from: [2, 0], path: [[3, 1]], jump: [] },
			{ from: [2, 2], path: [[3, 3]], jump: [] },
			{ from: [2, 2], path: [[3, 1]], jump: [] },
			{ from: [2, 4], path: [[3, 5]], jump: [] },
			{ from: [2, 4], path: [[3, 3]], jump: [] },
			{ from: [2, 6], path: [[3, 7]], jump: [] },
			{ from: [2, 6], path: [[3, 5]], jump: [] },
		])
		const choiceWhite = board.choices(DraughtsRLEnvironment.WHITE)
		expect(choiceWhite).toEqual([
			{ from: [5, 1], path: [[4, 2]], jump: [] },
			{ from: [5, 1], path: [[4, 0]], jump: [] },
			{ from: [5, 3], path: [[4, 4]], jump: [] },
			{ from: [5, 3], path: [[4, 2]], jump: [] },
			{ from: [5, 5], path: [[4, 6]], jump: [] },
			{ from: [5, 5], path: [[4, 4]], jump: [] },
			{ from: [5, 7], path: [[4, 6]], jump: [] },
		])
	})

	describe('set', () => {
		test('success', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			expect(board.at([2, 0])).toBe(DraughtsRLEnvironment.RED)
			expect(board.at([3, 1])).toBe(DraughtsRLEnvironment.EMPTY)

			const success = board.set({ from: [2, 0], path: [[3, 1]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeTruthy()
			expect(board.at([2, 0])).toBe(DraughtsRLEnvironment.EMPTY)
			expect(board.at([3, 1])).toBe(DraughtsRLEnvironment.RED)
		})

		test('fail', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [5, 1], path: [[4, 2]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})
	})

	test('nextTurn', () => {
		const env = new DraughtsRLEnvironment()
		const board = env._board

		expect(board.nextTurn(DraughtsRLEnvironment.RED)).toBe(DraughtsRLEnvironment.WHITE)
		expect(board.nextTurn(DraughtsRLEnvironment.WHITE)).toBe(DraughtsRLEnvironment.RED)
	})

	test('copy', () => {
		const env = new DraughtsRLEnvironment()
		const board = env._board

		const cp = board.copy()
		for (let i = 0; i < board.size[0]; i++) {
			for (let j = 0; j < board.size[1]; j++) {
				expect(cp.at([i, j])).toBe(board.at([i, j]))
			}
		}
	})

	test('winner', () => {
		const env = new DraughtsRLEnvironment()
		const board = env._board
		let turn = DraughtsRLEnvironment.RED

		while (!board.finish) {
			const choices = board.choices(turn)
			if (choices.length === 0) {
				turn = board.nextTurn(turn)
				continue
			}

			board.set(choices[0], turn)
			turn = board.nextTurn(turn)
		}

		expect(board.winner).not.toBeNull()
	})
})

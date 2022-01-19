import GomokuRLEnvironment from '../../../lib/rl/gomoku.js'

describe('board', () => {
	test('constructor', () => {
		const env = new GomokuRLEnvironment()
		const board = env._board

		expect(board.size).toEqual([8, 8])
		expect(board.finish).toBeFalsy()
		expect(board.winner).toBeNull()
	})

	test('choices', () => {
		const env = new GomokuRLEnvironment()
		const board = env._board

		const c = []
		for (let i = 0; i < board.size[0]; i++) {
			for (let j = 0; j < board.size[1]; j++) {
				c.push([i, j])
			}
		}

		const choiceBlack = board.choices(GomokuRLEnvironment.BLACK)
		expect(choiceBlack).toEqual(c)
		const choiceWhite = board.choices(GomokuRLEnvironment.WHITE)
		expect(choiceWhite).toEqual(c)
	})

	describe('set', () => {
		test('success', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board

			expect(board.at([2, 4])).toBe(GomokuRLEnvironment.EMPTY)

			const success = board.set([2, 4], GomokuRLEnvironment.BLACK)
			expect(success).toBeTruthy()
			expect(board.at([2, 4])).toBe(GomokuRLEnvironment.BLACK)
		})

		test('fail', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board

			board.set([2, 4], GomokuRLEnvironment.BLACK)
			const success = board.set([2, 4], GomokuRLEnvironment.WHITE)
			expect(success).toBeFalsy()
		})
	})

	test('nextTurn', () => {
		const env = new GomokuRLEnvironment()
		const board = env._board

		expect(board.nextTurn(GomokuRLEnvironment.BLACK)).toBe(GomokuRLEnvironment.WHITE)
		expect(board.nextTurn(GomokuRLEnvironment.WHITE)).toBe(GomokuRLEnvironment.BLACK)
	})

	test('copy', () => {
		const env = new GomokuRLEnvironment()
		const board = env._board

		const cp = board.copy()
		for (let i = 0; i < board.size[0]; i++) {
			for (let j = 0; j < board.size[1]; j++) {
				expect(cp.at([i, j])).toBe(board.at([i, j]))
			}
		}
	})

	test('winner', () => {
		const env = new GomokuRLEnvironment()
		const board = env._board
		let turn = GomokuRLEnvironment.BLACK

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

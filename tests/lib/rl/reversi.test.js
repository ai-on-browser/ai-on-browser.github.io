import ReversiRLEnvironment from '../../../lib/rl/reversi.js'

describe('board', () => {
	test('constructor', () => {
		const env = new ReversiRLEnvironment()
		const board = env._board

		expect(board.size).toEqual([8, 8])
		expect(board.at([3, 3])).toBe(ReversiRLEnvironment.BLACK)
		expect(board.at([4, 4])).toBe(ReversiRLEnvironment.BLACK)
		expect(board.at([3, 4])).toBe(ReversiRLEnvironment.WHITE)
		expect(board.at([4, 3])).toBe(ReversiRLEnvironment.WHITE)
		expect(board.finish).toBeFalsy()
		expect(board.count.black).toBe(2)
		expect(board.count.white).toBe(2)
		expect(board.winner).toBeNull()
		expect(board.score(ReversiRLEnvironment.BLACK)).toBe(0)
		expect(board.score(ReversiRLEnvironment.WHITE)).toBe(0)
	})

	test('choices', () => {
		const env = new ReversiRLEnvironment()
		const board = env._board

		const choiceBlack = board.choices(ReversiRLEnvironment.BLACK)
		expect(choiceBlack).toEqual([
			[2, 4],
			[3, 5],
			[4, 2],
			[5, 3],
		])
		const choiceWhite = board.choices(ReversiRLEnvironment.WHITE)
		expect(choiceWhite).toEqual([
			[2, 3],
			[3, 2],
			[4, 5],
			[5, 4],
		])
	})

	describe('set', () => {
		test('success', () => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			expect(board.at([2, 4])).toBe(ReversiRLEnvironment.EMPTY)
			expect(board.at([3, 4])).toBe(ReversiRLEnvironment.WHITE)

			const success = board.set([2, 4], ReversiRLEnvironment.BLACK)
			expect(success).toBeTruthy()
			expect(board.at([2, 4])).toBe(ReversiRLEnvironment.BLACK)
			expect(board.at([3, 4])).toBe(ReversiRLEnvironment.BLACK)
		})

		test('fail', () => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			const success = board.set([2, 4], ReversiRLEnvironment.WHITE)
			expect(success).toBeFalsy()
		})
	})

	test('nextTurn', () => {
		const env = new ReversiRLEnvironment()
		const board = env._board

		expect(board.nextTurn(ReversiRLEnvironment.EMPTY)).toBe(ReversiRLEnvironment.EMPTY)
		expect(board.nextTurn(ReversiRLEnvironment.BLACK)).toBe(ReversiRLEnvironment.WHITE)
		expect(board.nextTurn(ReversiRLEnvironment.WHITE)).toBe(ReversiRLEnvironment.BLACK)
	})

	test('copy', () => {
		const env = new ReversiRLEnvironment()
		const board = env._board

		const cp = board.copy()
		for (let i = 0; i < board.size[0]; i++) {
			for (let j = 0; j < board.size[1]; j++) {
				expect(cp.at([i, j])).toBe(board.at([i, j]))
			}
		}
	})

	test('winner', () => {
		const env = new ReversiRLEnvironment()
		const board = env._board
		let turn = ReversiRLEnvironment.BLACK

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

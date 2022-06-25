import ReversiRLEnvironment from '../../../lib/rl/reversi.js'

describe('env', () => {
	test('static property', () => {
		expect(ReversiRLEnvironment.EMPTY).not.toBe(ReversiRLEnvironment.BLACK)
		expect(ReversiRLEnvironment.EMPTY).not.toBe(ReversiRLEnvironment.WHITE)
		expect(ReversiRLEnvironment.BLACK).not.toBe(ReversiRLEnvironment.WHITE)

		expect(ReversiRLEnvironment.EMPTY).not.toBe(ReversiRLEnvironment.OWN)
		expect(ReversiRLEnvironment.EMPTY).not.toBe(ReversiRLEnvironment.OTHER)
		expect(ReversiRLEnvironment.OWN).not.toBe(ReversiRLEnvironment.OTHER)
	})

	test('constructor', () => {
		const env = new ReversiRLEnvironment()

		expect(env.actions[0]).toHaveLength(1 + 8 * 8)
		expect(env.states).toHaveLength(1 + 8 * 8)
	})

	describe('reset', () => {
		test('success', () => {
			const env = new ReversiRLEnvironment()

			const state = env.reset()
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(ReversiRLEnvironment.BLACK)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						(i === 3 && j === 3) || (i === 4 && j === 4)
							? ReversiRLEnvironment.OWN
							: (i === 3 && j === 4) || (i === 4 && j === 3)
							? ReversiRLEnvironment.OTHER
							: ReversiRLEnvironment.EMPTY
					)
				}
			}
		})
	})

	describe('state', () => {
		test.each([ReversiRLEnvironment.BLACK, ReversiRLEnvironment.WHITE])('success %i', agent => {
			const env = new ReversiRLEnvironment()
			env.reset(0, 1)

			const black = agent === ReversiRLEnvironment.BLACK ? ReversiRLEnvironment.OWN : ReversiRLEnvironment.OTHER
			const white = agent === ReversiRLEnvironment.BLACK ? ReversiRLEnvironment.OTHER : ReversiRLEnvironment.OWN

			const state = env.state(agent)
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(ReversiRLEnvironment.BLACK)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						(i === 3 && j === 3) || (i === 4 && j === 4)
							? black
							: (i === 3 && j === 4) || (i === 4 && j === 3)
							? white
							: ReversiRLEnvironment.EMPTY
					)
				}
			}
		})

		test('failed before reset', () => {
			const env = new ReversiRLEnvironment()
			expect(() => env.state(ReversiRLEnvironment.BLACK)).toThrowError(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 4])('failed %p', agent => {
			const env = new ReversiRLEnvironment()
			env.reset()
			expect(() => env.state(agent)).toThrowError('Unknown agent.')
		})
	})

	describe('step', () => {
		test('success', () => {
			const env = new ReversiRLEnvironment()
			env.reset()

			const info = env.step(['3_5'], ReversiRLEnvironment.BLACK)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(ReversiRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						(i === 3 && j === 3) || (i === 4 && j === 4) || (i === 3 && j === 4) || (i === 3 && j === 5)
							? ReversiRLEnvironment.OWN
							: i === 4 && j === 3
							? ReversiRLEnvironment.OTHER
							: ReversiRLEnvironment.EMPTY
					)
				}
			}
			expect(state).toEqual(env.state(ReversiRLEnvironment.BLACK))
			expect(env.epoch).toBe(1)
		})

		test('invalid position', () => {
			const env = new ReversiRLEnvironment()
			const state = env.reset()

			const info = env.step(['0_0'], ReversiRLEnvironment.BLACK)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(state)
			expect(env.epoch).toBe(0)
		})

		test('invalid skip', () => {
			const env = new ReversiRLEnvironment()
			const state = env.reset()

			const info = env.step([ReversiRLEnvironment.EMPTY], ReversiRLEnvironment.BLACK)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(state)
			expect(env.epoch).toBe(0)
		})

		test('invalid turn', () => {
			const env = new ReversiRLEnvironment()
			env.reset()

			const info = env.step(['0_0'], ReversiRLEnvironment.WHITE)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(env.state(ReversiRLEnvironment.WHITE))
			expect(env.epoch).toBe(0)
		})

		test('failed before reset', () => {
			const env = new ReversiRLEnvironment()
			expect(() => env.step(['3_5'], ReversiRLEnvironment.BLACK)).toThrowError(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 4])('failed %p', agent => {
			const env = new ReversiRLEnvironment()
			env.reset()
			expect(() => env.step(['3_5'], agent)).toThrowError('Unknown agent.')
		})
	})

	describe('test', () => {
		test('step', () => {
			const env = new ReversiRLEnvironment()
			const orgstate = env.reset()

			const info = env.test(orgstate, ['3_5'], ReversiRLEnvironment.BLACK)
			expect(info.invalid).toBeFalsy()

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(ReversiRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						(i === 3 && j === 3) || (i === 4 && j === 4) || (i === 3 && j === 4) || (i === 3 && j === 5)
							? ReversiRLEnvironment.OWN
							: i === 4 && j === 3
							? ReversiRLEnvironment.OTHER
							: ReversiRLEnvironment.EMPTY
					)
				}
			}
			expect(orgstate).toEqual(env.state(ReversiRLEnvironment.BLACK))
			expect(env.epoch).toBe(0)
		})
	})
})

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

import GomokuRLEnvironment from '../../../lib/rl/gomoku.js'

describe('env', () => {
	test('static property', () => {
		expect(GomokuRLEnvironment.EMPTY).not.toBe(GomokuRLEnvironment.BLACK)
		expect(GomokuRLEnvironment.EMPTY).not.toBe(GomokuRLEnvironment.WHITE)
		expect(GomokuRLEnvironment.BLACK).not.toBe(GomokuRLEnvironment.WHITE)

		expect(GomokuRLEnvironment.EMPTY).not.toBe(GomokuRLEnvironment.OWN)
		expect(GomokuRLEnvironment.EMPTY).not.toBe(GomokuRLEnvironment.OTHER)
		expect(GomokuRLEnvironment.OWN).not.toBe(GomokuRLEnvironment.OTHER)
	})

	test('constructor', () => {
		const env = new GomokuRLEnvironment()

		expect(env.actions[0]).toHaveLength(8 * 8)
		expect(env.states).toHaveLength(1 + 8 * 8)
	})

	describe('evaluation', () => {
		test('set', () => {
			const env = new GomokuRLEnvironment()
			env.evaluation = state => {
				expect(state).toHaveLength(1 + 8 * 8)
				return 1
			}

			const score = env._board.score()
			expect(score).toBe(1)
		})

		test('clear', () => {
			const env = new GomokuRLEnvironment()
			env.evaluation = null

			const score = env._board.score()
			expect(score).toBe(0)
		})
	})

	describe('reset', () => {
		test('success', () => {
			const env = new GomokuRLEnvironment()

			const state = env.reset()
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(GomokuRLEnvironment.BLACK)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(GomokuRLEnvironment.EMPTY)
				}
			}
		})
	})

	describe('state', () => {
		test.each([undefined, GomokuRLEnvironment.BLACK, GomokuRLEnvironment.WHITE])('success %i', agent => {
			const env = new GomokuRLEnvironment()
			env.reset(0, 1)
			env.step(['1_1'], GomokuRLEnvironment.BLACK)
			env.step(['2_2'], GomokuRLEnvironment.WHITE)

			const black =
				agent === undefined || agent === GomokuRLEnvironment.BLACK
					? GomokuRLEnvironment.OWN
					: GomokuRLEnvironment.OTHER
			const white =
				agent === undefined || agent === GomokuRLEnvironment.BLACK
					? GomokuRLEnvironment.OTHER
					: GomokuRLEnvironment.OWN

			const state = env.state(agent)
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(GomokuRLEnvironment.BLACK)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						i === 1 && j === 1 ? black : i === 2 && j === 2 ? white : GomokuRLEnvironment.EMPTY
					)
				}
			}
		})

		test('failed before reset', () => {
			const env = new GomokuRLEnvironment()
			expect(() => env.state(GomokuRLEnvironment.BLACK)).toThrow(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 4])('failed %p', agent => {
			const env = new GomokuRLEnvironment()
			env.reset()
			expect(() => env.state(agent)).toThrow('Unknown agent.')
		})
	})

	describe('step', () => {
		test.each([undefined, GomokuRLEnvironment.BLACK])('success agent: %p', agent => {
			const env = new GomokuRLEnvironment()
			env.reset()

			const info = env.step(['3_5'], agent)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(GomokuRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(i === 3 && j === 5 ? GomokuRLEnvironment.OWN : GomokuRLEnvironment.EMPTY)
				}
			}
			expect(state).toEqual(env.state(GomokuRLEnvironment.BLACK))
			expect(env.epoch).toBe(1)
		})

		test('win black', () => {
			const env = new GomokuRLEnvironment()
			env.reset()

			env.step(['0_0'], GomokuRLEnvironment.BLACK)
			env.step(['1_0'], GomokuRLEnvironment.WHITE)
			env.step(['0_1'], GomokuRLEnvironment.BLACK)
			env.step(['1_1'], GomokuRLEnvironment.WHITE)
			env.step(['0_2'], GomokuRLEnvironment.BLACK)
			env.step(['1_2'], GomokuRLEnvironment.WHITE)
			env.step(['0_3'], GomokuRLEnvironment.BLACK)
			env.step(['1_3'], GomokuRLEnvironment.WHITE)

			const info = env.step(['0_4'], GomokuRLEnvironment.BLACK)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(1)
			expect(env.epoch).toBe(9)

			const info2 = env.step(['1_5'], GomokuRLEnvironment.WHITE)
			expect(info2.invalid).toBeFalsy()
			expect(info2.done).toBeTruthy()
			expect(info2.reward).toBe(-1)
			expect(env.epoch).toBe(10)
		})

		test('invalid position', () => {
			const env = new GomokuRLEnvironment()
			env.reset()
			env.step(['0_0'], GomokuRLEnvironment.BLACK)

			const info = env.step(['0_0'], GomokuRLEnvironment.WHITE)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(env.state(GomokuRLEnvironment.WHITE))
			expect(env.epoch).toBe(1)
		})

		test('invalid turn', () => {
			const env = new GomokuRLEnvironment()
			env.reset()

			const info = env.step(['0_0'], GomokuRLEnvironment.WHITE)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(env.state(GomokuRLEnvironment.WHITE))
			expect(env.epoch).toBe(0)
		})

		test('failed before reset', () => {
			const env = new GomokuRLEnvironment()
			expect(() => env.step(['3_5'], GomokuRLEnvironment.BLACK)).toThrow(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 4])('failed %p', agent => {
			const env = new GomokuRLEnvironment()
			env.reset()
			expect(() => env.step(['3_5'], agent)).toThrow('Unknown agent.')
		})
	})

	describe('test', () => {
		test.each([undefined, GomokuRLEnvironment.BLACK])('step agent: %p', agent => {
			const env = new GomokuRLEnvironment()
			const orgstate = env.reset()

			const info = env.test(orgstate, ['3_5'], agent)
			expect(info.invalid).toBeFalsy()

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(GomokuRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(i === 3 && j === 5 ? GomokuRLEnvironment.OWN : GomokuRLEnvironment.EMPTY)
				}
			}
			expect(orgstate).toEqual(env.state(GomokuRLEnvironment.BLACK))
			expect(env.epoch).toBe(0)
		})
	})
})

describe('board', () => {
	test('constructor', () => {
		const env = new GomokuRLEnvironment()
		const board = env._board

		expect(board.size).toEqual([8, 8])
		expect(board.finish).toBeFalsy()
		expect(board.winner).toBeNull()
	})

	describe('winner', () => {
		test.each(['black', 'white'])('%s', winner => {
			const env = new GomokuRLEnvironment()
			const board = env._board
			const turn = winner === 'black' ? GomokuRLEnvironment.BLACK : GomokuRLEnvironment.WHITE
			board.set([0, 0], turn)
			board.set([0, 1], turn)
			board.set([0, 2], turn)
			board.set([0, 3], turn)
			board.set([0, 4], turn)

			expect(board.winner).toBe(turn)
		})

		test('game', () => {
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

	test('toString', () => {
		const env = new GomokuRLEnvironment()
		const board = env._board

		board.set([2, 4], GomokuRLEnvironment.BLACK)
		board.set([3, 6], GomokuRLEnvironment.WHITE)

		expect(board.toString()).toBe(`- - - - - - - -
- - - - - - - -
- - - - x - - -
- - - - - - o -
- - - - - - - -
- - - - - - - -
- - - - - - - -
- - - - - - - -
`)
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

	describe('score', () => {
		test('win', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board

			board.set([0, 0], GomokuRLEnvironment.BLACK)
			board.set([1, 0], GomokuRLEnvironment.WHITE)
			board.set([0, 1], GomokuRLEnvironment.BLACK)
			board.set([1, 1], GomokuRLEnvironment.WHITE)
			board.set([0, 2], GomokuRLEnvironment.BLACK)
			board.set([1, 2], GomokuRLEnvironment.WHITE)
			board.set([0, 3], GomokuRLEnvironment.BLACK)
			board.set([1, 3], GomokuRLEnvironment.WHITE)
			board.set([0, 4], GomokuRLEnvironment.BLACK)

			expect(board.score(GomokuRLEnvironment.BLACK)).toBe(6391)
			expect(board.score(GomokuRLEnvironment.WHITE)).toBe(-6391)
		})
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

	describe('choices', () => {
		test('all', () => {
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

		test('finish', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board
			board.set([0, 0], GomokuRLEnvironment.BLACK)
			board.set([0, 1], GomokuRLEnvironment.BLACK)
			board.set([0, 2], GomokuRLEnvironment.BLACK)
			board.set([0, 3], GomokuRLEnvironment.BLACK)
			board.set([0, 4], GomokuRLEnvironment.BLACK)

			const choiceBlack = board.choices(GomokuRLEnvironment.BLACK)
			expect(choiceBlack).toHaveLength(0)
			const choiceWhite = board.choices(GomokuRLEnvironment.WHITE)
			expect(choiceWhite).toHaveLength(0)
		})
	})

	describe('row', () => {
		test('empty', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board

			const row = board.row(GomokuRLEnvironment.BLACK, 0)
			expect(row).toHaveLength(0)
		})

		test('connect row', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board
			board.set([1, 1], GomokuRLEnvironment.BLACK)
			board.set([1, 2], GomokuRLEnvironment.BLACK)
			board.set([1, 3], GomokuRLEnvironment.BLACK)

			const row = board.row(GomokuRLEnvironment.BLACK, 3)
			expect(row).toHaveLength(1)
			expect(row[0]).toEqual({
				path: [
					[1, 1],
					[1, 2],
					[1, 3],
				],
				s: [
					[1, 4],
					[1, 0],
				],
			})
		})

		test('connect row multi', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board
			board.set([1, 0], GomokuRLEnvironment.BLACK)
			board.set([1, 1], GomokuRLEnvironment.BLACK)
			board.set([2, 1], GomokuRLEnvironment.BLACK)

			const row = board.row(GomokuRLEnvironment.BLACK, 2)
			expect(row).toHaveLength(3)
			expect(row[0]).toEqual({
				path: [
					[1, 0],
					[2, 1],
				],
				s: [[3, 2]],
			})
			expect(row[1]).toEqual({
				path: [
					[1, 0],
					[1, 1],
				],
				s: [[1, 2]],
			})
			expect(row[2]).toEqual({
				path: [
					[1, 1],
					[2, 1],
				],
				s: [
					[3, 1],
					[0, 1],
				],
			})
		})

		test('separate row', () => {
			const env = new GomokuRLEnvironment()
			const board = env._board
			board.set([1, 1], GomokuRLEnvironment.BLACK)
			board.set([1, 3], GomokuRLEnvironment.BLACK)
			board.set([1, 4], GomokuRLEnvironment.BLACK)

			const row = board.row(GomokuRLEnvironment.BLACK, 3, true)
			expect(row).toHaveLength(1)
			expect(row[0]).toEqual({
				path: [
					[1, 1],
					[1, 3],
					[1, 4],
				],
				s: [[1, 2]],
			})
		})
	})
})

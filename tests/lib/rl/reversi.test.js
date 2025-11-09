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
						(i === 3 && j === 4) || (i === 4 && j === 3)
							? ReversiRLEnvironment.OWN
							: (i === 3 && j === 3) || (i === 4 && j === 4)
								? ReversiRLEnvironment.OTHER
								: ReversiRLEnvironment.EMPTY
					)
				}
			}
		})
	})

	describe('state', () => {
		test.each([undefined, ReversiRLEnvironment.BLACK, ReversiRLEnvironment.WHITE])('success %j', agent => {
			const env = new ReversiRLEnvironment()
			env.reset(0, 1)

			const black =
				agent === undefined || agent === ReversiRLEnvironment.BLACK
					? ReversiRLEnvironment.OWN
					: ReversiRLEnvironment.OTHER
			const white =
				agent === undefined || agent === ReversiRLEnvironment.BLACK
					? ReversiRLEnvironment.OTHER
					: ReversiRLEnvironment.OWN

			const state = env.state(agent)
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(ReversiRLEnvironment.BLACK)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						(i === 3 && j === 4) || (i === 4 && j === 3)
							? black
							: (i === 3 && j === 3) || (i === 4 && j === 4)
								? white
								: ReversiRLEnvironment.EMPTY
					)
				}
			}
		})

		test('failed before reset', () => {
			const env = new ReversiRLEnvironment()
			expect(() => env.state(ReversiRLEnvironment.BLACK)).toThrow(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 4])('failed %j', agent => {
			const env = new ReversiRLEnvironment()
			env.reset()
			expect(() => env.state(agent)).toThrow('Unknown agent.')
		})
	})

	describe('step', () => {
		test.each([undefined, ReversiRLEnvironment.BLACK])('success agent: %j', agent => {
			const env = new ReversiRLEnvironment()
			env.reset()

			const info = env.step(['f5'], agent)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(ReversiRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						(i === 3 && j === 4) || (i === 4 && j === 3) || (i === 4 && j === 4) || (i === 4 && j === 5)
							? ReversiRLEnvironment.OWN
							: i === 3 && j === 3
								? ReversiRLEnvironment.OTHER
								: ReversiRLEnvironment.EMPTY
					)
				}
			}
			expect(state).toEqual(env.state(ReversiRLEnvironment.BLACK))
			expect(env.epoch).toBe(1)
		})

		test('no action', () => {
			const env = new ReversiRLEnvironment()
			env.reset()

			env.step(['f5'])
			env.step(['f6'])
			env.step(['d3'])
			env.step(['g5'])
			env.step(['h5'])
			env.step(['h4'])
			env.step(['f7'])
			env.step(['h6'])

			const info = env.step([ReversiRLEnvironment.EMPTY])
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(env.epoch).toBe(9)
		})

		test('win black', () => {
			const env = new ReversiRLEnvironment()
			env.reset()

			env.step(['f5'])
			env.step(['d6'])
			env.step(['c5'])
			env.step(['f4'])
			env.step(['e3'])
			env.step(['f6'])
			env.step(['g5'])
			env.step(['e6'])

			const info = env.step(['e7'])
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(1)
			expect(env.epoch).toBe(9)

			const info2 = env.step([ReversiRLEnvironment.EMPTY])
			expect(info2.invalid).toBeFalsy()
			expect(info2.done).toBeTruthy()
			expect(info2.reward).toBe(-1)
		})

		test('invalid position', () => {
			const env = new ReversiRLEnvironment()
			const state = env.reset()

			const info = env.step(['a1'], ReversiRLEnvironment.BLACK)
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

			const info = env.step(['a1'], ReversiRLEnvironment.WHITE)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(env.state(ReversiRLEnvironment.WHITE))
			expect(env.epoch).toBe(0)
		})

		test('failed before reset', () => {
			const env = new ReversiRLEnvironment()
			expect(() => env.step(['f4'], ReversiRLEnvironment.BLACK)).toThrow(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 4])('failed %j', agent => {
			const env = new ReversiRLEnvironment()
			env.reset()
			expect(() => env.step(['f4'], agent)).toThrow('Unknown agent.')
		})
	})

	describe('test', () => {
		test.each([undefined, ReversiRLEnvironment.BLACK])('step agent: %j', agent => {
			const env = new ReversiRLEnvironment()
			const orgstate = env.reset()

			const info = env.test(orgstate, ['f5'], agent)
			expect(info.invalid).toBeFalsy()

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(ReversiRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						(i === 3 && j === 4) || (i === 4 && j === 3) || (i === 4 && j === 4) || (i === 4 && j === 5)
							? ReversiRLEnvironment.OWN
							: i === 3 && j === 3
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
		expect(board.at([3, 3])).toBe(ReversiRLEnvironment.WHITE)
		expect(board.at([4, 4])).toBe(ReversiRLEnvironment.WHITE)
		expect(board.at([3, 4])).toBe(ReversiRLEnvironment.BLACK)
		expect(board.at([4, 3])).toBe(ReversiRLEnvironment.BLACK)
		expect(board.finish).toBeFalsy()
		expect(board.count.black).toBe(2)
		expect(board.count.white).toBe(2)
		expect(board.winner).toBeNull()
		expect(board.score(ReversiRLEnvironment.BLACK)).toBe(0)
		expect(board.score(ReversiRLEnvironment.WHITE)).toBe(0)
	})

	describe('winner', () => {
		test('random', () => {
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

		test('black', () => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			const ps = ['f5', 'd6', 'c5', 'f4', 'e3', 'f6', 'g5', 'e6', 'e7']
			for (let i = 0; i < ps.length; i++) {
				board.set(ps[i], i % 2 === 0 ? ReversiRLEnvironment.BLACK : ReversiRLEnvironment.WHITE)
			}
			expect(board.winner).toBe(ReversiRLEnvironment.BLACK)
		})

		test('white', () => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			const ps = ['f5', 'f6', 'c4', 'f4', 'e6', 'b4', 'g6', 'f7', 'e8', 'g8', 'g5', 'h5']
			for (let i = 0; i < ps.length; i++) {
				board.set(ps[i], i % 2 === 0 ? ReversiRLEnvironment.BLACK : ReversiRLEnvironment.WHITE)
			}
			expect(board.winner).toBe(ReversiRLEnvironment.WHITE)
		})

		test('draw', () => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			board.set('f5', ReversiRLEnvironment.BLACK)
			board.set('d6', ReversiRLEnvironment.WHITE)
			board.set('c7', ReversiRLEnvironment.BLACK)
			board.set('f3', ReversiRLEnvironment.WHITE)
			board.set('e3', ReversiRLEnvironment.BLACK)
			board.set('d3', ReversiRLEnvironment.WHITE)
			board.set('g2', ReversiRLEnvironment.BLACK)
			board.set('f4', ReversiRLEnvironment.WHITE)
			board.set('c6', ReversiRLEnvironment.BLACK)
			board.set('d7', ReversiRLEnvironment.WHITE)
			board.set('g4', ReversiRLEnvironment.BLACK)
			board.set('b7', ReversiRLEnvironment.WHITE)
			board.set('a8', ReversiRLEnvironment.BLACK)
			board.set('g3', ReversiRLEnvironment.WHITE)
			board.set('c8', ReversiRLEnvironment.BLACK)
			board.set('h1', ReversiRLEnvironment.WHITE)
			board.set('c4', ReversiRLEnvironment.BLACK)
			board.set('b8', ReversiRLEnvironment.WHITE)
			board.set('f2', ReversiRLEnvironment.BLACK)
			board.set('e1', ReversiRLEnvironment.WHITE)
			board.set('f1', ReversiRLEnvironment.BLACK)
			board.set('d8', ReversiRLEnvironment.WHITE)
			board.set('e8', ReversiRLEnvironment.BLACK)
			board.set('a7', ReversiRLEnvironment.WHITE)
			board.set('a6', ReversiRLEnvironment.BLACK)
			board.set('b6', ReversiRLEnvironment.WHITE)
			board.set('a5', ReversiRLEnvironment.BLACK)
			board.set('g1', ReversiRLEnvironment.WHITE)
			board.set('b5', ReversiRLEnvironment.BLACK)
			board.set('e2', ReversiRLEnvironment.WHITE)
			board.set('h2', ReversiRLEnvironment.BLACK)
			board.set('c3', ReversiRLEnvironment.WHITE)
			board.set('e6', ReversiRLEnvironment.BLACK)
			board.set('c5', ReversiRLEnvironment.WHITE)
			board.set('b4', ReversiRLEnvironment.BLACK)
			board.set('e7', ReversiRLEnvironment.WHITE)
			board.set('b3', ReversiRLEnvironment.BLACK)
			board.set('d2', ReversiRLEnvironment.WHITE)
			board.set('c1', ReversiRLEnvironment.BLACK)
			board.set('d1', ReversiRLEnvironment.WHITE)
			board.set('f8', ReversiRLEnvironment.BLACK)
			board.set('b1', ReversiRLEnvironment.WHITE)
			board.set('f7', ReversiRLEnvironment.BLACK)
			board.set('g6', ReversiRLEnvironment.WHITE)
			board.set('f6', ReversiRLEnvironment.BLACK)
			board.set('h3', ReversiRLEnvironment.WHITE)
			board.set('h6', ReversiRLEnvironment.BLACK)
			board.set('a3', ReversiRLEnvironment.WHITE)
			board.set('c2', ReversiRLEnvironment.BLACK)
			board.set('h7', ReversiRLEnvironment.WHITE)
			board.set('a2', ReversiRLEnvironment.BLACK)
			board.set('a4', ReversiRLEnvironment.WHITE)
			board.set('h8', ReversiRLEnvironment.BLACK)
			board.set('g7', ReversiRLEnvironment.WHITE)
			board.set('h5', ReversiRLEnvironment.BLACK)
			board.set('a1', ReversiRLEnvironment.WHITE)
			board.set('g8', ReversiRLEnvironment.BLACK)
			board.set('b2', ReversiRLEnvironment.WHITE)
			board.set('g5', ReversiRLEnvironment.BLACK)
			board.set('h4', ReversiRLEnvironment.WHITE)
			expect(board.winner).toBeNull()
		})
	})

	test('toString', () => {
		const env = new ReversiRLEnvironment()
		const board = env._board

		expect(board.toString()).toBe(`- - - - - - - -
- - - - - - - -
- - - - - - - -
- - - o x - - -
- - - x o - - -
- - - - - - - -
- - - - - - - -
- - - - - - - -
`)
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

	test.each([[3, 3], 'd4'])('at %j', p => {
		const env = new ReversiRLEnvironment()
		const board = env._board

		expect(board.at(p)).toBe(ReversiRLEnvironment.WHITE)
	})

	describe('set', () => {
		test.each([[2, 3], 'd3'])('success %j', p => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			expect(board.at([2, 3])).toBe(ReversiRLEnvironment.EMPTY)
			expect(board.at([3, 3])).toBe(ReversiRLEnvironment.WHITE)

			const success = board.set(p, ReversiRLEnvironment.BLACK)
			expect(success).toBeTruthy()
			expect(board.at([2, 3])).toBe(ReversiRLEnvironment.BLACK)
			expect(board.at([3, 3])).toBe(ReversiRLEnvironment.BLACK)
		})

		test('fail', () => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			const success = board.set([2, 3], ReversiRLEnvironment.WHITE)
			expect(success).toBeFalsy()
		})

		test('out of bounds', () => {
			const env = new ReversiRLEnvironment()
			const board = env._board

			const success = board.set([-1, -1], ReversiRLEnvironment.WHITE)
			expect(success).toBeFalsy()
		})
	})

	test('choices', () => {
		const env = new ReversiRLEnvironment()
		const board = env._board

		const choiceBlack = board.choices(ReversiRLEnvironment.BLACK)
		expect(choiceBlack).toEqual([
			[2, 3],
			[3, 2],
			[4, 5],
			[5, 4],
		])
		const choiceWhite = board.choices(ReversiRLEnvironment.WHITE)
		expect(choiceWhite).toEqual([
			[2, 4],
			[3, 5],
			[4, 2],
			[5, 3],
		])
	})
})

import DraughtsRLEnvironment from '../../../lib/rl/draughts.js'

describe('env', () => {
	test('static property', () => {
		expect(DraughtsRLEnvironment.EMPTY).not.toBe(DraughtsRLEnvironment.RED)
		expect(DraughtsRLEnvironment.EMPTY).not.toBe(DraughtsRLEnvironment.WHITE)
		expect(DraughtsRLEnvironment.RED).not.toBe(DraughtsRLEnvironment.WHITE)

		expect(DraughtsRLEnvironment.EMPTY).not.toBe(DraughtsRLEnvironment.OWN)
		expect(DraughtsRLEnvironment.EMPTY).not.toBe(DraughtsRLEnvironment.OTHER)
		expect(DraughtsRLEnvironment.OWN).not.toBe(DraughtsRLEnvironment.OTHER)
	})

	test('constructor', () => {
		const env = new DraughtsRLEnvironment()

		expect(env.actions[0]).toHaveLength(1 + 1426)
		expect(env.states).toHaveLength(1 + 8 * 4)
	})

	describe('evaluation', () => {
		test('set', () => {
			const env = new DraughtsRLEnvironment()
			env.evaluation = state => {
				expect(state).toHaveLength(1 + 8 * 4)
				return 1
			}

			const score = env._board.score()
			expect(score).toBe(1)
		})

		test('clear', () => {
			const env = new DraughtsRLEnvironment()
			env.evaluation = null

			const score = env._board.score()
			expect(score).toBe(0)
		})
	})

	describe('reset', () => {
		test('success', () => {
			const env = new DraughtsRLEnvironment()

			const state = env.reset()
			expect(state).toHaveLength(1 + 8 * 4)
			expect(state[0]).toBe(DraughtsRLEnvironment.RED)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = i % 2 === 0 ? 1 : 0; j < 8; j += 2, p++) {
					expect(state[p]).toBe(
						i < 3
							? DraughtsRLEnvironment.OWN
							: i >= 5
								? DraughtsRLEnvironment.OTHER
								: DraughtsRLEnvironment.EMPTY
					)
				}
			}
		})
	})

	describe('state', () => {
		test.each([undefined, DraughtsRLEnvironment.RED, DraughtsRLEnvironment.WHITE])('success %i', agent => {
			const env = new DraughtsRLEnvironment()
			env.reset(0, 1)

			const red =
				agent === undefined || agent === DraughtsRLEnvironment.RED
					? DraughtsRLEnvironment.OWN
					: DraughtsRLEnvironment.OTHER
			const white =
				agent === undefined || agent === DraughtsRLEnvironment.RED
					? DraughtsRLEnvironment.OTHER
					: DraughtsRLEnvironment.OWN

			const state = env.state(agent)
			expect(state).toHaveLength(1 + 8 * 4)
			expect(state[0]).toBe(DraughtsRLEnvironment.RED)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = i % 2 === 0 ? 1 : 0; j < 8; j += 2, p++) {
					expect(state[p]).toBe(i < 3 ? red : i >= 5 ? white : DraughtsRLEnvironment.EMPTY)
				}
			}
		})

		test('with king', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()

			env.step([{ from: 11, path: [16], jump: [] }], DraughtsRLEnvironment.RED)
			env.step([{ from: 22, path: [17], jump: [] }], DraughtsRLEnvironment.WHITE)
			env.step([{ from: 8, path: [11], jump: [] }], DraughtsRLEnvironment.RED)
			env.step([{ from: 26, path: [22], jump: [] }], DraughtsRLEnvironment.WHITE)
			env.step([{ from: 16, path: [20], jump: [] }], DraughtsRLEnvironment.RED)
			env.step([{ from: 22, path: [18], jump: [] }], DraughtsRLEnvironment.WHITE)
			env.step([{ from: 9, path: [13], jump: [] }], DraughtsRLEnvironment.RED)
			env.step([{ from: 31, path: [26], jump: [] }], DraughtsRLEnvironment.WHITE)
			env.step([{ from: 13, path: [22, 31], jump: [17, 26] }], DraughtsRLEnvironment.RED)

			const state = env.state(DraughtsRLEnvironment.RED)
			expect(state).toHaveLength(1 + 8 * 4)
			expect(state[31]).toBe(DraughtsRLEnvironment.OWN | DraughtsRLEnvironment.KING)
		})

		test('failed before reset', () => {
			const env = new DraughtsRLEnvironment()
			expect(() => env.state(DraughtsRLEnvironment.RED)).toThrow(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 3])('failed %p', agent => {
			const env = new DraughtsRLEnvironment()
			env.reset()
			expect(() => env.state(agent)).toThrow('Unknown agent.')
		})
	})

	describe('step', () => {
		test.each([undefined, DraughtsRLEnvironment.RED])('success agent: %p', agent => {
			const env = new DraughtsRLEnvironment()
			env.reset()

			const info = env.step([{ from: [2, 1], path: [[3, 2]], jump: [] }], agent)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 4)
			expect(state[0]).toBe(DraughtsRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = i % 2 === 0 ? 1 : 0; j < 8; j += 2, p++) {
					expect(state[p]).toBe(
						i < 2 || (i === 2 && j !== 1) || (i === 3 && j === 2)
							? DraughtsRLEnvironment.OWN
							: i >= 5
								? DraughtsRLEnvironment.OTHER
								: DraughtsRLEnvironment.EMPTY
					)
				}
			}
			expect(state).toEqual(env.state(DraughtsRLEnvironment.RED))
			expect(env.epoch).toBe(1)
		})

		test('invalid position', () => {
			const env = new DraughtsRLEnvironment()
			const state = env.reset()

			const info = env.step([{ from: [0, 0], path: [[1, 1]], jump: [] }], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(state)
			expect(env.epoch).toBe(0)
		})

		test('invalid skip', () => {
			const env = new DraughtsRLEnvironment()
			const state = env.reset()

			const info = env.step([DraughtsRLEnvironment.EMPTY], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(state)
			expect(env.epoch).toBe(0)
		})

		test('invalid turn', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()

			const info = env.step([{ from: [5, 1], path: [[4, 0]], jump: [] }], DraughtsRLEnvironment.WHITE)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(env.state(DraughtsRLEnvironment.WHITE))
			expect(env.epoch).toBe(0)
		})

		test('invalid no jump', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()

			const info1 = env.step([{ from: [2, 1], path: [[3, 2]], jump: [] }], DraughtsRLEnvironment.RED)
			expect(info1.invalid).toBeFalsy()
			expect(env.epoch).toBe(1)
			const info2 = env.step([{ from: [5, 4], path: [[4, 3]], jump: [] }], DraughtsRLEnvironment.WHITE)
			expect(info2.invalid).toBeFalsy()
			expect(env.epoch).toBe(2)

			const info = env.step([{ from: [2, 3], path: [[3, 4]], jump: [] }], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeTruthy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)
			expect(info.state).toEqual(env.state(DraughtsRLEnvironment.RED))
			expect(env.epoch).toBe(2)
		})

		test('failed before reset', () => {
			const env = new DraughtsRLEnvironment()
			expect(() => env.step([{ from: [2, 0], path: [[3, 1]], jump: [] }], DraughtsRLEnvironment.RED)).toThrow(
				'Agent does not exist. Call reset to set agents.'
			)
		})

		test.each([1, 3])('failed %p', agent => {
			const env = new DraughtsRLEnvironment()
			env.reset()
			expect(() => env.step([{ from: [2, 0], path: [[3, 1]], jump: [] }], agent)).toThrow('Unknown agent.')
		})
	})

	describe('test', () => {
		test.each([undefined, DraughtsRLEnvironment.RED])('step agent: %p', agent => {
			const env = new DraughtsRLEnvironment()
			const orgstate = env.reset()

			const info = env.test(orgstate, [{ from: [2, 1], path: [[3, 2]], jump: [] }], agent)
			expect(info.invalid).toBeFalsy()

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 4)
			expect(state[0]).toBe(DraughtsRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = i % 2 === 0 ? 1 : 0; j < 8; j += 2, p++) {
					expect(state[p]).toBe(
						i < 2 || (i === 2 && j !== 1) || (i === 3 && j === 2)
							? DraughtsRLEnvironment.OWN
							: i >= 5
								? DraughtsRLEnvironment.OTHER
								: DraughtsRLEnvironment.EMPTY
					)
				}
			}
			expect(orgstate).toEqual(env.state(DraughtsRLEnvironment.RED))
			expect(env.epoch).toBe(0)
		})

		test('win', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()
			const state = Array(33).fill(DraughtsRLEnvironment.EMPTY)
			state[0] = DraughtsRLEnvironment.RED
			state[1] = DraughtsRLEnvironment.OWN
			state[6] = DraughtsRLEnvironment.OTHER

			const info = env.test(state, [{ from: [0, 1], path: [[2, 3]], jump: [[1, 2]] }], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(1)
		})

		test('lose', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()
			const state = Array(33).fill(DraughtsRLEnvironment.EMPTY)
			state[0] = DraughtsRLEnvironment.RED
			state[1] = DraughtsRLEnvironment.OTHER

			const info = env.test(state, [DraughtsRLEnvironment.EMPTY], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(-1)
		})

		test('empty gameturn red', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()
			const state = Array(33).fill(DraughtsRLEnvironment.EMPTY)
			state[0] = DraughtsRLEnvironment.RED
			state[4] = DraughtsRLEnvironment.OWN
			state[8] = DraughtsRLEnvironment.OTHER
			state[11] = DraughtsRLEnvironment.OTHER

			const info = env.test(state, [DraughtsRLEnvironment.EMPTY], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(-1)
			expect(info.state[0]).toBe(DraughtsRLEnvironment.WHITE)
		})

		test('empty gameturn white', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()
			const state = Array(33).fill(DraughtsRLEnvironment.EMPTY)
			state[0] = DraughtsRLEnvironment.WHITE
			state[4] = DraughtsRLEnvironment.OWN
			state[8] = DraughtsRLEnvironment.OTHER
			state[11] = DraughtsRLEnvironment.OTHER

			const info = env.test(state, [DraughtsRLEnvironment.EMPTY], DraughtsRLEnvironment.WHITE)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeTruthy()
			expect(info.reward).toBe(-1)
			expect(info.state[0]).toBe(DraughtsRLEnvironment.RED)
		})
	})
})

describe('board', () => {
	test('constructor', () => {
		const env = new DraughtsRLEnvironment()
		const board = env._board

		expect(board.size).toEqual([8, 8])
		for (let i = 0; i < 8; i += 2) {
			expect(board.at([0, i + 1])).toBe(DraughtsRLEnvironment.RED)
			expect(board.at([1, i])).toBe(DraughtsRLEnvironment.RED)
			expect(board.at([2, i + 1])).toBe(DraughtsRLEnvironment.RED)

			expect(board.at([5, i])).toBe(DraughtsRLEnvironment.WHITE)
			expect(board.at([6, i + 1])).toBe(DraughtsRLEnvironment.WHITE)
			expect(board.at([7, i])).toBe(DraughtsRLEnvironment.WHITE)
		}
		expect(board.finish).toBeFalsy()
		expect(board.count.red).toBe(12)
		expect(board.count.white).toBe(12)
		expect(board.winner).toBeNull()
		expect(board.score(DraughtsRLEnvironment.RED)).toBe(0)
		expect(board.score(DraughtsRLEnvironment.WHITE)).toBe(0)
	})

	describe('winner', () => {
		test('random', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board
			let turn = DraughtsRLEnvironment.RED

			let maxIter = 1.0e4
			while (maxIter-- > 0) {
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
		const env = new DraughtsRLEnvironment()
		const board = env._board

		expect(board.toString()).toBe(`- x - x - x - x
x - x - x - x -
- x - x - x - x
- - - - - - - -
- - - - - - - -
o - o - o - o -
- o - o - o - o
o - o - o - o -
`)
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

	describe('at', () => {
		test.each([[0, 1], 1])('%p', p => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			expect(board.at(p)).toBe(DraughtsRLEnvironment.RED)
		})

		test.each([[7, 0], 29])('%p', p => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			expect(board.at(p)).toBe(DraughtsRLEnvironment.WHITE)
		})
	})

	describe('set', () => {
		test.each([
			{ from: [2, 1], path: [[3, 2]], jump: [] },
			{ from: 9, path: [14], jump: [] },
		])('success %p', p => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			expect(board.at([2, 1])).toBe(DraughtsRLEnvironment.RED)
			expect(board.at([3, 2])).toBe(DraughtsRLEnvironment.EMPTY)

			const success = board.set(p, DraughtsRLEnvironment.RED)
			expect(success).toBeTruthy()
			expect(board.at([2, 1])).toBe(DraughtsRLEnvironment.EMPTY)
			expect(board.at([3, 2])).toBe(DraughtsRLEnvironment.RED)
		})

		test('to king', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			board.set({ from: 11, path: [16], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 22, path: [17], jump: [] }, DraughtsRLEnvironment.WHITE)
			board.set({ from: 8, path: [11], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 26, path: [22], jump: [] }, DraughtsRLEnvironment.WHITE)
			board.set({ from: 16, path: [20], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 22, path: [18], jump: [] }, DraughtsRLEnvironment.WHITE)
			board.set({ from: 9, path: [13], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 31, path: [26], jump: [] }, DraughtsRLEnvironment.WHITE)

			const success = board.set({ from: 13, path: [22, 31], jump: [17, 26] }, DraughtsRLEnvironment.RED)
			expect(success).toBeTruthy()
		})

		test('fail invalid piece', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [5, 2], path: [[4, 3]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail invalid path length', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set(
				{
					from: [2, 1],
					path: [
						[3, 2],
						[4, 3],
					],
					jump: [],
				},
				DraughtsRLEnvironment.RED
			)
			expect(success).toBeFalsy()
		})

		test('fail invalid path, jump length', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set(
				{
					from: [2, 1],
					path: [
						[4, 3],
						[5, 4],
					],
					jump: [[3, 2]],
				},
				DraughtsRLEnvironment.RED
			)
			expect(success).toBeFalsy()
		})

		test('fail no back', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success1 = board.set({ from: [2, 1], path: [[3, 2]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success1).toBeTruthy()
			const success2 = board.set({ from: [5, 0], path: [[4, 1]], jump: [] }, DraughtsRLEnvironment.WHITE)
			expect(success2).toBeTruthy()
			const success = board.set({ from: [3, 2], path: [[2, 1]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail jump own piece', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [1, 0], path: [[3, 2]], jump: [[2, 1]] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail exist piece', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [1, 0], path: [[2, 1]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail invalid move path only', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [2, 1], path: [[3, 1]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail invalid move jump', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [2, 1], path: [[4, 3]], jump: [[6, 3]] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail invalid move path', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			board.set({ from: [2, 1], path: [[3, 2]], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: [5, 4], path: [[4, 3]], jump: [] }, DraughtsRLEnvironment.WHITE)
			const success = board.set({ from: [3, 2], path: [[4, 4]], jump: [[4, 3]] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})
	})

	test('choices', () => {
		const env = new DraughtsRLEnvironment()
		const board = env._board

		const choiceRed = board.choices(DraughtsRLEnvironment.RED)
		expect(choiceRed).toEqual([
			{ from: [2, 1], path: [[3, 2]], jump: [] },
			{ from: [2, 1], path: [[3, 0]], jump: [] },
			{ from: [2, 3], path: [[3, 4]], jump: [] },
			{ from: [2, 3], path: [[3, 2]], jump: [] },
			{ from: [2, 5], path: [[3, 6]], jump: [] },
			{ from: [2, 5], path: [[3, 4]], jump: [] },
			{ from: [2, 7], path: [[3, 6]], jump: [] },
		])
		const choiceWhite = board.choices(DraughtsRLEnvironment.WHITE)
		expect(choiceWhite).toEqual([
			{ from: [5, 0], path: [[4, 1]], jump: [] },
			{ from: [5, 2], path: [[4, 3]], jump: [] },
			{ from: [5, 2], path: [[4, 1]], jump: [] },
			{ from: [5, 4], path: [[4, 5]], jump: [] },
			{ from: [5, 4], path: [[4, 3]], jump: [] },
			{ from: [5, 6], path: [[4, 7]], jump: [] },
			{ from: [5, 6], path: [[4, 5]], jump: [] },
		])
	})

	describe('allPah', () => {
		test('not start own piece', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const path = board.allPath(0, 1, DraughtsRLEnvironment.WHITE)
			expect(path).toHaveLength(0)
		})

		test('will be king', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			board.set({ from: 11, path: [16], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 22, path: [17], jump: [] }, DraughtsRLEnvironment.WHITE)
			board.set({ from: 8, path: [11], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 26, path: [22], jump: [] }, DraughtsRLEnvironment.WHITE)
			board.set({ from: 16, path: [20], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 22, path: [18], jump: [] }, DraughtsRLEnvironment.WHITE)
			board.set({ from: 9, path: [13], jump: [] }, DraughtsRLEnvironment.RED)
			board.set({ from: 31, path: [26], jump: [] }, DraughtsRLEnvironment.WHITE)

			const path = board.allPath(3, 0, DraughtsRLEnvironment.RED)
			expect(path).toEqual([
				{
					from: [3, 0],
					path: [
						[5, 2],
						[7, 4],
					],
					jump: [
						[4, 1],
						[6, 3],
					],
				},
			])
		})
	})
})

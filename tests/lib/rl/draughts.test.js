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
		expect(env.states).toHaveLength(1 + 8 * 8)
	})

	describe('reset', () => {
		test('success', () => {
			const env = new DraughtsRLEnvironment()

			const state = env.reset()
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(DraughtsRLEnvironment.RED)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						i % 2 === j % 2
							? i < 3
								? DraughtsRLEnvironment.OWN
								: i >= 5
								? DraughtsRLEnvironment.OTHER
								: DraughtsRLEnvironment.EMPTY
							: DraughtsRLEnvironment.EMPTY
					)
				}
			}
		})
	})

	describe('state', () => {
		test.each([DraughtsRLEnvironment.RED, DraughtsRLEnvironment.WHITE])('success %i', agent => {
			const env = new DraughtsRLEnvironment()
			env.reset(0, 1)

			const red = agent === DraughtsRLEnvironment.RED ? DraughtsRLEnvironment.OWN : DraughtsRLEnvironment.OTHER
			const white = agent === DraughtsRLEnvironment.RED ? DraughtsRLEnvironment.OTHER : DraughtsRLEnvironment.OWN

			const state = env.state(agent)
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(DraughtsRLEnvironment.RED)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						i % 2 === j % 2
							? i < 3
								? red
								: i >= 5
								? white
								: DraughtsRLEnvironment.EMPTY
							: DraughtsRLEnvironment.EMPTY
					)
				}
			}
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
		test('success', () => {
			const env = new DraughtsRLEnvironment()
			env.reset()

			const info = env.step([{ from: [2, 0], path: [[3, 1]], jump: [] }], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeFalsy()
			expect(info.done).toBeFalsy()
			expect(info.reward).toBe(0)

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(DraughtsRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						i % 2 === j % 2
							? i < 2 || (i === 2 && j !== 0) || (i === 3 && j === 1)
								? DraughtsRLEnvironment.OWN
								: i >= 5
								? DraughtsRLEnvironment.OTHER
								: DraughtsRLEnvironment.EMPTY
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

			const info1 = env.step([{ from: [2, 0], path: [[3, 1]], jump: [] }], DraughtsRLEnvironment.RED)
			expect(info1.invalid).toBeFalsy()
			expect(env.epoch).toBe(1)
			const info2 = env.step([{ from: [5, 3], path: [[4, 2]], jump: [] }], DraughtsRLEnvironment.WHITE)
			expect(info2.invalid).toBeFalsy()
			expect(env.epoch).toBe(2)

			const info = env.step([{ from: [2, 2], path: [[3, 3]], jump: [] }], DraughtsRLEnvironment.RED)
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
		test('step', () => {
			const env = new DraughtsRLEnvironment()
			const orgstate = env.reset()

			const info = env.test(orgstate, [{ from: [2, 0], path: [[3, 1]], jump: [] }], DraughtsRLEnvironment.RED)
			expect(info.invalid).toBeFalsy()

			const state = info.state
			expect(state).toHaveLength(1 + 8 * 8)
			expect(state[0]).toBe(DraughtsRLEnvironment.WHITE)
			for (let i = 0, p = 1; i < 8; i++) {
				for (let j = 0; j < 8; j++, p++) {
					expect(state[p]).toBe(
						i % 2 === j % 2
							? i < 2 || (i === 2 && j !== 0) || (i === 3 && j === 1)
								? DraughtsRLEnvironment.OWN
								: i >= 5
								? DraughtsRLEnvironment.OTHER
								: DraughtsRLEnvironment.EMPTY
							: DraughtsRLEnvironment.EMPTY
					)
				}
			}
			expect(orgstate).toEqual(env.state(DraughtsRLEnvironment.RED))
			expect(env.epoch).toBe(0)
		})
	})
})

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

		test('fail invalid piece', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [5, 1], path: [[4, 2]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail no back', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success1 = board.set({ from: [2, 0], path: [[3, 1]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success1).toBeTruthy()
			const success2 = board.set({ from: [5, 1], path: [[4, 0]], jump: [] }, DraughtsRLEnvironment.WHITE)
			expect(success2).toBeTruthy()
			const success = board.set({ from: [3, 1], path: [[2, 0]], jump: [] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail jump own piece', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [1, 1], path: [[3, 3]], jump: [[2, 2]] }, DraughtsRLEnvironment.RED)
			expect(success).toBeFalsy()
		})

		test('fail exist piece', () => {
			const env = new DraughtsRLEnvironment()
			const board = env._board

			const success = board.set({ from: [1, 1], path: [[2, 2]], jump: [] }, DraughtsRLEnvironment.RED)
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

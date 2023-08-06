import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../lib/util/matrix.js'

import {
	SGDOptimizer,
	MomentumOptimizer,
	RMSPropOptimizer,
	AdamOptimizer,
} from '../../../../lib/model/nns/optimizer.js'
import Tensor from '../../../../lib/util/tensor.js'

describe('sgd', () => {
	test('lr', () => {
		const opt = new SGDOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new SGDOptimizer(0.1)
			const manager = opt.manager()

			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				expect(d).toBeCloseTo(0.1 * v)
			}
		})

		test('matrix', () => {
			const opt = new SGDOptimizer(0.1)
			const manager = opt.manager()

			for (let i = 0; i < 10; i++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo(0.1 * mat.at(i, j))
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new SGDOptimizer(0.1)
			const manager = opt.manager()

			for (let i = 0; i < 10; i++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo(0.1 * mat.at(i, j, k))
						}
					}
				}
			}
		})
	})
})

describe('momentum', () => {
	test('lr', () => {
		const opt = new MomentumOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new MomentumOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.9

			let r = null
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				r = (r ?? v) * beta + v * (1 - beta)
				expect(d).toBeCloseTo(0.1 * r)
			}
		})

		test('matrix', () => {
			const opt = new MomentumOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.9

			let r = null
			for (let i = 0; i < 10; i++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				r ??= mat.copy()
				r.broadcastOperate(mat, (a, b) => a * beta + b * (1 - beta))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo(0.1 * r.at(i, j))
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new MomentumOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.9

			let r = null
			for (let i = 0; i < 10; i++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				r ??= mat.copy()
				r.broadcastOperate(mat, (a, b) => a * beta + b * (1 - beta))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo(0.1 * r.at(i, j, k))
						}
					}
				}
			}
		})
	})
})

describe('rmsprop', () => {
	test('lr', () => {
		const opt = new RMSPropOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new RMSPropOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.999

			let r = null
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				r = (r ?? v ** 2) * beta + v ** 2 * (1 - beta)
				expect(d).toBeCloseTo((0.1 * v) / Math.sqrt(r))
			}
		})

		test('matrix', () => {
			const opt = new RMSPropOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.999

			let r = null
			for (let i = 0; i < 10; i++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				r ??= Matrix.map(mat, v => v ** 2)
				r.broadcastOperate(mat, (a, b) => a * beta + b ** 2 * (1 - beta))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo((0.1 * mat.at(i, j)) / Math.sqrt(r.at(i, j)))
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new RMSPropOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.999

			let r = null
			for (let i = 0; i < 10; i++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				if (!r) {
					r = mat.copy()
					r.map(v => v ** 2)
				}
				r.broadcastOperate(mat, (a, b) => a * beta + b ** 2 * (1 - beta))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo((0.1 * mat.at(i, j, k)) / Math.sqrt(r.at(i, j, k)))
						}
					}
				}
			}
		})
	})
})

describe('adam', () => {
	test('lr', () => {
		const opt = new AdamOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new AdamOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			let r = null
			let s = null
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				r = (r ?? v) * beta1 + v * (1 - beta1)
				s = (s ?? v ** 2) * beta2 + s ** 2 * (1 - beta2)
				expect(d).toBeCloseTo((0.1 * r) / Math.sqrt(s))
			}
		})

		test('matrix', () => {
			const opt = new AdamOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			let r = null
			let s = null
			for (let i = 0; i < 10; i++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				r ??= mat.copy()
				r.broadcastOperate(mat, (a, b) => a * beta1 + b * (1 - beta1))
				s ??= Matrix.map(mat, v => v ** 2)
				s.broadcastOperate(mat, (a, b) => a * beta2 + b ** 2 * (1 - beta2))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo((0.1 * r.at(i, j)) / Math.sqrt(s.at(i, j)))
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new AdamOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			let r = null
			let s = null
			for (let i = 0; i < 10; i++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				if (!r) {
					r = mat.copy()
					s = mat.copy()
					s.map(v => v ** 2)
				}
				r.broadcastOperate(mat, (a, b) => a * beta1 + b * (1 - beta1))
				s.broadcastOperate(mat, (a, b) => a * beta2 + b ** 2 * (1 - beta2))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo((0.1 * r.at(i, j, k)) / Math.sqrt(s.at(i, j, k)))
						}
					}
				}
			}
		})
	})
})

describe('nn', () => {
	test.each(['sgd', 'momentum', 'rmsprop', 'adam'])('%s', optimizer => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 3 },
			],
			'mse',
			optimizer
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})

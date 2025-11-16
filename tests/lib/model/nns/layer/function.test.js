import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import FunctionLayer from '../../../../../lib/model/nns/layer/function.js'

describe('layer', () => {
	describe('construct', () => {
		test('unary', () => {
			const layer = new FunctionLayer({ func: '2 * x + 1' })
			expect(layer).toBeDefined()
		})

		test('binary', () => {
			const layer = new FunctionLayer({ func: '2 * x + y' })
			expect(layer).toBeDefined()
		})

		test('invalid operation', () => {
			expect(() => new FunctionLayer({ func: '*x' })).toThrow("Invalid operation '*'.")
		})

		test('invalid parenthesis (comma)', () => {
			expect(() => new FunctionLayer({ func: ',x' })).toThrow('Invalid parenthesis')
		})

		test('invalid parenthesis', () => {
			expect(() => new FunctionLayer({ func: 'x)' })).toThrow('Invalid parenthesis')
		})
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new FunctionLayer({ func: '2 * x + 1' })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(2 * x.at(i, j) + 1)
				}
			}
		})

		test('tensor', () => {
			const layer = new FunctionLayer({ func: '2 * x + 1' })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(2 * x.at(i, j, k) + 1)
					}
				}
			}
		})

		test.each([
			['+x', v => v],
			['-x', v => -v],
			['x + 2', v => v + 2],
			['2 + x', v => 2 + v],
			['x - 2', v => v - 2],
			['2 - x', v => 2 - v],
			['x * 2', v => v * 2],
			['2 * x', v => 2 * v],
			['x / 2', v => v / 2],
			['2 / x', v => 2 / v],
			['x ** 2', v => v ** 2],
			['2 ** x', v => 2 ** v],
			['2 / x ** 2 - (1 + x) * x', v => 2 / v ** 2 - (1 + v) * v],
			['abs(x)', v => Math.abs(v)],
			['asinh(x)', v => Math.asinh(v)],
			['atan(x)', v => Math.atan(v)],
			['cbrt(x)', v => Math.cbrt(v)],
			['cos(x)', v => Math.cos(v)],
			['cosh(x)', v => Math.cosh(v)],
			['exp(x)', v => Math.exp(v)],
			['max(x, 0)', v => (v > 0 ? v : 0)],
			['min(x, 0)', v => (v < 0 ? v : 0)],
			['sin(x)', v => Math.sin(v)],
			['sinh(x)', v => Math.sinh(v)],
			['tan(x)', v => Math.tan(v)],
			['tanh(x)', v => Math.tanh(v)],
			['2 * (x + 1)', v => 2 * (v + 1)],
			['min(x + 1, 0)', v => (v + 1 < 0 ? v + 1 : 0)],
		])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each([
			['sqrt(x)', v => Math.sqrt(v)],
			['log(x)', v => Math.log(v)],
			['log10(x)', v => Math.log10(v)],
			['log2(x)', v => Math.log2(v)],
		])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			x.map(v => Math.abs(v))
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each([
			['acos(x)', v => Math.acos(v)],
			['asin(x)', v => Math.asin(v)],
			['atanh(x)', v => Math.atanh(v)],
		])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.random(13, 7, -1, 1)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each([['acosh(x)', v => Math.acosh(v)]])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			x.map(v => Math.abs(v) + 1)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each([
			['e', () => Math.E],
			['ln2', () => Math.LN2],
			['ln10', () => Math.LN10],
			['log2e', () => Math.LOG2E],
			['log10e', () => Math.LOG10E],
			['pi', () => Math.PI],
			['sqrt1_2', () => Math.SQRT1_2],
			['sqrt2', () => Math.SQRT2],
		])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			x.map(v => Math.abs(v))
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test('binary', () => {
			const layer = new FunctionLayer({ func: '2 * x + y' })

			const x0 = Matrix.randn(100, 10)
			const x1 = Matrix.randn(100, 10)
			const y = layer.calc(x0, x1)
			for (let i = 0; i < x0.rows; i++) {
				for (let j = 0; j < x0.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(2 * x0.at(i, j) + x1.at(i, j))
				}
			}
		})

		test('invalid variable', () => {
			const layer = new FunctionLayer({ func: 'z' })

			const x = Matrix.randn(2, 10)
			expect(() => layer.calc(x)).toThrow("Invalid token 'z'.")
		})

		test('invalid operator', () => {
			const layer = new FunctionLayer({ func: 'x @ 2' })

			const x = Matrix.randn(2, 10)
			expect(() => layer.calc(x)).toThrow('Invalid expression.')
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new FunctionLayer({ func: '2 * x + 1' })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(2)
				}
			}
		})

		test('tensor', () => {
			const layer = new FunctionLayer({ func: '2 * x + 1' })

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(2)
					}
				}
			}
		})

		test.each([
			['+x', () => 1],
			['-x', () => -1],
			['x + 2', () => 1],
			['2 + x', () => 1],
			['x - 2', () => 1],
			['2 - x', () => -1],
			['x * 2', () => 2],
			['2 * x', () => 2],
			['x / 2', () => 1 / 2],
			['2 / x', v => -2 / v ** 2],
			['x ** 2', v => 2 * v],
			['2 ** x', v => 2 ** v * Math.log(2)],
			['2 / x ** 2 - (1 + x) * x', v => -4 / v ** 3 - (1 + 2 * v)],
			['abs(x)', v => (v < 0 ? -1 : 1)],
			['asinh(x)', v => 1 / Math.sqrt(1 + v ** 2)],
			['atan(x)', v => 1 / (1 + v ** 2)],
			['cbrt(x)', v => 1 / (3 * Math.cbrt(v ** 2))],
			['cos(x)', v => -Math.sin(v)],
			['cosh(x)', v => Math.sinh(v)],
			['exp(x)', v => Math.exp(v)],
			['min(x, 0)', v => (v < 0 ? 1 : 0)],
			['max(x, 0)', v => (v > 0 ? 1 : 0)],
			['sin(x)', v => Math.cos(v)],
			['sinh(x)', v => Math.cosh(v)],
			['tan(x)', v => 1 / Math.cos(v) ** 2],
			['tanh(x)', v => 1 - Math.tanh(v) ** 2],
			['2 * (x + 1)', () => 2],
			['min(x + 1, 0)', v => (v + 1 < 0 ? 1 : 0)],
		])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			layer.calc(x)

			const bo = Matrix.ones(13, 7)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each([
			['sqrt(x)', v => 1 / (2 * Math.sqrt(v))],
			['log(x)', v => 1 / v],
			['log10(x)', v => 1 / (v * Math.log(10))],
			['log2(x)', v => 1 / (v * Math.log(2))],
		])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			x.map(v => Math.abs(v))
			layer.calc(x)

			const bo = Matrix.ones(13, 7)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each([
			['acos(x)', v => -1 / (Math.sqrt(1 - v ** 2) + 1.0e-4)],
			['asin(x)', v => 1 / (Math.sqrt(1 - v ** 2) + 1.0e-4)],
			['atanh(x)', v => 1 / (1 - v ** 2)],
		])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.random(13, 7, -1, 1)
			layer.calc(x)

			const bo = Matrix.ones(13, 7)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each([['acosh(x)', v => 1 / (Math.sqrt(v ** 2 - 1) + 1.0e-4)]])('%j', (fs, fn) => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			x.map(v => Math.abs(v) + 1)
			layer.calc(x)

			const bo = Matrix.ones(13, 7)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(fn(x.at(i, j)))
				}
			}
		})

		test.each(['e', 'ln2', 'ln10', 'log2e', 'log10e', 'pi', 'sqrt1_2', 'sqrt2'])('%j', fs => {
			const layer = new FunctionLayer({ func: fs })

			const x = Matrix.randn(13, 7)
			layer.calc(x)

			const bo = Matrix.ones(13, 7)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(0)
				}
			}
		})

		test('binary', () => {
			const layer = new FunctionLayer({ func: '2 * x + y' })

			const x0 = Matrix.randn(100, 10)
			const x1 = Matrix.randn(100, 10)
			layer.calc(x0, x1)

			const bo = Matrix.ones(100, 10)
			const [bx, by] = layer.grad(bo)
			for (let i = 0; i < x0.rows; i++) {
				for (let j = 0; j < x0.cols; j++) {
					expect(bx.at(i, j)).toBeCloseTo(2)
					expect(by.at(i, j)).toBeCloseTo(1)
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new FunctionLayer({ func: '2 * x + 1' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'function', func: '2 * x + 1' })
	})

	test('fromObject', () => {
		const layer = FunctionLayer.fromObject({ type: 'function', func: '2 * x + 1' })
		expect(layer).toBeInstanceOf(FunctionLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'function', func: '2 * x + 1' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(2 * x.at(i, j) + 1)
			}
		}
	})

	test('calc binary', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x1' },
			{ type: 'input', name: 'x2' },
			{ type: 'function', func: '2 * x + y', input: ['x1', 'x2'] },
		])
		const x1 = Matrix.randn(10, 10)
		const x2 = Matrix.randn(10, 10)

		const y = net.calc({ x1, x2 })
		for (let i = 0; i < x1.rows; i++) {
			for (let j = 0; j < x1.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(2 * x1.at(i, j) + x2.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'function', func: '2 * x + 1' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0, 1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test.each([
		'+x',
		'-x',
		'x + 2',
		'2 + x',
		'x - 2',
		'2 - x',
		'x * 2',
		'2 * x',
		'x / 2',
		'2 / x',
		'x ** 2',
		'2 ** x',
		'2 / x ** 2 - (1 + x) * x',
		'abs(x)',
		'asinh(x)',
		'atan(x)',
		'cbrt(x)',
		'cos(x)',
		'cosh(x)',
		'exp(x)',
		'sin(x)',
		'sinh(x)',
		'tan(x)',
		'tanh(x)',
	])('grad %j', fs => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'function', func: fs }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0, 1)

		const loss0 = net.fit(x, t, 1, 0.01)
		const loss1 = net.fit(x, t, 100, 0.01)
		expect(loss1[0]).toBeLessThan(loss0[0])
	})

	test.each(['sqrt(x)', 'log(x)', 'log10(x)', 'log2(x)'])('grad %j', fs => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, 0, 0.1), b: Matrix.ones(1, 3) },
				{ type: 'function', func: fs },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		x.map(v => Math.abs(v))
		const t = Matrix.random(1, 3, 0, 1)

		const loss0 = net.fit(x, t, 1, 0.01)
		const loss1 = net.fit(x, t, 100, 0.01)
		expect(loss1[0]).toBeLessThan(loss0[0])
	})

	test.each(['acos(x)', 'asin(x)', 'atanh(x)'])('grad %j', fs => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, 0, 0.1), b: Matrix.zeros(1, 3) },
				{ type: 'function', func: fs },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -1, 1)
		const t = Matrix.random(1, 3, 0, 1)

		const loss0 = net.fit(x, t, 1, 0.01)
		const loss1 = net.fit(x, t, 100, 0.01)
		expect(loss1[0]).toBeLessThan(loss0[0])
	})

	test.each(['acosh(x)'])('grad %j', fs => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, 0, 0.1), b: Matrix.ones(1, 3) },
				{ type: 'function', func: fs },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		x.map(v => Math.abs(v))
		const t = Matrix.random(1, 3, 0, 1)

		const loss0 = net.fit(x, t, 1, 0.01)
		const loss1 = net.fit(x, t, 100, 0.01)
		expect(loss1[0]).toBeLessThan(loss0[0])
	})

	test('grad binary', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x1' },
				{ type: 'full', out_size: 3, name: 'a1' },
				{ type: 'input', name: 'x2' },
				{ type: 'full', out_size: 3, name: 'a2' },
				{ type: 'function', func: '2 * x + y', input: ['a1', 'a2'] },
			],
			'mse',
			'adam'
		)
		const x1 = Matrix.randn(1, 5)
		const x2 = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0, 1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ x1, x2 }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ x1, x2 })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})

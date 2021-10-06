import NeuralNetwork from '../../../lib/model/neuralnetwork.js'
import { Matrix, Tensor } from '../../../lib/util/math.js'

describe('neuralnetwork', () => {
	describe('constructor', () => {
		test('layer', () => {
			const net = new NeuralNetwork([{ type: 'input' }])

			expect(net._layers).toHaveLength(2)
			expect(net._layers[0].constructor.name).toBe('InputLayer')
			expect(net._layers[1].constructor.name).toBe('OutputLayer')
			expect(net._request_layer).toEqual([{ type: 'input' }, { type: 'output' }])
			expect(net._optimizer).toBe('sgd')
			expect(net._opt.constructor.name).toBe('SGDOptimizer')

			const y = net
				.calc([
					[1, 2],
					[3, 4],
				])
				.toArray()
			expect(y).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('loss', () => {
			const net = new NeuralNetwork([{ type: 'input' }], 'mse')

			expect(net._layers).toHaveLength(3)
			expect(net._layers[0].constructor.name).toBe('InputLayer')
			expect(net._layers[1].constructor.name).toBe('OutputLayer')
			expect(net._layers[2].constructor.name).toBe('MSELayer')
			expect(net._request_layer).toEqual([{ type: 'input' }, { type: 'output' }, { type: 'mse' }])

			const y = net
				.calc([
					[1, 2],
					[3, 4],
				])
				.toArray()
			expect(y).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('const', () => {
			const net = new NeuralNetwork([
				{ type: 'input', name: 'in' },
				{ type: 'add', input: [1, 'in'] },
			])

			expect(net._layers).toHaveLength(4)
			expect(net._layers[0].constructor.name).toBe('ConstLayer')
			expect(net._layers[0]._value).toBe(1)
			expect(net._layers[1].constructor.name).toBe('InputLayer')
			expect(net._layers[2].constructor.name).toBe('AddLayer')
			expect(net._layers[3].constructor.name).toBe('OutputLayer')
			expect(net._request_layer).toEqual([
				{ type: 'input', name: 'in', input: [] },
				{ type: 'add', input: ['__const_number_1', 'in'] },
				{ type: 'output' },
			])

			const y = net
				.calc([
					[1, 2],
					[3, 4],
				])
				.toArray()
			expect(y).toEqual([
				[2, 3],
				[4, 5],
			])
		})

		describe('optimizer', () => {
			test('sgd', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'sgd')
				expect(net._optimizer).toBe('sgd')
				expect(net._opt.constructor.name).toBe('SGDOptimizer')
			})

			test('adam', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'adam')
				expect(net._optimizer).toBe('adam')
				expect(net._opt.constructor.name).toBe('AdamOptimizer')
			})

			test('momentum', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'momentum')
				expect(net._optimizer).toBe('momentum')
				expect(net._opt.constructor.name).toBe('MomentumOptimizer')
			})

			test('rmsprop', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'rmsprop')
				expect(net._optimizer).toBe('rmsprop')
				expect(net._opt.constructor.name).toBe('RMSPropOptimizer')
			})
		})
	})

	test.todo('calc')

	test.todo('grad')

	test.todo('update')

	test.todo('fit')
})

describe('input', () => {
	test('one input', () => {
		const net = new NeuralNetwork([{ type: 'input' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('named input', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'concat', input: ['a', 'b'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j))
			}
			for (let j = 0; j < b.cols; j++) {
				expect(y.at(i, j + a.cols)).toBeCloseTo(b.at(i, j))
			}
		}
	})
})

test.todo('output')

test.todo('supervisor')

test.todo('include')

describe('const', () => {
	test('scalar', () => {
		const net = new NeuralNetwork([{ type: 'const', value: 1 }])
		const y = net.calc([])
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(1)
	})
})

test.todo('random')

describe('variable', () => {
	test('update', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', size: [10, 3], name: 'w' },
				{ type: 'variable', size: [1, 3], name: 'b', l1_decay: 0.01 },
				{ type: 'matmul', input: ['in', 'w'], name: 'a', l2_decay: 0.1 },
				{ type: 'add', input: ['a', 'b'] },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 10, -0.1, 0.1)
		const t = Matrix.random(1, 3, -1, 1)

		for (let i = 0; i < 100; i++) {
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

describe('full', () => {
	test('update', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 3 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
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

	test('update decay', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid', l1_decay: 0.1 },
				{ type: 'full', out_size: 3, l2_decay: 0.2 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
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

describe('linear', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'linear' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'linear' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

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
})

describe('negative', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'negative' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(-x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'negative' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

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
})

describe('sigmoid', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'sigmoid' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(1 / (1 + Math.exp(-x.at(i, j))))
			}
		}
	})

	test('calc a', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'sigmoid', a: 2 }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(1 / (1 + Math.exp(-2 * x.at(i, j))))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'sigmoid' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0.1, 0.9)

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

	test('grad a', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'sigmoid', a: 0.5 }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0.1, 0.9)

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
})

describe('tanh', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'tanh' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.tanh(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'tanh' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.9, 0.9)

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
})

describe('softsign', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'softsign' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) / (1 + Math.abs(x.at(i, j))))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'softsign' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.9, 0.9)

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
})

describe('softplus', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'softplus' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.log(1 + Math.exp(x.at(i, j))))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'softplus' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0.1, 5)

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
})

describe('abs', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'abs' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.abs(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'abs' }],
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
})

describe('relu', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'relu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) < 0 ? 0 : x.at(i, j))
			}
		}
	})

	test.skip('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'relu' }],
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
})

describe('leaky_relu', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'leaky_relu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) * (x.at(i, j) < 0 ? 0.1 : 1))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'leaky_relu' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

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
})

describe('softmax', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'softmax' }])
		const x = Matrix.random(10, 10, 0, 1)

		const y = net.calc(x)
		const t = x.copyMap(Math.exp)
		t.div(t.sum(1))
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'softmax' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.zeros(1, 3)
		t.set(0, Math.floor(Math.random() * t.cols), 1)

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
})

describe('log', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'log' }])
		const x = Matrix.random(10, 10, 0, 1)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.log(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'abs' }, { type: 'log' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 2)

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
})

describe('exp', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'exp' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.exp(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'exp' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0.8, 2)

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
})

describe('square', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'square' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** 2)
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'square' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0.5, 2)

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
})

describe('sqrt', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'sqrt' }])
		const x = Matrix.random(10, 10, 0, 1)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.sqrt(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'abs' }, { type: 'sqrt' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 1, 2)

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
})

describe('power', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'power', n: 3 }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** 3)
			}
		}
	})

	test.skip('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'power', n: 3 }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

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
})

describe('gaussian', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'gaussian' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.exp(-(x.at(i, j) ** 2) / 2))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'gaussian' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
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
})

test.todo('sparsity')

test.todo('dropout')

describe('clip', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'clip', min: -0.1, max: 0.1 }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.max(-0.1, Math.min(0.1, x.at(i, j))))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'clip', min: -0.1, max: 0.1 }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

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
})

describe('add', () => {
	test('calc', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'add', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)
		const c = Matrix.randn(10, 10)

		const y = net.calc({ a, b, c })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j) + b.at(i, j) + c.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 3, name: 'co' },
				{ type: 'add', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const c = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad diff size', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 2, name: 'bo' },
				{ type: 'add', input: ['ao', 'bo'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})

describe('sub', () => {
	test('calc', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'sub', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)
		const c = Matrix.randn(10, 10)

		const y = net.calc({ a, b, c })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j) - b.at(i, j) - c.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 3, name: 'co' },
				{ type: 'sub', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const c = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad diff size', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 2, name: 'bo' },
				{ type: 'sub', input: ['ao', 'bo'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})

describe('mult', () => {
	test('calc', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'mult', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)
		const c = Matrix.randn(10, 10)

		const y = net.calc({ a, b, c })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j) * b.at(i, j) * c.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 3, name: 'co' },
				{ type: 'mult', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const c = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad diff size', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 2, name: 'bo' },
				{ type: 'mult', input: ['ao', 'bo'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})

describe('div', () => {
	test('calc', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'div', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)
		const c = Matrix.randn(10, 10)

		const y = net.calc({ a, b, c })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j) / b.at(i, j) / c.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 3, name: 'co' },
				{ type: 'div', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const c = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad diff size', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 2, name: 'bo' },
				{ type: 'div', input: ['ao', 'bo'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})

describe('matmul', () => {
	test('calc', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'matmul', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 7)
		const b = Matrix.randn(7, 5)
		const c = Matrix.randn(5, 3)

		const y = net.calc({ a, b, c })
		const d = a.dot(b).dot(c)
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < c.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(d.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 2, name: 'co' },
				{ type: 'matmul', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(4, 5, -0.1, 0.1)
		const c = Matrix.random(3, 5, -0.1, 0.1)
		const t = Matrix.random(1, 2, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})

describe('conv', () => {
	test('update', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'conv', kernel: 3, padding: 1 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 3, 3, 2]).toArray()
		const t = Matrix.randn(1, 36)

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
})

describe('sum', () => {
	describe('axis -1', () => {
		test('calc', () => {
			const net = new NeuralNetwork([{ type: 'input' }, { type: 'sum' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.sum()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test('grad', () => {
			const net = new NeuralNetwork(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'sum' }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const t = Matrix.random(1, 1, -0.1, 0.1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			expect(y.at(0, 0)).toBeCloseTo(t.at(0, 0))
		})
	})

	describe.each([0, 1])('axis %i', axis => {
		test('calc', () => {
			const net = new NeuralNetwork([{ type: 'input' }, { type: 'sum', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.sum(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})

		test('grad', () => {
			const net = new NeuralNetwork(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'sum', axis }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const size = axis === 0 ? [1, 3] : [4, 1]
			const t = Matrix.random(...size, -0.1, 0.1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			for (let i = 0; i < t.rows; i++) {
				for (let j = 0; j < t.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
				}
			}
		})
	})
})

describe('mean', () => {
	describe('axis -1', () => {
		test('calc', () => {
			const net = new NeuralNetwork([{ type: 'input' }, { type: 'mean' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.mean()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test('grad', () => {
			const net = new NeuralNetwork(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'mean' }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const t = Matrix.random(1, 1, -0.1, 0.1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			expect(y.at(0, 0)).toBeCloseTo(t.at(0, 0))
		})
	})

	describe.each([0, 1])('axis %i', axis => {
		test('calc', () => {
			const net = new NeuralNetwork([{ type: 'input' }, { type: 'mean', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.mean(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})

		test('grad', () => {
			const net = new NeuralNetwork(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'mean', axis }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const size = axis === 0 ? [1, 3] : [4, 1]
			const t = Matrix.random(...size, -0.1, 0.1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			for (let i = 0; i < t.rows; i++) {
				for (let j = 0; j < t.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
				}
			}
		})
	})
})

describe('variance', () => {
	describe('axis -1', () => {
		test('calc', () => {
			const net = new NeuralNetwork([{ type: 'input' }, { type: 'variance' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.variance()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test('grad', () => {
			const net = new NeuralNetwork(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'variance' }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const t = Matrix.random(1, 1, 0.1, 1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			expect(y.at(0, 0)).toBeCloseTo(t.at(0, 0))
		})
	})

	describe.each([0, 1])('axis %i', axis => {
		test('calc', () => {
			const net = new NeuralNetwork([{ type: 'input' }, { type: 'variance', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.variance(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})

		test('grad', () => {
			const net = new NeuralNetwork(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'variance', axis }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const size = axis === 0 ? [1, 3] : [4, 1]
			const t = Matrix.random(...size, 0.1, 1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			for (let i = 0; i < t.rows; i++) {
				for (let j = 0; j < t.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
				}
			}
		})
	})
})

test.todo('reshape')

test.todo('transpose')

test.todo('flatten')

describe('concat', () => {
	test('calc axis 1', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'concat', axis: 1, input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 2)
		const b = Matrix.randn(10, 3)
		const c = Matrix.randn(10, 4)

		const y = net.calc({ a, b, c })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j))
			}
			for (let j = 0; j < b.cols; j++) {
				expect(y.at(i, j + a.cols)).toBeCloseTo(b.at(i, j))
			}
			for (let j = 0; j < c.cols; j++) {
				expect(y.at(i, j + a.cols + b.cols)).toBeCloseTo(c.at(i, j))
			}
		}
	})

	test('calc axis 0', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'concat', axis: 0, input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(2, 10)
		const b = Matrix.randn(3, 10)
		const c = Matrix.randn(4, 10)

		const y = net.calc({ a, b, c })
		for (let j = 0; j < a.cols; j++) {
			for (let i = 0; i < a.rows; i++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j))
			}
			for (let i = 0; i < b.rows; i++) {
				expect(y.at(i + a.rows, j)).toBeCloseTo(b.at(i, j))
			}
			for (let i = 0; i < c.rows; i++) {
				expect(y.at(i + a.rows + b.rows, j)).toBeCloseTo(c.at(i, j))
			}
		}
	})

	test('grad axis 1', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 2, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 1, name: 'co' },
				{ type: 'concat', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const c = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 6, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad axis 0', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 3, name: 'co' },
				{ type: 'concat', axis: 0, input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 4, -0.1, 0.1)
		const c = Matrix.random(1, 3, -0.1, 0.1)
		const t = Matrix.random(3, 3, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.rows; i++) {
			for (let j = 0; j < t.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
			}
		}
	})
})

describe('split', () => {
	test('calc axis 1', () => {
		const spls = [1, 2, 3, 4]
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'split', size: spls }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y).toHaveLength(4)
		let c = 0
		for (let k = 0; k < 4; k++) {
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < spls[k]; j++) {
					expect(y[k].at(i, j)).toBeCloseTo(x.at(i, j + c))
				}
			}
			c += spls[k]
		}
	})

	test('calc axis 0', () => {
		const spls = [1, 2, 3, 4]
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'split', axis: 0, size: spls }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y).toHaveLength(4)
		let r = 0
		for (let k = 0; k < 4; k++) {
			for (let i = 0; i < spls[k]; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y[k].at(i, j)).toBeCloseTo(x.at(i + r, j))
				}
			}
			r += spls[k]
		}
	})

	test('grad axis 1', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 10 },
				{ type: 'split', size: [1, 2, 3, 4], name: 's' },
				{ type: 'output', input: 's[3]' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.1, 0.1)

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

	test('grad axis 0', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3 },
				{ type: 'split', axis: 0, size: [2, 1, 2], name: 's' },
				{ type: 'output', input: 's[1]' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(5, 4, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

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
})

describe('onehot', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'onehot' }])
		const x = Matrix.random(10, 1, 0, 5)
		x.map(v => Math.floor(v))

		const y = net.calc(x)
		const idx = []
		for (let i = 0; i < x.rows; i++) {
			if (idx[x.at(i, 0)] === undefined) {
				idx[x.at(i, 0)] = y.row(i).argmax(1).value[0]
			}
			for (let j = 0; j < y.cols; j++) {
				if (idx[x.at(i, 0)] === j) {
					expect(y.at(i, j)).toBe(1)
				} else {
					expect(y.at(i, j)).toBe(0)
				}
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 1 }, { type: 'onehot' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(5, 3, -0.1, 0.1)
		const t = Matrix.zeros(5, 5)
		for (let i = 0; i < 5; i++) {
			t.set(i, i, 1)
		}

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
})

test.todo('less')

test.todo('cond')

test.todo('loss')

test.todo('mse')

test.todo('huber')

import NeuralNetwork from '../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../lib/util/math.js'

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
})

test.todo('input')

test.todo('output')

test.todo('supervisor')

test.todo('include')

test.todo('const')

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

test.todo('softmax')

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

test.todo('clip')

test.todo('add')

test.todo('sub')

test.todo('mult')

test.todo('div')

test.todo('matmul')

test.todo('conv')

test.todo('sum')

test.todo('mean')

test.todo('variance')

test.todo('reshape')

test.todo('transpose')

test.todo('flatten')

test.todo('concat')

test.todo('split')

test.todo('onehot')

test.todo('less')

test.todo('cond')

test.todo('loss')

test.todo('mse')

test.todo('huber')

import Matrix from '../../../lib/util/matrix.js'
import Tensor from '../../../lib/util/tensor.js'

describe('Tensor', () => {
	describe('constructor', () => {
		test('default', () => {
			const ten = new Tensor([2, 3, 4])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(0)
					}
				}
			}
		})

		test('scalar', () => {
			const ten = new Tensor([2, 3, 4], 2)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(2)
					}
				}
			}
		})

		test('array', () => {
			const ten = new Tensor([1, 2, 3], [0, 1, 2, 3, 4, 5])
			for (let i = 0, p = 0; i < 1; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 3; k++, p++) {
						expect(ten.at(i, j, k)).toBe(p)
					}
				}
			}
		})

		test('multi array', () => {
			const ten = new Tensor(
				[1, 2, 3],
				[
					[
						[0, 1, 2],
						[3, 4, 5],
					],
				]
			)
			for (let i = 0, p = 0; i < 1; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 3; k++, p++) {
						expect(ten.at(i, j, k)).toBe(p)
					}
				}
			}
		})
	})

	test('zeros', () => {
		const ten = Tensor.zeros([2, 3, 4])
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				for (let k = 0; k < 4; k++) {
					expect(ten.at(i, j, k)).toBe(0)
				}
			}
		}
	})

	test('ones', () => {
		const ten = Tensor.ones([2, 3, 4])
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				for (let k = 0; k < 4; k++) {
					expect(ten.at(i, j, k)).toBe(1)
				}
			}
		}
	})

	describe('random', () => {
		test('default', () => {
			const ten = Tensor.random([100, 20, 10])
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 20; j++) {
					for (let k = 0; k < 10; k++) {
						expect(ten.at(i, j, k)).toBeGreaterThanOrEqual(0)
						expect(ten.at(i, j, k)).toBeLessThan(1)
					}
				}
			}
		})

		test('min max', () => {
			const ten = Tensor.random([100, 20, 10], -1, 2)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 20; j++) {
					for (let k = 0; k < 10; k++) {
						expect(ten.at(i, j, k)).toBeGreaterThanOrEqual(-1)
						expect(ten.at(i, j, k)).toBeLessThan(2)
					}
				}
			}
		})
	})

	test.todo('randn')

	describe('fromArray', () => {
		test('tensor', () => {
			const org = Tensor.randn([10, 5])
			const ten = Tensor.fromArray(org)
			expect(ten).toBe(org)
		})

		test('matrix', () => {
			const org = Matrix.randn(10, 5)
			const ten = Tensor.fromArray(org)
			expect(ten.sizes).toEqual(org.sizes)
			expect(ten.value).toEqual(org.value)
		})

		test('scaler', () => {
			const ten = Tensor.fromArray(7)
			expect(ten.sizes).toEqual([1])
			expect(ten.at(0)).toBe(7)
		})

		test('empty', () => {
			const ten = Tensor.fromArray([])
			expect(ten.sizes).toEqual([0])
		})

		test('array', () => {
			const ten = Tensor.fromArray([1, 2, 3])
			expect(ten.sizes).toEqual([3])
			for (let i = 0; i < 3; i++) {
				expect(ten.at(i)).toBe(i + 1)
			}
		})

		test('2d array', () => {
			const ten = Tensor.fromArray([
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			])
			expect(ten.sizes).toEqual([3, 3])
			for (let i = 0, p = 1; i < 3; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(ten.at(i, j)).toBe(p)
				}
			}
		})

		test('3d array', () => {
			const ten = Tensor.fromArray([
				[
					[1, 2],
					[3, 4],
					[5, 6],
				],
				[
					[7, 8],
					[9, 10],
					[11, 12],
				],
			])
			expect(ten.sizes).toEqual([2, 3, 2])
			for (let i = 0, p = 1; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 2; k++, p++) {
						expect(ten.at(i, j, k)).toBe(p)
					}
				}
			}
		})
	})

	test.each([[[2]], [[2, 3]], [[2, 3, 4]]])('dimension %p', size => {
		const ten = new Tensor(size)
		expect(ten.dimension).toBe(size.length)
	})

	test.each([[[2]], [[2, 3]], [[2, 3, 4]]])('sizes %p', size => {
		const ten = new Tensor(size)
		expect(ten.sizes).toEqual(size)
	})

	test.each([[[2]], [[2, 3]], [[2, 3, 4]]])('length %p', size => {
		const ten = new Tensor(size)
		expect(ten.length).toEqual(size.reduce((s, v) => s * v, 1))
	})

	test('value', () => {
		const ten = Tensor.randn([2, 3, 4])
		expect(ten.value).toBeInstanceOf(Array)
		expect(ten.value).toHaveLength(24)
	})

	test('iterate', () => {
		const ten = Tensor.randn([2, 3, 4])
		let i = 0
		for (const v of ten) {
			expect(v).toBe(ten.value[i++])
		}
	})

	test('toArray', () => {
		const ten = Tensor.randn([2, 3, 4])
		const arr = ten.toArray()
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				for (let k = 0; k < 4; k++) {
					expect(arr[i][j][k]).toBe(ten.at(i, j, k))
				}
			}
		}
	})

	describe('toString', () => {
		test('dim 0', () => {
			const ten = Tensor.zeros([])
			expect(ten.toString()).toBe('0')
		})

		test('dim 1', () => {
			const ten = Tensor.zeros([3])
			expect(ten.toString()).toBe('[0, 0, 0]')
		})

		test('dim 2', () => {
			const ten = Tensor.zeros([2, 3])
			expect(ten.toString()).toBe('[[0, 0, 0], [0, 0, 0]]')
		})

		test('dim 3', () => {
			const ten = Tensor.zeros([1, 2, 3])
			expect(ten.toString()).toBe('[[[0, 0, 0], [0, 0, 0]]]')
		})
	})

	describe('toMatrix', () => {
		test('success', () => {
			const ten = Tensor.randn([10, 20])
			const mat = ten.toMatrix()
			expect(mat.sizes).toEqual(ten.sizes)
			expect(mat.value).toEqual(ten.value)
		})

		test.each([[[2]], [[1, 2, 3]]])('fail %p', sizes => {
			const ten = Tensor.randn(sizes)
			expect(() => ten.toMatrix()).toThrowError('Only 2D tensor can convert to matrix.')
		})
	})

	test('copy', () => {
		const org = Tensor.randn([2, 3, 4])
		const ten = org.copy()
		expect(ten._value).not.toBe(org._value)
		expect(ten._value).toEqual(org._value)
	})

	describe('equals', () => {
		test('same', () => {
			const data = [
				[
					[1, 2, 3],
					[4, 5, 6],
				],
				[
					[7, 8, 9],
					[10, 11, 12],
				],
			]
			const ten1 = new Tensor([2, 2, 3], data)
			const ten2 = new Tensor([2, 2, 3], data)
			expect(ten1.equals(ten2)).toBeTruthy()
		})

		test('not same dim', () => {
			const ten1 = Tensor.randn([2, 3, 4])
			const ten2 = Tensor.randn([3, 2, 4, 5])
			expect(ten1.equals(ten2)).toBeFalsy()
		})

		test('not same size', () => {
			const ten1 = Tensor.randn([2, 3, 4])
			const ten2 = Tensor.randn([3, 2, 4])
			expect(ten1.equals(ten2)).toBeFalsy()
		})

		test('not same value', () => {
			const ten1 = Tensor.randn([2, 3, 4])
			const ten2 = Tensor.randn([2, 3, 4])
			expect(ten1.equals(ten2)).toBeFalsy()
		})

		test('not tensor', () => {
			const ten = Tensor.randn([2, 3, 4])
			expect(ten.equals(1)).toBeFalsy()
		})
	})

	describe('at', () => {
		test('default', () => {
			const data = [
				[
					[1, 2],
					[3, 4],
					[5, 6],
				],
				[
					[7, 8],
					[9, 10],
					[11, 12],
				],
			]
			const ten = new Tensor([2, 3, 2], data)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 2; k++) {
						expect(ten.at(i, j, k)).toBe(data[i][j][k])
						expect(ten.at([i, j, k])).toBe(data[i][j][k])
					}
				}
			}
		})

		test.each([
			[-1, 0, 0],
			[2, 0, 0],
			[0, -1, 0],
			[0, 3, 0],
			[0, 0, -1],
			[0, 0, 4],
		])('fail[%i, %i, %i]', (i, j, k) => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.at(i, j, k)).toThrowError('Index out of bounds.')
			expect(() => ten.at([i, j, k])).toThrowError('Index out of bounds.')
		})

		test('multi', () => {
			const data = [
				[
					[1, 2],
					[3, 4],
					[5, 6],
				],
				[
					[7, 8],
					[9, 10],
					[11, 12],
				],
			]
			const ten = new Tensor([2, 3, 2], data)

			const at = ten.at(1, 1)
			expect(at.sizes).toEqual([2])
			expect(at.at(0)).toBe(9)
			expect(at.at(1)).toBe(10)
		})

		test.each([[-1], [2]])('fail[%i]', i => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.at(i)).toThrowError('Index out of bounds.')
			expect(() => ten.at([i])).toThrowError('Index out of bounds.')
		})

		test.each([
			[-1, 0],
			[2, 0],
			[0, -1],
			[0, 3],
		])('fail[%i, %i]', (i, j) => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.at(i, j)).toThrowError('Index out of bounds.')
			expect(() => ten.at([i, j])).toThrowError('Index out of bounds.')
		})
	})

	describe('slice', () => {
		test.each([
			[0, 1],
			[0, 2],
			[2, 3],
		])('axis 0 %p', (from, to) => {
			const ten = Tensor.randn([3, 4, 5])
			const slice = ten.slice(from, to)
			expect(slice.sizes).toEqual([to - from, 4, 5])
			for (let i = 0; i < to - from; i++) {
				for (let j = 0; j < 4; j++) {
					for (let k = 0; k < 5; k++) {
						expect(slice.at(i, j, k)).toBe(ten.at(from + i, j, k))
					}
				}
			}
		})

		test.each([-1, 1, 2])('fail axis %i', axis => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.slice(0, 1, axis)).toThrowError('Invalid axis. Only 0 is accepted.')
		})
	})

	test.todo('set')

	describe('select', () => {
		test.each([0, 1, 2])('axis 0 %p', k => {
			const ten = Tensor.randn([3, 4, 5])
			const slice = ten.select(k)
			expect(slice.sizes).toEqual([1, 4, 5])
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 5; j++) {
					expect(slice.at(0, i, j)).toBe(ten.at(k, i, j))
				}
			}
		})
	})

	test('fill', () => {
		const ten = new Tensor([2, 3, 4])
		ten.fill(6)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				for (let k = 0; k < 4; k++) {
					expect(ten.at(i, j, k)).toBe(6)
				}
			}
		}
	})

	test('map', () => {
		const org = Tensor.randn([2, 3, 4])
		const ten = org.copy()
		ten.map(v => v ** 2)
		for (let i = 0; i < ten.length; i++) {
			expect(ten.value[i]).toBe(org.value[i] ** 2)
		}
	})

	describe('forEach', () => {
		test('values', () => {
			const ten = Tensor.randn([2, 3, 4])
			const value = []
			ten.forEach(v => value.push(v))
			for (let i = 0; i < ten.length; i++) {
				expect(value[i]).toBe(ten.value[i])
			}
		})

		test.todo('index')
	})

	test.todo('shuffle')

	describe('transpose', () => {
		test('3', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.transpose(2, 0, 1)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(k, i, j)).toBe(org.at(i, j, k))
					}
				}
			}
		})
	})

	test.todo('reshape')
})

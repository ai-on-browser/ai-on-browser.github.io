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

	describe('set', () => {
		test('default', () => {
			const ten = Tensor.randn([2, 3, 4])
			ten.set([1, 2, 3], 100)
			expect(ten.at(1, 2, 3)).toBe(100)
		})

		test('scalar', () => {
			const ten = Tensor.randn([5])
			ten.set(3, 100)
			expect(ten.at(3)).toBe(100)
		})
	})

	describe('select', () => {
		describe('axis 0', () => {
			test.each([0, 1, 2])('scalar %p', k => {
				const ten = Tensor.randn([3, 4, 5])
				const slice = ten.select(k)
				expect(slice.sizes).toEqual([1, 4, 5])
				for (let i = 0; i < 4; i++) {
					for (let j = 0; j < 5; j++) {
						expect(slice.at(0, i, j)).toBe(ten.at(k, i, j))
					}
				}
			})

			test.each([[[0]], [[1]], [[2]], [[0, 0]], [[1, 2]], [[2, 0]]])('array %p', k => {
				const ten = Tensor.randn([3, 4, 5])
				const slice = ten.select(k)
				expect(slice.sizes).toEqual([k.length, 4, 5])
				for (let t = 0; t < k.length; t++) {
					for (let i = 0; i < 4; i++) {
						for (let j = 0; j < 5; j++) {
							expect(slice.at(t, i, j)).toBe(ten.at(k[t], i, j))
						}
					}
				}
			})
		})

		test.each([-1, 1])('axis %i', i => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.select(0, i)).toThrowError('Invalid axis.')
		})
	})

	describe('slice', () => {
		test.each([
			[0, 1],
			[0, 2],
			[2, 3],
		])('axis 0 [%i, %i]', (from, to) => {
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

		test.each([
			[0, 1],
			[0, 2],
			[2, 3],
		])('axis 1 [%i %i]', (from, to) => {
			const ten = Tensor.randn([4, 3, 5])
			const slice = ten.slice(from, to, 1)
			expect(slice.sizes).toEqual([4, to - from, 5])
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < to - from; j++) {
					for (let k = 0; k < 5; k++) {
						expect(slice.at(i, j, k)).toBe(ten.at(i, from + j, k))
					}
				}
			}
		})

		test.each([-1, 3])('fail axis %i', axis => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.slice(0, 1, axis)).toThrowError('Invalid axis.')
		})

		test.each([
			[-1, 1],
			[0, 3],
			[-1, 3],
		])('out index %i %i', (i, j) => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.slice(i, j, 0)).toThrowError('Index out of bounds.')
		})

		test.each([[1, 0]])('invalid index %i %i', (i, j) => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.slice(i, j, 0)).toThrowError('Invalid index.')
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

	describe('flip', () => {
		test('axis 0', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			ten.flip(0)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(1 - i, j, k))
					}
				}
			}
		})

		test('axis 1', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			ten.flip(1)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(i, 2 - j, k))
					}
				}
			}
		})

		test('axis 2', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			ten.flip(2)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(i, j, 3 - k))
					}
				}
			}
		})

		test.each([-1, 3, 4])('fail axis %i', axis => {
			const ten = Tensor.randn([2, 3, 4])
			expect(() => ten.flip(axis)).toThrowError('Invalid axis.')
		})
	})

	describe('shuffle', () => {
		test('axis 0', () => {
			const org = Tensor.randn([3, 4, 5])
			const ten = org.copy()
			ten.shuffle(0)

			const expidx = []
			for (let t = 0; t < org.sizes[0]; t++) {
				for (let i = 0; i < org.sizes[0]; i++) {
					let flg = true
					for (let j = 0; j < org.sizes[1]; j++) {
						for (let k = 0; k < org.sizes[2]; k++) {
							flg &= ten.at(t, j, k) === org.at(i, j, k)
						}
					}
					if (flg) {
						expidx.push(i)
						break
					}
				}
			}
			expidx.sort((a, b) => a - b)
			expect(expidx).toHaveLength(org.sizes[0])
			for (let i = 0; i < org.sizes[0]; i++) {
				expect(expidx[i]).toBe(i)
			}
		})

		test.each([-1, 1])('fail invalid axis %p', axis => {
			const mat = Tensor.randn([2, 3, 4])
			expect(() => mat.shuffle(axis)).toThrowError('Invalid axis.')
		})
	})

	describe('resize', () => {
		test('default', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			ten.resize([3, 2, 5])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(i, j, k))
					}
					for (let k = 4; k < 5; k++) {
						expect(ten.at(i, j, k)).toBe(0)
					}
				}
			}
			for (let i = 2; i < 3; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 5; k++) {
						expect(ten.at(i, j, k)).toBe(0)
					}
				}
			}
		})
	})

	describe('reshape', () => {
		test('success', () => {
			const org = Tensor.randn([3, 4, 5])
			const ten = org.copy()
			ten.reshape(10, 3, 2)
			expect(ten.sizes).toEqual([10, 3, 2])
			expect(ten.length).toBe(org.length)
			expect(ten.value).toEqual(org.value)
		})

		test('diff dim', () => {
			const org = Tensor.randn([3, 4, 5])
			const ten = org.copy()
			ten.reshape(6, 10)
			expect(ten.sizes).toEqual([6, 10])
			expect(ten.length).toBe(org.length)
			expect(ten.value).toEqual(org.value)
		})

		test.each([
			[-1, 4, 6],
			[3, 4, 5],
			[6, 0, 1],
		])('fail [%i, %i]', (r, c, d) => {
			const ten = Tensor.random([2, 3, 4])
			expect(() => ten.reshape(r, c, d)).toThrowError('Length is different.')
		})
	})

	describe('concat', () => {
		test('axis 0', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			const t = new Tensor([1, 3, 4])
			ten.concat(t)
			expect(ten.sizes).toEqual([3, 3, 4])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(i, j, k))
					}
				}
			}
			for (let i = 2; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(t.at(i - 2, j, k))
					}
				}
			}
		})

		test('axis 1', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			const t = new Tensor([2, 2, 4])
			ten.concat(t, 1)
			expect(ten.sizes).toEqual([2, 5, 4])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(i, j, k))
					}
				}
				for (let j = 3; j < 5; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(t.at(i, j - 3, k))
					}
				}
			}
		})

		test('fail dimension', () => {
			const ten = new Tensor([2, 3, 4, 5])
			const t = new Tensor([2, 3, 4])
			expect(() => ten.concat(t, 0)).toThrowError('Size is different.')
		})

		test('fail sizes 0', () => {
			const ten = new Tensor([2, 3, 4])
			const t = new Tensor([2, 4, 4])
			expect(() => ten.concat(t, 0)).toThrowError('Size is different.')
		})

		test('fail sizes 1', () => {
			const ten = new Tensor([2, 3, 4])
			const t = new Tensor([3, 3, 4])
			expect(() => ten.concat(t, 1)).toThrowError('Size is different.')
		})

		test.each([-1, 3, 4])('fail axis %i', axis => {
			const ten = new Tensor([2, 3, 4])
			const t = new Tensor([2, 3, 4])
			expect(() => ten.concat(t, axis)).toThrowError('Invalid axis.')
		})
	})

	describe('reduce', () => {
		describe('axis -1', () => {
			test('no init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, null)
				expect(reduce).toBeCloseTo(ten.value.reduce((s, v) => s + v))
			})

			test('with init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 1)
				expect(reduce).toBeCloseTo(1 + ten.value.reduce((s, v) => s + v))
			})

			test('keepdims', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 0, -1, true)
				expect(reduce.sizes).toEqual([1, 1, 1])
				expect(reduce.at(0, 0, 0)).toBeCloseTo(ten.value.reduce((s, v) => s + v))
			})
		})

		describe('axis 0', () => {
			test('no init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, undefined, 0)
				expect(reduce.sizes).toEqual([5, 7])

				for (let j = 0; j < ten.sizes[1]; j++) {
					for (let k = 0; k < ten.sizes[2]; k++) {
						let v = 0
						for (let i = 0; i < ten.sizes[0]; i++) {
							v += ten.at(i, j, k)
						}
						expect(reduce.at(j, k)).toBeCloseTo(v)
					}
				}
			})

			test('with init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 1, 0)
				expect(reduce.sizes).toEqual([5, 7])

				for (let j = 0; j < ten.sizes[1]; j++) {
					for (let k = 0; k < ten.sizes[2]; k++) {
						let v = 1
						for (let i = 0; i < ten.sizes[0]; i++) {
							v += ten.at(i, j, k)
						}
						expect(reduce.at(j, k)).toBeCloseTo(v)
					}
				}
			})

			test('keepdims', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 0, 0, true)
				expect(reduce.sizes).toEqual([1, 5, 7])

				for (let j = 0; j < ten.sizes[1]; j++) {
					for (let k = 0; k < ten.sizes[2]; k++) {
						let v = 0
						for (let i = 0; i < ten.sizes[0]; i++) {
							v += ten.at(i, j, k)
						}
						expect(reduce.at(0, j, k)).toBeCloseTo(v)
					}
				}
			})
		})

		describe('axis 1', () => {
			test('no init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, undefined, 1)
				expect(reduce.sizes).toEqual([3, 7])

				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let k = 0; k < ten.sizes[2]; k++) {
						let v = 0
						for (let j = 0; j < ten.sizes[1]; j++) {
							v += ten.at(i, j, k)
						}
						expect(reduce.at(i, k)).toBeCloseTo(v)
					}
				}
			})

			test('with init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 1, 1)
				expect(reduce.sizes).toEqual([3, 7])

				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let k = 0; k < ten.sizes[2]; k++) {
						let v = 1
						for (let j = 0; j < ten.sizes[1]; j++) {
							v += ten.at(i, j, k)
						}
						expect(reduce.at(i, k)).toBeCloseTo(v)
					}
				}
			})

			test('keepdims', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 1, 1, true)
				expect(reduce.sizes).toEqual([3, 1, 7])

				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let k = 0; k < ten.sizes[2]; k++) {
						let v = 1
						for (let j = 0; j < ten.sizes[1]; j++) {
							v += ten.at(i, j, k)
						}
						expect(reduce.at(i, 0, k)).toBeCloseTo(v)
					}
				}
			})
		})

		test.each([3, 4])('invalid axis %i', axis => {
			const ten = Tensor.random([2, 3, 4])
			expect(() => ten.reduce((s, v) => s + v, 0, axis)).toThrowError('Invalid axis.')
		})
	})

	describe('broadcastOperate', () => {
		test('scaler', () => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			ten.broadcastOperate(1, (a, b) => a + b)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 4; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(i, j, k) + 1)
					}
				}
			}
		})

		describe('matrix', () => {
			test('same sub size', () => {
				const org = Tensor.randn([2, 3, 4])
				const ten = org.copy()
				const mat = Matrix.randn(3, 4)
				ten.broadcastOperate(mat, (a, b) => a + b)
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 3; j++) {
						for (let k = 0; k < 4; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j, k) + mat.at(j, k))
						}
					}
				}
			})

			test('sub', () => {
				const org = Tensor.randn([2, 6, 4])
				const ten = org.copy()
				const mat = Matrix.randn(3, 2)
				ten.broadcastOperate(mat, (a, b) => a + b)
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 3; j++) {
						for (let k = 0; k < 4; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j, k) + mat.at(j % 3, k % 2))
						}
					}
				}
			})
		})

		describe('tensor', () => {
			test('same size', () => {
				const org = Tensor.randn([2, 3, 4])
				const ten = org.copy()
				const o = Tensor.randn([2, 3, 4])
				ten.broadcastOperate(o, (a, b) => a + b)
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 3; j++) {
						for (let k = 0; k < 4; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j, k) + o.at(i, j, k))
						}
					}
				}
			})

			test('same sub size 2', () => {
				const org = Tensor.randn([2, 3, 4])
				const ten = org.copy()
				const o = Tensor.randn([3, 4])
				ten.broadcastOperate(o, (a, b) => a + b)
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 3; j++) {
						for (let k = 0; k < 4; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j, k) + o.at(j, k))
						}
					}
				}
			})

			test('sub size 2', () => {
				const org = Tensor.randn([2, 3, 4])
				const ten = org.copy()
				const o = Tensor.randn([3, 1])
				ten.broadcastOperate(o, (a, b) => a + b)
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 3; j++) {
						for (let k = 0; k < 4; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j, k) + o.at(j, 0))
						}
					}
				}
			})

			test('same sub size 1', () => {
				const org = Tensor.randn([2, 3, 4])
				const ten = org.copy()
				const o = Tensor.randn([4])
				ten.broadcastOperate(o, (a, b) => a + b)
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 3; j++) {
						for (let k = 0; k < 4; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j, k) + o.at(k))
						}
					}
				}
			})
		})

		test('invalid matrix with 1d tensor', () => {
			const ten = Tensor.random([2])
			const mat = Matrix.randn(3, 2)
			expect(() => ten.broadcastOperate(mat, (s, v) => s + v)).toThrowError('Broadcasting size invalid.')
		})

		test('invalid matrix size', () => {
			const ten = Tensor.random([2, 3])
			const mat = Matrix.randn(3, 2)
			expect(() => ten.broadcastOperate(mat, (s, v) => s + v)).toThrowError('Broadcasting size invalid.')
		})

		test('invalid matrix with small tensor', () => {
			const ten = Tensor.random([2, 3])
			const o = Tensor.randn([2, 3, 4])
			expect(() => ten.broadcastOperate(o, (s, v) => s + v)).toThrowError('Broadcasting size invalid.')
		})

		test('invalid tensor size', () => {
			const ten = Tensor.random([2, 3, 4])
			const o = Tensor.randn([3, 2, 4])
			expect(() => ten.broadcastOperate(o, (s, v) => s + v)).toThrowError('Broadcasting size invalid.')
		})
	})

	describe('operateAt', () => {
		test('success', () => {
			const org = Tensor.random([2, 3, 4])
			const ten = org.copy()
			ten.operateAt([1, 1, 1], v => v + 1)
			expect(ten.at(1, 1, 1)).toBe(org.at(1, 1, 1) + 1)
		})

		test('scalar', () => {
			const org = Tensor.random([5])
			const ten = org.copy()
			ten.operateAt(1, v => v + 1)
			expect(ten.at(1)).toBe(org.at(1) + 1)
		})
	})

	describe('dot', () => {
		test('matrix', () => {
			const ten = Tensor.randn([3, 4, 5])
			const mat = Matrix.randn(5, 6)

			const dot = ten.dot(mat)
			expect(dot.sizes).toEqual([3, 4, 6])
			for (let i = 0; i < ten.sizes[0]; i++) {
				for (let j = 0; j < ten.sizes[1]; j++) {
					for (let k = 0; k < mat.cols; k++) {
						let v = 0
						for (let l = 0; l < ten.sizes[2]; l++) {
							v += ten.at(i, j, l) * mat.at(l, k)
						}
						expect(dot.at(i, j, k)).toBeCloseTo(v)
					}
				}
			}
		})

		test('invalid size', () => {
			const ten = Tensor.randn([3, 4, 5])
			const mat = Matrix.randn(4, 5)
			expect(() => ten.dot(mat)).toThrowError('Dot size invalid.')
		})
	})
})

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
			expect(() => ten.toMatrix()).toThrow('Only 2D tensor can convert to matrix.')
		})
	})

	describe('toScaler', () => {
		test.each([[[]], [[1]], [[1, 1]], [[1, 1, 1]]])('success %p', sizes => {
			const ten = Tensor.randn(sizes)
			const value = ten.toScaler()
			expect(value).toBe(ten.at(Array(ten.dimension).fill(0)))
		})

		test.each([[[2]], [[1, 2]], [[1, 3, 1]]])('fail %p', sizes => {
			const ten = new Tensor(sizes)
			expect(() => ten.toScaler()).toThrow('The tensor cannot convert to scaler.')
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
			expect(() => ten.at(i, j, k)).toThrow('Index out of bounds.')
			expect(() => ten.at([i, j, k])).toThrow('Index out of bounds.')
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
			expect(() => ten.at(i)).toThrow('Index out of bounds.')
			expect(() => ten.at([i])).toThrow('Index out of bounds.')
		})

		test.each([
			[-1, 0],
			[2, 0],
			[0, -1],
			[0, 3],
		])('fail[%i, %i]', (i, j) => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.at(i, j)).toThrow('Index out of bounds.')
			expect(() => ten.at([i, j])).toThrow('Index out of bounds.')
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
			expect(() => ten.select(0, i)).toThrow('Invalid axis.')
		})
	})

	describe('slice', () => {
		describe.each([undefined, 0])('axis %p', axis => {
			test.each([
				[0, 1],
				[0, 2],
				[2, 3],
			])('[%i, %i]', (from, to) => {
				const ten = Tensor.randn([3, 4, 5])
				const slice = ten.slice(from, to, axis)
				expect(slice.sizes).toEqual([to - from, 4, 5])
				for (let i = 0; i < to - from; i++) {
					for (let j = 0; j < 4; j++) {
						for (let k = 0; k < 5; k++) {
							expect(slice.at(i, j, k)).toBe(ten.at(from + i, j, k))
						}
					}
				}
			})
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
			expect(() => ten.slice(0, 1, axis)).toThrow('Invalid axis.')
		})

		test.each([
			[-1, 1],
			[0, 3],
			[-1, 3],
		])('out index %i %i', (i, j) => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.slice(i, j, 0)).toThrow('Index out of bounds.')
		})

		test.each([[1, 0]])('invalid index %i %i', (i, j) => {
			const ten = new Tensor([2, 3, 4])
			expect(() => ten.slice(i, j, 0)).toThrow('Invalid index.')
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
		test.each([undefined, 0])('axis %p', axis => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			ten.flip(axis)
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
			expect(() => ten.flip(axis)).toThrow('Invalid axis.')
		})
	})

	describe('shuffle', () => {
		test.each([undefined, 0])('axis %p', axis => {
			const org = Tensor.randn([3, 4, 5])
			const ten = org.copy()
			ten.shuffle(axis)

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
			expect(() => mat.shuffle(axis)).toThrow('Invalid axis.')
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

		test('neg value', () => {
			const org = Tensor.randn([3, 4, 5])
			const ten = org.copy()
			ten.reshape(-1, 12)
			expect(ten.sizes).toEqual([5, 12])
			expect(ten.length).toBe(org.length)
			expect(ten.value).toEqual(org.value)
		})

		test.each([
			[-1, 3, 6],
			[3, 4, 5],
			[6, 0, 1],
		])('fail [%i, %i]', (r, c, d) => {
			const ten = Tensor.random([2, 3, 4])
			expect(() => ten.reshape(r, c, d)).toThrow('Length is different.')
		})
	})

	describe('repeat', () => {
		describe.each([undefined, 0, 0])('1d axis %i', axis => {
			test.each([2, [2]])('repeat %p', rep => {
				const org = Tensor.randn([3])
				const ten = org.copy()
				ten.repeat(rep, axis)
				expect(ten.sizes).toEqual([6])
				for (let i = 0; i < ten.sizes[0]; i++) {
					expect(ten.at(i)).toBe(org.at(i % 3))
				}
			})
		})

		describe('2d', () => {
			test.each([undefined, 0])('axis %i', axis => {
				const org = Tensor.randn([3, 4])
				const ten = org.copy()
				ten.repeat(2, axis)
				expect(ten.sizes).toEqual([6, 4])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						expect(ten.at(i, j)).toBe(org.at(i % 3, j))
					}
				}
			})

			test('axis 1', () => {
				const org = Tensor.randn([3, 4])
				const ten = org.copy()
				ten.repeat(2, 1)
				expect(ten.sizes).toEqual([3, 8])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						expect(ten.at(i, j)).toBe(org.at(i, j % 4))
					}
				}
			})

			test('array repeat 1', () => {
				const org = Tensor.randn([3, 4])
				const ten = org.copy()
				ten.repeat([2])
				expect(ten.sizes).toEqual([6, 4])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						expect(ten.at(i, j)).toBe(org.at(i % 3, j))
					}
				}
			})

			test('array repeat 2', () => {
				const org = Tensor.randn([3, 4])
				const ten = org.copy()
				ten.repeat([2, 3])
				expect(ten.sizes).toEqual([6, 12])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						expect(ten.at(i, j)).toBe(org.at(i % 3, j % 4))
					}
				}
			})
		})

		describe('3d', () => {
			test.each([undefined, 0])('axis %i', axis => {
				const org = Tensor.randn([3, 4, 5])
				const ten = org.copy()
				ten.repeat(2, axis)
				expect(ten.sizes).toEqual([6, 4, 5])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						for (let k = 0; k < ten.sizes[2]; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i % 3, j, k))
						}
					}
				}
			})

			test('axis 1', () => {
				const org = Tensor.randn([3, 4, 5])
				const ten = org.copy()
				ten.repeat(2, 1)
				expect(ten.sizes).toEqual([3, 8, 5])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						for (let k = 0; k < ten.sizes[2]; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j % 4, k))
						}
					}
				}
			})

			test('axis 2', () => {
				const org = Tensor.randn([3, 4, 5])
				const ten = org.copy()
				ten.repeat(2, 2)
				expect(ten.sizes).toEqual([3, 4, 10])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						for (let k = 0; k < ten.sizes[2]; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i, j, k % 5))
						}
					}
				}
			})

			test('array repeat 1', () => {
				const org = Tensor.randn([3, 4, 5])
				const ten = org.copy()
				ten.repeat([2])
				expect(ten.sizes).toEqual([6, 4, 5])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						for (let k = 0; k < ten.sizes[2]; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i % 3, j, k))
						}
					}
				}
			})

			test('array repeat 2', () => {
				const org = Tensor.randn([3, 4, 5])
				const ten = org.copy()
				ten.repeat([2, 3])
				expect(ten.sizes).toEqual([6, 12, 5])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						for (let k = 0; k < ten.sizes[2]; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i % 3, j % 4, k))
						}
					}
				}
			})

			test('array repeat 3', () => {
				const org = Tensor.randn([3, 4, 5])
				const ten = org.copy()
				ten.repeat([2, 3, 4])
				expect(ten.sizes).toEqual([6, 12, 20])
				for (let i = 0; i < ten.sizes[0]; i++) {
					for (let j = 0; j < ten.sizes[1]; j++) {
						for (let k = 0; k < ten.sizes[2]; k++) {
							expect(ten.at(i, j, k)).toBe(org.at(i % 3, j % 4, k % 5))
						}
					}
				}
			})
		})
	})

	describe('concat', () => {
		test.each([undefined, 0])('axis %p', axis => {
			const org = Tensor.randn([2, 3, 4])
			const ten = org.copy()
			const t = new Tensor([1, 3, 4])
			ten.concat(t, axis)
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
			expect(() => ten.concat(t, 0)).toThrow('Size is different.')
		})

		test('fail sizes 0', () => {
			const ten = new Tensor([2, 3, 4])
			const t = new Tensor([2, 4, 4])
			expect(() => ten.concat(t, 0)).toThrow('Size is different.')
		})

		test('fail sizes 1', () => {
			const ten = new Tensor([2, 3, 4])
			const t = new Tensor([3, 3, 4])
			expect(() => ten.concat(t, 1)).toThrow('Size is different.')
		})

		test.each([-1, 3, 4])('fail axis %i', axis => {
			const ten = new Tensor([2, 3, 4])
			const t = new Tensor([2, 3, 4])
			expect(() => ten.concat(t, axis)).toThrow('Invalid axis.')
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

		describe('axis 0,1', () => {
			test('no init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, undefined, [0, 1])
				expect(reduce.sizes).toEqual([7])

				for (let k = 0; k < ten.sizes[2]; k++) {
					let v = 0
					for (let i = 0; i < ten.sizes[0]; i++) {
						for (let j = 0; j < ten.sizes[1]; j++) {
							v += ten.at(i, j, k)
						}
					}
					expect(reduce.at(k)).toBeCloseTo(v)
				}
			})

			test('with init', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 1, [0, 1])
				expect(reduce.sizes).toEqual([7])

				for (let k = 0; k < ten.sizes[2]; k++) {
					let v = 1
					for (let i = 0; i < ten.sizes[0]; i++) {
						for (let j = 0; j < ten.sizes[1]; j++) {
							v += ten.at(i, j, k)
						}
					}
					expect(reduce.at(k)).toBeCloseTo(v)
				}
			})

			test('keepdims', () => {
				const ten = Tensor.randn([3, 5, 7])
				const reduce = ten.reduce((s, v) => s + v, 1, [0, 1], true)
				expect(reduce.sizes).toEqual([1, 1, 7])

				for (let k = 0; k < ten.sizes[2]; k++) {
					let v = 1
					for (let i = 0; i < ten.sizes[0]; i++) {
						for (let j = 0; j < ten.sizes[1]; j++) {
							v += ten.at(i, j, k)
						}
					}
					expect(reduce.at(0, 0, k)).toBeCloseTo(v)
				}
			})
		})

		test.each([3, 4])('invalid axis %i', axis => {
			const ten = Tensor.random([2, 3, 4])
			expect(() => ten.reduce((s, v) => s + v, 0, axis)).toThrow('Invalid axis.')
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

		test.each([
			[1, 6],
			[3, 6],
			[3, 24],
			[3, 2],
		])('tensor 1d + matrix %i,%i', (r, c) => {
			const org = Tensor.randn([6])
			const ten = org.copy()
			const mat = Matrix.randn(r, c)

			ten.broadcastOperate(mat, (a, b) => a + b)
			expect(ten.sizes).toEqual([r, Math.max(6, c)])
			for (let i = 0; i < ten.sizes[0]; i++) {
				for (let j = 0; j < ten.sizes[1]; j++) {
					expect(ten.at(i, j)).toBe(org.at(j % 6) + mat.at(i, j % c))
				}
			}
		})

		test.each([
			[6, 8],
			[2, 8],
			[6, 4],
			[2, 4],
			[12, 8],
			[6, 24],
			[12, 24],
			[2, 24],
			[12, 4],
		])('tensor 2d + matrix %i,%i', (r, c) => {
			const org = Tensor.randn([6, 8])
			const ten = org.copy()
			const mat = Matrix.randn(r, c)

			ten.broadcastOperate(mat, (a, b) => a + b)
			expect(ten.sizes).toEqual([Math.max(6, r), Math.max(8, c)])
			for (let i = 0; i < ten.sizes[0]; i++) {
				for (let j = 0; j < ten.sizes[1]; j++) {
					expect(ten.at(i, j)).toBe(org.at(i % 6, j % 8) + mat.at(i % r, j % c))
				}
			}
		})

		test.each([
			[6, 8],
			[2, 8],
			[6, 4],
			[2, 4],
			[12, 8],
			[6, 24],
			[12, 24],
			[2, 24],
			[12, 4],
		])('tensor 3d + matrix %i,%i', (r, c) => {
			const org = Tensor.randn([4, 6, 8])
			const ten = org.copy()
			const mat = Matrix.randn(r, c)

			ten.broadcastOperate(mat, (a, b) => a + b)
			expect(ten.sizes).toEqual([4, Math.max(6, r), Math.max(8, c)])
			for (let i = 0; i < ten.sizes[0]; i++) {
				for (let j = 0; j < ten.sizes[1]; j++) {
					for (let k = 0; k < ten.sizes[2]; k++) {
						expect(ten.at(i, j, k)).toBe(org.at(i, j % 6, k % 8) + mat.at(j % r, k % c))
					}
				}
			}
		})

		test.each([
			[[3], [6]],
			[[3, 4], [2]],
			[[3, 4, 5], [10]],
			[[3], [2, 6]],
			[
				[3, 4],
				[1, 8],
			],
			[
				[3, 4, 5],
				[2, 10],
			],
			[[3], [2, 5, 9]],
			[
				[3, 4],
				[2, 12, 16],
			],
			[
				[3, 4, 5],
				[6, 2, 15],
			],
		])('tensor %p + tensor %p', (s1, s2) => {
			const org = Tensor.randn(s1)
			const ten = org.copy()
			const o = Tensor.randn(s2)
			const bsize = Array(Math.max(s1.length, s2.length)).fill(0)
			for (let d = 0; d < s1.length; d++) {
				bsize[bsize.length - d - 1] = Math.max(bsize[bsize.length - d - 1], s1[s1.length - d - 1])
			}
			for (let d = 0; d < s2.length; d++) {
				bsize[bsize.length - d - 1] = Math.max(bsize[bsize.length - d - 1], s2[s2.length - d - 1])
			}

			ten.broadcastOperate(o, (a, b) => a + b)
			expect(ten.sizes).toEqual(bsize)

			const idx = Array(bsize.length).fill(0)
			let i = 0
			do {
				expect(ten._value[i]).toBe(
					org.at(idx.slice(bsize.length - s1.length).map((v, k) => v % s1[k])) +
						o.at(idx.slice(bsize.length - s2.length).map((v, k) => v % s2[k]))
				)
			} while (idx.some(v => v !== 0))
		})

		test.each([[[3]], [[2, 3]], [[5, 4, 3]]])('invalid matrix size %i,%i', size => {
			const ten = Tensor.random(size)
			const mat = Matrix.randn(3, 2)
			expect(() => ten.broadcastOperate(mat, (s, v) => s + v)).toThrow('Broadcasting size invalid.')
		})

		test.each([[[3]], [[2, 3]], [[3, 2, 2]], [[4, 3, 2, 1]]])('invalid tensor size', size => {
			const ten = Tensor.random(size)
			const o = Tensor.randn([2, 3, 4])
			expect(() => ten.broadcastOperate(o, (s, v) => s + v)).toThrow('Broadcasting size invalid.')
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
			expect(() => ten.dot(mat)).toThrow('Dot size invalid.')
		})
	})
})

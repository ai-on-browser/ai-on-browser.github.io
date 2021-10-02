import { Matrix, Tree } from '../../../lib/util/math.js'

describe('Tree', () => {
	describe('constructor', () => {
		test('default', () => {
			const tree = new Tree()
			expect(tree).toHaveLength(0)
			expect(tree.value).toBeUndefined()
			expect(tree.parent).toBeNull()
			expect(tree.depth).toBe(1)
		})

		test.each([null, 0, 1, 2.3, 'str', [], {}])('value %p', value => {
			const tree = new Tree(value)
			expect(tree.value).toBe(value)
		})

		test('childs', () => {
			const childs = [new Tree(), new Tree()]
			const tree = new Tree(null, childs)
			expect(tree).toHaveLength(2)
			expect(tree.depth).toBe(2)
		})
	})

	test.todo('length')

	test('depth', () => {
		let tree = new Tree()
		for (let depth = 1; depth < 10; depth++) {
			expect(tree.depth).toBe(depth)
			tree = new Tree(null, [tree])
		}
	})

	test('iterate', () => {
		const childs = [new Tree(), new Tree()]
		const tree = new Tree(null, childs)
		let i = 0
		for (const child of tree) {
			expect(child).toBe(childs[i++])
		}
	})

	test.todo('at')

	test.todo('push')

	test.todo('set')

	test.todo('removeAt')

	test.todo('clear')

	test.todo('isLeaf')

	test.todo('isRoot')

	test.todo('root')

	test.todo('leafs')

	test.todo('leafValues')

	test.todo('leafCount')

	test.todo('forEach')

	test.todo('scan')

	test.todo('scanLeaf')
})

describe('Tensor', () => {
	test.todo('constructor')

	test.todo('zeros')

	test.todo('ones')

	test.todo('random')

	test.todo('randn')

	test.todo('fromArray')

	test.todo('dimension')

	test.todo('sizes')

	test.todo('length')

	test.todo('value')

	test.todo('iterate')

	test.todo('toArray')

	test.todo('toString')

	test.todo('toMatrix')

	test.todo('copy')

	test.todo('at')

	test.todo('slice')

	test.todo('set')

	test.todo('select')

	test.todo('fill')

	test.todo('map')

	test.todo('forEach')

	test.todo('shuffle')

	test.todo('transpose')

	test.todo('reshape')
})

describe('Matrix', () => {
	describe('constructor', () => {
		test('default', () => {
			const mat = new Matrix(2, 3)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
		})

		test('scalar', () => {
			const mat = new Matrix(2, 3, 2)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(2)
				}
			}
		})

		test('array', () => {
			const mat = new Matrix(2, 3, [0, 1, 2, 3, 4, 5])
			for (let i = 0, p = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(i, j)).toBe(p)
				}
			}
		})

		test('multi array', () => {
			const mat = new Matrix(2, 3, [
				[0, 1, 2],
				[3, 4, 5],
			])
			for (let i = 0, p = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(i, j)).toBe(p)
				}
			}
		})
	})

	test('zeros', () => {
		const mat = Matrix.zeros(2, 3)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(i, j)).toBe(0)
			}
		}
	})

	test('ones', () => {
		const mat = Matrix.ones(2, 3)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(i, j)).toBe(1)
			}
		}
	})

	describe('eye', () => {
		test('default', () => {
			const mat = Matrix.eye(100, 10)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					if (i === j) {
						expect(mat.at(i, j)).toBe(1)
					} else {
						expect(mat.at(i, j)).toBe(0)
					}
				}
			}
		})

		test('scaler', () => {
			const mat = Matrix.eye(100, 10, 3)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					if (i === j) {
						expect(mat.at(i, j)).toBe(3)
					} else {
						expect(mat.at(i, j)).toBe(0)
					}
				}
			}
		})
	})

	describe('random', () => {
		test('default', () => {
			const mat = Matrix.random(100, 10)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(0)
					expect(mat.at(i, j)).toBeLessThan(1)
				}
			}
		})

		test('min max', () => {
			const mat = Matrix.random(100, 10, -1, 2)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(-1)
					expect(mat.at(i, j)).toBeLessThan(2)
				}
			}
		})
	})

	describe('randn', () => {
		const calcMV = mat => {
			const [n, m] = mat.sizes
			const sum = Array(m).fill(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < m; j++) {
					sum[j] += mat.at(i, j)
				}
			}
			const mean = sum.map(v => v / n)
			const diff = []
			for (let j = 0; j < m; j++) {
				diff[j] = Array(m).fill(0)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < m; j++) {
					for (let k = 0; k < m; k++) {
						diff[j][k] += (mat.at(i, j) - mean[j]) * (mat.at(i, k) - mean[k])
					}
				}
			}
			const vari = diff.map(r => r.map(v => v / n))
			return [mean, vari]
		}

		test('default', () => {
			const mat = Matrix.randn(10000, 10)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 10; j++) {
				expect(mean[j]).toBeCloseTo(0, 1)
				for (let k = 0; k < 10; k++) {
					if (j === k) {
						expect(vari[j][k]).toBeCloseTo(1, 0.9)
					} else {
						expect(vari[j][k]).toBeCloseTo(0, 1)
					}
				}
			}
		})

		test('scaler', () => {
			const mat = Matrix.randn(100000, 10, -10, 0.1)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 10; j++) {
				expect(mean[j]).toBeCloseTo(-10, 2)
				for (let k = 0; k < 10; k++) {
					if (j === k) {
						expect(vari[j][k]).toBeCloseTo(0.1, 2)
					} else {
						expect(vari[j][k]).toBeCloseTo(0, 2)
					}
				}
			}
		})

		test('array mean', () => {
			const mat = Matrix.randn(100000, 2, [3, 6], 2)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 2; j++) {
				expect(mean[j]).toBeCloseTo(j * 3 + 3, 1)
				for (let k = 0; k < 2; k++) {
					if (j === k) {
						expect(vari[j][k]).toBeCloseTo(2, 1)
					} else {
						expect(vari[j][k]).toBeCloseTo(0, 1)
					}
				}
			}
		})

		test('array vari', () => {
			const cov = [
				[0.3, 0.1],
				[0.1, 0.5],
			]
			const mat = Matrix.randn(100000, 2, 5, cov)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 2; j++) {
				expect(mean[j]).toBeCloseTo(5, 1)
				for (let k = 0; k < 2; k++) {
					expect(vari[j][k]).toBeCloseTo(cov[j][k], 1)
				}
			}
		})
	})

	test('diag', () => {
		const mat = Matrix.diag([1, 2, 3, 4])
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (i === j) {
					expect(mat.at(i, j)).toBe(i + 1)
				} else {
					expect(mat.at(i, j)).toBe(0)
				}
			}
		}
	})

	describe('fromArray', () => {
		test('matrix', () => {
			const org = Matrix.randn(10, 5)
			const mat = Matrix.fromArray(org)
			expect(mat).toEqual(mat)
		})

		test('scaler', () => {
			const mat = Matrix.fromArray(7)
			expect(mat.sizes).toEqual([1, 1])
			expect(mat.at(0, 0)).toBe(7)
		})

		test('empty', () => {
			const mat = Matrix.fromArray([])
			expect(mat.sizes).toEqual([0, 0])
		})

		test('array', () => {
			const mat = Matrix.fromArray([1, 2, 3])
			expect(mat.sizes).toEqual([3, 1])
			for (let i = 0; i < 3; i++) {
				expect(mat.at(i, 0)).toBe(i + 1)
			}
		})

		test('multi array', () => {
			const mat = Matrix.fromArray([
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			])
			expect(mat.sizes).toEqual([3, 3])
			for (let i = 0, p = 1; i < 3; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(i, j)).toBe(p)
				}
			}
		})
	})

	test('dimension', () => {
		const mat = new Matrix(2, 3)
		expect(mat.dimension).toBe(2)
	})

	test.each([
		[2, 3],
		[0, 1],
	])('sizes[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat.sizes).toHaveLength(2)
		expect(mat.sizes).toEqual([n, m])
	})

	test.each([
		[2, 3],
		[0, 1],
	])('length[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat).toHaveLength(n * m)
	})

	test.each([
		[2, 3],
		[0, 1],
	])('rows[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat.rows).toBe(n)
	})

	test.each([
		[2, 3],
		[0, 1],
	])('cols[%i, %i]', (n, m) => {
		const mat = new Matrix(n, m)
		expect(mat.cols).toBe(m)
	})

	test('value', () => {
		const mat = new Matrix(2, 3)
		expect(mat.value).toBeInstanceOf(Array)
		expect(mat.value).toHaveLength(6)
	})

	test('t', () => {
		const org = new Matrix(2, 3, [
			[1, 2, 3],
			[4, 5, 6],
		])
		const mat = org.t
		expect(mat.sizes).toEqual([3, 2])
		for (let i = 0, p = 1; i < 2; i++) {
			for (let j = 0; j < 3; j++, p++) {
				expect(mat.at(j, i)).toBe(p)
			}
		}
	})

	test('toArray', () => {
		const mat = new Matrix(2, 3, [
			[1, 2, 3],
			[4, 5, 6],
		])
		const array = mat.toArray()
		expect(array).toBeInstanceOf(Array)
		for (let i = 0, p = 1; i < 2; i++) {
			for (let j = 0; j < 3; j++, p++) {
				expect(array[i][j]).toBe(p)
			}
		}
	})

	test('toString', () => {
		const mat = new Matrix(2, 3, [
			[1, 2, 3],
			[4, 5, 6],
		])
		const str = mat.toString()
		expect(str).toEqual('[[1, 2, 3],\n [4, 5, 6]]')
	})

	describe('transpose', () => {
		test('default', () => {
			const org = new Matrix(2, 3, [
				[1, 2, 3],
				[4, 5, 6],
			])
			const mat = org.transpose()
			expect(mat.sizes).toEqual([3, 2])
			for (let i = 0, p = 1; i < 2; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(mat.at(j, i)).toBe(p)
				}
			}
		})

		test.todo('dst')
	})

	describe('copy', () => {
		test('default', () => {
			const org = new Matrix(2, 3, [
				[1, 2, 3],
				[4, 5, 6],
			])
			const mat = org.copy()
			expect(mat._value).not.toBe(org._value)
			expect(mat._value).toEqual(org._value)
		})

		test('copy self dst', () => {
			const org = new Matrix(2, 3, [
				[1, 2, 3],
				[4, 5, 6],
			])
			const mat = org.copy(org)
			expect(mat).toBe(org)
		})

		test.todo('dst')
	})

	describe('at', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat = new Matrix(2, 3, data)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(data[i][j])
				}
			}
		})

		test.each([
			[-1, 0],
			[2, 0],
			[0, -1],
			[0, 3],
		])('fail[%i, %i]', (i, j) => {
			const mat = new Matrix(2, 3)
			expect(() => mat.at(i, j)).toThrowError('Index out of bounds.')
		})
	})

	describe('set', () => {
		test('scaler', () => {
			const mat = new Matrix(2, 3)
			mat.set(1, 2, 1.5)
			expect(mat.at(1, 2)).toBe(1.5)
		})

		test.each([
			[-1, 0],
			[2, 0],
			[0, -1],
			[0, 3],
		])('fail scaler[%i, %i]', (i, j) => {
			const mat = new Matrix(2, 3)
			expect(() => mat.set(i, j, 0)).toThrowError('Index out of bounds.')
		})

		test('matrix', () => {
			const mat = new Matrix(3, 4)
			const data = [
				[1, 2],
				[3, 4],
			]
			const smat = new Matrix(2, 2, data)
			mat.set(1, 2, smat)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(mat.at(i + 1, j + 2)).toBe(data[i][j])
				}
			}
		})

		test.each([
			[-1, 0],
			[3, 0],
			[0, -1],
			[0, 4],
			[2, 0],
			[0, 3],
		])('fail matrix[%i, %i]', (i, j) => {
			const mat = new Matrix(3, 4)
			const smat = new Matrix(2, 2)
			expect(() => mat.set(i, j, smat)).toThrowError('Index out of bounds.')
		})
	})

	describe('row', () => {
		test.each([0, 1])('scaler[%i]', r => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			const mat = org.row(r)
			expect(mat.sizes).toEqual([1, 3])
			for (let j = 0; j < 3; j++) {
				expect(mat.at(0, j)).toBe(data[r][j])
			}
		})

		test.each([-1, 2])('fail scaler[%i]', i => {
			const mat = new Matrix(2, 3)
			expect(() => mat.row(i)).toThrowError('Index out of bounds.')
		})

		test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array[%p]', r => {
			const org = Matrix.randn(3, 5)
			const mat = org.row(r)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 5; j++) {
					expect(mat.at(i, j)).toBe(org.at(r[i], j))
				}
			}
		})

		test.each([[[-1, 0]], [[0, 3]]])('fail array[%p]', r => {
			const mat = Matrix.randn(3, 5)
			expect(() => mat.row(r)).toThrowError('Index out of bounds.')
		})
	})

	describe('col', () => {
		test.each([0, 1, 2])('scaler[%i]', c => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			const mat = org.col(c)
			expect(mat.sizes).toEqual([2, 1])
			for (let i = 0; i < 2; i++) {
				expect(mat.at(i, 0)).toBe(data[i][c])
			}
		})

		test.each([-1, 3])('fail scaler[%i]', i => {
			const mat = new Matrix(2, 3)
			expect(() => mat.col(i)).toThrowError('Index out of bounds.')
		})

		test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array[%p]', c => {
			const org = Matrix.randn(5, 3)
			const mat = org.col(c)
			for (let i = 0; i < 5; i++) {
				for (let j = 0; j < 2; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, c[j]))
				}
			}
		})

		test.each([[[-1, 0]], [[0, 3]]])('fail array[%p]', r => {
			const mat = Matrix.randn(5, 3)
			expect(() => mat.col(r)).toThrowError('Index out of bounds.')
		})
	})

	test.todo('slice')

	test.todo('sliceRow')

	test.todo('sliceCol')

	test.todo('removeRow')

	test.todo('removeCol')

	test.todo('sampleRow')

	test.todo('sampleCol')

	test('fill', () => {
		const mat = new Matrix(2, 3)
		mat.fill(6)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(i, j)).toBe(6)
			}
		}
	})

	test.todo('map')

	test.todo('copyMap')

	test.todo('forEach')

	describe('flip', () => {
		test.each([[undefined], [0]])('axis %i', axis => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat = new Matrix(2, 3, data)
			mat.flip(axis)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(1 - i, j)).toBe(data[i][j])
				}
			}
		})

		test('axis 1', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat = new Matrix(2, 3, data)
			mat.flip(1)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, 2 - j)).toBe(data[i][j])
				}
			}
		})
	})

	describe('swap', () => {
		test.each([
			[0, 1],
			[0, 2],
			[1, 2],
		])('swap %i and %i (axis=0)', (a, b) => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			]
			const mat = new Matrix(3, 3, data)
			mat.swap(a, b, 0)
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (i === a) {
						expect(mat.at(b, j)).toBe(data[i][j])
					} else if (i === b) {
						expect(mat.at(a, j)).toBe(data[i][j])
					} else {
						expect(mat.at(i, j)).toBe(data[i][j])
					}
				}
			}
		})

		test.each([
			[-1, 0],
			[1, 2],
			[-1, 2],
		])('fail swap %i and %i (axis=0)', (a, b) => {
			const mat = Matrix.random(2, 3)
			expect(() => mat.swap(a, b, 0)).toThrowError('Index out of bounds.')
		})

		test.each([
			[0, 1],
			[0, 2],
			[1, 2],
		])('swap %i and %i (axis=1)', (a, b) => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			]
			const mat = new Matrix(3, 3, data)
			mat.swap(a, b, 1)
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (j === a) {
						expect(mat.at(i, b)).toBe(data[i][j])
					} else if (j === b) {
						expect(mat.at(i, a)).toBe(data[i][j])
					} else {
						expect(mat.at(i, j)).toBe(data[i][j])
					}
				}
			}
		})

		test.each([
			[-1, 0],
			[2, 3],
			[-1, 3],
		])('fail swap %i and %i (axis=1)', (a, b) => {
			const mat = Matrix.random(2, 3)
			expect(() => mat.swap(a, b, 1)).toThrowError('Index out of bounds.')
		})
	})

	test.todo('sort')

	test.todo('shuffle')

	test.todo('resize')

	test.todo('reshape')

	test.todo('repeat')

	test.todo('copyRepeat')

	test.todo('concat')

	test.todo('reduce')

	describe('max', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.max()).toBe(6)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const max = org.max(0)
			expect(max.sizes).toEqual([1, 3])
			expect(max.value).toEqual([4, 5, 6])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const max = org.max(1)
			expect(max.sizes).toEqual([2, 1])
			expect(max.value).toEqual([5, 6])
		})
	})

	describe('min', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.min()).toBe(1)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const min = org.min(0)
			expect(min.sizes).toEqual([1, 3])
			expect(min.value).toEqual([1, 2, 3])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const min = org.min(1)
			expect(min.sizes).toEqual([2, 1])
			expect(min.value).toEqual([1, 2])
		})
	})

	test.todo('quantile')

	describe('argmax', () => {
		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmax = org.argmax(0)
			expect(argmax.sizes).toEqual([1, 3])
			expect(argmax.value).toEqual([1, 0, 1])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmax = org.argmax(1)
			expect(argmax.sizes).toEqual([2, 1])
			expect(argmax.value).toEqual([1, 2])
		})
	})

	describe('argmin', () => {
		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmin = org.argmin(0)
			expect(argmin.sizes).toEqual([1, 3])
			expect(argmin.value).toEqual([0, 1, 0])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const argmin = org.argmin(1)
			expect(argmin.sizes).toEqual([2, 1])
			expect(argmin.value).toEqual([0, 1])
		})
	})

	describe('sum', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.sum()).toBe(21)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const sum = org.sum(0)
			expect(sum.sizes).toEqual([1, 3])
			expect(sum.value).toEqual([5, 7, 9])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const sum = org.sum(1)
			expect(sum.sizes).toEqual([2, 1])
			expect(sum.value).toEqual([9, 12])
		})
	})

	describe('mean', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.mean()).toBe(3.5)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const mean = org.mean(0)
			expect(mean.sizes).toEqual([1, 3])
			expect(mean.value).toEqual([2.5, 3.5, 4.5])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const mean = org.mean(1)
			expect(mean.sizes).toEqual([2, 1])
			expect(mean.value).toEqual([3, 4])
		})
	})

	describe('prod', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.prod()).toBe(720)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.prod(0)
			expect(prod.sizes).toEqual([1, 3])
			expect(prod.value).toEqual([4, 10, 18])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.prod(1)
			expect(prod.sizes).toEqual([2, 1])
			expect(prod.value).toEqual([15, 48])
		})
	})

	test.todo('variance')

	test.todo('std')

	test.todo('median')

	test('diag', () => {
		const mat = Matrix.random(10, 10)
		const diag = mat.diag()
		for (let i = 0; i < diag.length; i++) {
			expect(diag[i]).toBe(mat.at(i, i))
		}
	})

	test('trace', () => {
		const mat = Matrix.random(10, 10)
		const trace = mat.trace()
		let s = 0
		for (let i = 0; i < 10; i++) {
			s += mat.at(i, i)
		}
		expect(trace).toBe(s)
	})

	test.todo('norm')

	describe('isSquare', () => {
		test.each([
			[0, 0],
			[1, 1],
			[10, 10],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			expect(mat.isSquare()).toBeTruthy()
		})

		test.each([
			[0, 1],
			[1, 0],
			[10, 9],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			expect(mat.isSquare()).toBeFalsy()
		})
	})

	test.todo('isDiag')

	test.todo('isTriangular')

	test.todo('isLowerTriangular')

	test.todo('isUpperTriangular')

	test.todo('isSymmetric')

	test('negative', () => {
		const mat = Matrix.randn(100, 10)
		const neg = mat.copy()
		neg.negative()
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				expect(neg.at(i, j)).toBe(-mat.at(i, j))
			}
		}
	})

	test('abs', () => {
		const mat = Matrix.randn(100, 10)
		const abs = mat.copy()
		abs.abs()
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				expect(abs.at(i, j)).toBe(Math.abs(mat.at(i, j)))
			}
		}
	})

	describe('add', () => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const add = mat.copy()
			add.add(1)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(add.at(i, j)).toBe(mat.at(i, j) + 1)
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(100, 10)

			const add = mat.copy()
			add.add(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(add.at(i, j)).toBe(mat.at(i, j) + other.at(i, j))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('small matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const add = mat.copy()
			add.add(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(add.at(i, j)).toBe(mat.at(i, j) + other.at(i % other.rows, j % other.cols))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('big matrix [%i  %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const other = Matrix.randn(100, 10)

			const add = mat.copy()
			add.add(other)
			expect(add.sizes).toEqual(other.sizes)
			for (let i = 0; i < other.rows; i++) {
				for (let j = 0; j < other.cols; j++) {
					expect(add.at(i, j)).toBe(mat.at(i % mat.rows, j % mat.cols) + other.at(i, j))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
			[2, 20],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat.add(other)).toThrowError('Addition size invalid.')
		})
	})

	test.todo('addAt')

	test.todo('copyAdd')

	describe('sub', () => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const sub = mat.copy()
			sub.sub(1)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(sub.at(i, j)).toBe(mat.at(i, j) - 1)
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(100, 10)

			const sub = mat.copy()
			sub.sub(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(sub.at(i, j)).toBe(mat.at(i, j) - other.at(i, j))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('small matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const sub = mat.copy()
			sub.sub(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(sub.at(i, j)).toBe(mat.at(i, j) - other.at(i % other.rows, j % other.cols))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('big matrix [%i  %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const other = Matrix.randn(100, 10)

			const sub = mat.copy()
			sub.sub(other)
			expect(sub.sizes).toEqual(other.sizes)
			for (let i = 0; i < other.rows; i++) {
				for (let j = 0; j < other.cols; j++) {
					expect(sub.at(i, j)).toBe(mat.at(i % mat.rows, j % mat.cols) - other.at(i, j))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
			[2, 20],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat.sub(other)).toThrowError('Subtract size invalid.')
		})
	})

	test.todo('isub')

	test.todo('subAt')

	test.todo('isubAt')

	test.todo('copySub')

	test.todo('copyIsub')

	describe('mult', () => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const mult = mat.copy()
			mult.mult(2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(mult.at(i, j)).toBe(mat.at(i, j) * 2)
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(100, 10)

			const mult = mat.copy()
			mult.mult(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(mult.at(i, j)).toBe(mat.at(i, j) * other.at(i, j))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('small matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const mult = mat.copy()
			mult.mult(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(mult.at(i, j)).toBe(mat.at(i, j) * other.at(i % other.rows, j % other.cols))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('big matrix [%i  %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const other = Matrix.randn(100, 10)

			const mult = mat.copy()
			mult.mult(other)
			expect(mult.sizes).toEqual(other.sizes)
			for (let i = 0; i < other.rows; i++) {
				for (let j = 0; j < other.cols; j++) {
					expect(mult.at(i, j)).toBe(mat.at(i % mat.rows, j % mat.cols) * other.at(i, j))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
			[2, 20],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat.mult(other)).toThrowError('Multiple size invalid.')
		})
	})

	test.todo('multAt')

	test.todo('copyMult')

	describe('div', () => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const div = mat.copy()
			div.div(2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(div.at(i, j)).toBe(mat.at(i, j) / 2)
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(100, 10)

			const div = mat.copy()
			div.div(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(div.at(i, j)).toBe(mat.at(i, j) / other.at(i, j))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('small matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const div = mat.copy()
			div.div(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(div.at(i, j)).toBe(mat.at(i, j) / other.at(i % other.rows, j % other.cols))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('big matrix [%i  %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const other = Matrix.randn(100, 10)

			const div = mat.copy()
			div.div(other)
			expect(div.sizes).toEqual(other.sizes)
			for (let i = 0; i < other.rows; i++) {
				for (let j = 0; j < other.cols; j++) {
					expect(div.at(i, j)).toBe(mat.at(i % mat.rows, j % mat.cols) / other.at(i, j))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
			[2, 20],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat.div(other)).toThrowError('Divide size invalid.')
		})
	})

	describe('idiv', () => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const idiv = mat.copy()
			idiv.idiv(2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(idiv.at(i, j)).toBe(2 / mat.at(i, j))
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(100, 10)

			const idiv = mat.copy()
			idiv.idiv(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(idiv.at(i, j)).toBe(other.at(i, j) / mat.at(i, j))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('small matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const idiv = mat.copy()
			idiv.idiv(other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(idiv.at(i, j)).toBe(other.at(i % other.rows, j % other.cols) / mat.at(i, j))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[2, 2],
		])('big matrix [%i  %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const other = Matrix.randn(100, 10)

			const idiv = mat.copy()
			idiv.idiv(other)
			expect(idiv.sizes).toEqual(other.sizes)
			for (let i = 0; i < other.rows; i++) {
				for (let j = 0; j < other.cols; j++) {
					expect(idiv.at(i, j)).toBe(other.at(i, j) / mat.at(i % mat.rows, j % mat.cols))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
			[2, 20],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat.idiv(other)).toThrowError('Divide size invalid.')
		})
	})

	test.todo('divAt')

	test.todo('idivAt')

	test.todo('copyDiv')

	test.todo('copyIdiv')

	test.todo('dot')

	test.todo('tDot')

	test.todo('convolute')

	test.todo('reducedRowEchelonForm')

	test.todo('rank')

	describe('det', () => {
		test('0', () => {
			const mat = new Matrix(0, 0)
			expect(mat.det()).toBe(0)
		})

		test('1', () => {
			const mat = Matrix.randn(1, 1)
			expect(mat.det()).toBe(mat.value[0])
		})

		test.each([2, 3, 4, 5])('%i', n => {
			const mat = Matrix.randn(n, n)
			const idx = []
			for (let i = 0; i < n; i++) {
				idx[i] = i
			}
			let det = 0
			let sign = 1
			let endflg = false
			do {
				let deti = 1
				for (let i = 0; i < n; i++) {
					deti *= mat.at(i, idx[i])
				}
				det += sign * deti

				endflg = true
				for (let i = n - 2; i >= 0; i--) {
					if (idx[i] < idx[i + 1]) {
						endflg = false
						let j = n - 1
						for (; j > i; j--) {
							if (idx[j] > idx[i]) {
								break
							}
						}
						;[idx[i], idx[j]] = [idx[j], idx[i]]
						sign *= -1
						for (let k = i + 1, l = n - 1; k < l; k++, l--) {
							;[idx[k], idx[l]] = [idx[l], idx[k]]
							sign *= -1
						}
						break
					}
				}
			} while (!endflg)
			expect(mat.det()).toBeCloseTo(det)
		})

		test.todo('fail')
	})

	describe('inv', () => {
		test.each([0, 1, 2, 3, 10])('symmetric sizes[%i]', n => {
			const mat = Matrix.randn(n, n).gram()
			const inv = mat.inv()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j) {
						expect(eye.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eye.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test.todo('triangular')

		test.todo('fail')
	})

	test.todo('invLowerTriangular')

	test.todo('invUpperTriangular')

	test.todo('invRowReduction')

	test.todo('invLU')

	describe('sqrt', () => {
		test('empty', () => {
			const mat = Matrix.randn(0, 0)
			const sqrt = mat.sqrt()
			expect(sqrt).toBe(mat)
		})

		test.each([1, 2, 3])('size %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const sqrt = mat.sqrt()

			const sqrt2 = sqrt.dot(sqrt)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(sqrt2.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test.todo('fail')
	})

	describe('power', () => {
		test('0', () => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j) {
						expect(pow.at(i, j)).toBeCloseTo(1)
					} else {
						expect(pow.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test('0.5', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const pow = mat.power(0.5)

			const pow2 = pow.dot(pow)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow2.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test('1', () => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(1)
			expect(pow).not.toBe(mat)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test.each([2, 3, 4, 10])('%i(non symmetric)', p => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(p)

			let matp = mat
			for (let i = 1; i < p; i++) {
				matp = matp.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow.at(i, j)).toBeCloseTo(matp.at(i, j))
				}
			}
		})

		test.each([2, 3, 4, 10])('%i(symmetric)', p => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const pow = mat.power(p)

			let matp = mat
			for (let i = 1; i < p; i++) {
				matp = matp.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					let value = pow.at(i, j)
					const scale = 10 ** Math.floor(Math.log10(Math.abs(value)))
					expect(pow.at(i, j) / scale).toBeCloseTo(matp.at(i, j) / scale, 1)
				}
			}
		})

		test('-1', () => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(-1)

			const eye = mat.dot(pow)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j) {
						expect(eye.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eye.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test.each([-2, -3, -4])('%i(non symmetric)', p => {
			const n = 10
			const mat = Matrix.random(n, n, -1, 1)
			const pow = mat.power(p)

			let eye = pow
			for (let i = 0; i < -p; i++) {
				eye = eye.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j) {
						expect(eye.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eye.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test.each([-2, -3])('%i(symmetric)', p => {
			const n = 3
			const mat = Matrix.random(n, n, -0.5, 0.5).gram()
			const pow = mat.power(p)

			let eye = pow
			for (let i = 0; i < -p; i++) {
				eye = eye.dot(mat)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j) {
						expect(eye.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eye.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test('-0.5', () => {
			const n = 3
			const mat = Matrix.randn(n, n).gram()
			const pow = mat.power(-0.5)

			const pow2 = pow.dot(pow)
			const eye = pow2.dot(mat)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j) {
						expect(eye.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eye.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test.each([0, 0.1, 0.5, 1, 2, 3, 3.4, -0.1, -1, -2, -5])('%f(diag)', p => {
			const diag = [1, 2, 3, 4, 5]
			const mat = Matrix.diag(diag)
			const pow = mat.power(p)

			for (let i = 0; i < diag.length; i++) {
				expect(pow.at(i, i)).toBeCloseTo(Math.pow(diag[i], p))
			}
		})

		test.todo('fail')
	})

	describe('solve', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			const b = Matrix.randn(n, 1)

			const a = x.solve(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.each([0, 1, 5])('excessive columns (%i)', n => {
			const x = Matrix.randn(n, n + 1 + Math.floor(Math.random() * 10))
			const b = Matrix.randn(n, 1 + Math.floor(Math.random() * 10))

			const a = x.solve(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.todo('fail')
	})

	test.todo('solveLowerTriangular')

	test.todo('solveUpperTriangular')

	test.todo('cov')

	test('gram', () => {
		const mat = Matrix.randn(10, 5)
		const gram = mat.gram()

		expect(gram.sizes).toEqual([5, 5])
		const dot = mat.tDot(mat)
		for (let i = 0; i < 5; i++) {
			for (let j = 0; j < 5; j++) {
				expect(gram.at(i, j)).toBeCloseTo(dot.at(i, j))
			}
		}
	})

	test.todo('bidiag')

	describe('tridiag', () => {
		test('symmetric', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const tridiag = mat.tridiag()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (Math.abs(i - j) > 1) {
						expect(tridiag.at(i, j)).toBeCloseTo(0)
					}
				}
			}

			const orgeig = mat.eigenJacobi()[0]
			const trieig = tridiag.eigenJacobi()[0]
			for (let i = 0; i < n; i++) {
				expect(trieig[i]).toBeCloseTo(orgeig[i])
			}
		})

		test.todo('fail')
	})

	describe('lu', () => {
		test.each([0, 1, 2, 3, 5])('success %i', n => {
			const mat = Matrix.randn(n, n)
			const [l, u] = mat.lu()

			const res = l.dot(u)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i > j) {
						expect(u.at(i, j)).toBeCloseTo(0)
					} else if (i < j) {
						expect(l.at(i, j)).toBeCloseTo(0)
					} else {
						expect(l.at(i, j)).toBeCloseTo(1)
					}
				}
			}
		})

		test.todo('fail')
	})

	describe('qr', () => {
		test.each([
			[0, 0],
			[1, 10],
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qr()
			expect(q.sizes).toEqual([rows, rows])
			expect(r.sizes).toEqual([rows, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i > j && i < cols) {
						expect(r.at(i, j)).toBeCloseTo(0)
					}
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < rows; j++) {
					if (i === j) {
						expect(eye.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eye.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test.todo('fail')
	})

	test.todo('qrGramSchmidt')

	test.todo('qrHouseholder')

	describe('svd', () => {
		test.each([
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [u, d, v] = mat.svd()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const res = u.dot(Matrix.diag(d)).dot(v.t)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}

			const eyeu = u.tDot(u)
			const eyev = v.tDot(v)
			for (let i = 0; i < minsize; i++) {
				for (let j = 0; j < minsize; j++) {
					if (i === j) {
						expect(eyeu.at(i, j)).toBeCloseTo(1)
						expect(eyev.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eyeu.at(i, j)).toBeCloseTo(0)
						expect(eyev.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test.todo('fail')
	})

	test.todo('svdEigen')

	test.todo('svdGolubKahan')

	describe('cholesky', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const chol = mat.cholesky()

			const res = chol.dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					if (i < j) {
						expect(chol.at(i, j)).toBeCloseTo(0, 1)
					}
				}
			}
		})

		test.todo('fail')
	})

	test.todo('choleskyBanachiewicz')

	test.todo('choleskyLDL')

	describe('eigen', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalues, eigvectors] = mat.eigen()

			for (let i = 0; i < eigvalues.length; i++) {
				if (i > 0) {
					expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvectors.col(i))
				const y = eigvectors.col(i).copyMult(eigvalues[i])
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j) {
						expect(eye.at(i, j)).toBeCloseTo(1)
					} else {
						expect(eye.at(i, j)).toBeCloseTo(0)
					}
				}
			}
		})

		test.todo('non symmetric')

		test.todo('fail')
	})

	test.todo('eigenValues')

	test.todo('eigenVectors')

	test.todo('eigenValuesLR')

	test.todo('eigenValuesQR')

	test.todo('eigenJacobi')

	test.todo('eigenPowerIteration')

	test.todo('eigenInverseIteration')
})

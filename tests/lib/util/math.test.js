import { Matrix } from '../../../lib/util/math.js'

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
						expect(vari[j][k]).toBeCloseTo(1, 1)
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
				expect(mean[j]).toBeCloseTo(5, 2)
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

	test.todo('flip')

	test.todo('swap')

	test.todo('sort')

	test.todo('shuffle')

	test.todo('resize')

	test.todo('reshape')

	test.todo('repeat')

	test.todo('copyRepeat')

	test.todo('concat')

	test.todo('reduce')

	test.todo('max')

	test.todo('min')

	test.todo('quantile')

	test.todo('argmax')

	test.todo('argmin')

	test.todo('sum')

	test.todo('mean')

	test.todo('prod')

	test.todo('variance')

	test.todo('std')

	test.todo('median')

	test.todo('diag')

	test.todo('trace')

	test.todo('norm')

	test.todo('isSquare')

	test.todo('isDiag')

	test.todo('isTriangular')

	test.todo('isLowerTriangular')

	test.todo('isUpperTriangular')

	test.todo('isSymmetric')

	test.todo('negative')

	test.todo('abs')

	test.todo('add')

	test.todo('addAt')

	test.todo('copyAdd')

	test.todo('sub')

	test.todo('isub')

	test.todo('subAt')

	test.todo('isubAt')

	test.todo('copySub')

	test.todo('copyIsub')

	test.todo('mult')

	test.todo('multAt')

	test.todo('copyMult')

	test.todo('div')

	test.todo('idiv')

	test.todo('divAt')

	test.todo('idivAt')

	test.todo('copyDiv')

	test.todo('copyIdiv')

	test.todo('dot')

	test.todo('tDot')

	test.todo('convolute')

	test.todo('reducedRowEchelonForm')

	test.todo('rank')

	test.todo('det')

	test.todo('inv')

	test.todo('invLowerTriangular')

	test.todo('invUpperTriangular')

	test.todo('invRowReduction')

	test.todo('invLU')

	test.todo('sqrt')

	test.todo('power')

	test.todo('solve')

	test.todo('solveLowerTriangular')

	test.todo('solveUpperTriangular')

	test.todo('cov')

	test.todo('gram')

	test.todo('bidiag')

	test.todo('tridiag')

	test.todo('lu')

	test.todo('qr')

	test.todo('qrGramSchmidt')

	test.todo('qrHouseholder')

	test.todo('svd')

	test.todo('svdEigen')

	test.todo('svdGolubKahan')

	test.todo('cholesky')

	test.todo('choleskyBanachiewicz')

	test.todo('choleskyLDL')

	test.todo('eigen')

	test.todo('eigenValues')

	test.todo('eigenVectors')

	test.todo('eigenValuesLR')

	test.todo('eigenValuesQR')

	test.todo('eigenJacobi')

	test.todo('eigenPowerIteration')

	test.todo('eigenInverseIteration')
})

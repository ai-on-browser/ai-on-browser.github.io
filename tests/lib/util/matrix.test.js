import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import Tensor from '../../../lib/util/tensor.js'

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

		test('array size', () => {
			const mat = new Matrix([2, 3])
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

		test('array size with scalar init', () => {
			const mat = new Matrix([2, 3], 2)
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

	describe('zeros', () => {
		test('scalars', () => {
			const mat = Matrix.zeros(2, 3)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
		})

		test('array', () => {
			const mat = Matrix.zeros([2, 3])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
		})
	})

	describe('ones', () => {
		test('scalars', () => {
			const mat = Matrix.ones(2, 3)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(1)
				}
			}
		})

		test('array', () => {
			const mat = Matrix.ones([2, 3])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i, j)).toBe(1)
				}
			}
		})
	})

	describe('eye', () => {
		test('default', () => {
			const mat = Matrix.eye(100, 10)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBe(i === j ? 1 : 0)
				}
			}
		})

		test('array size', () => {
			const mat = Matrix.eye([100, 10])
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBe(i === j ? 1 : 0)
				}
			}
		})

		test('scaler', () => {
			const mat = Matrix.eye(100, 10, 3)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBe(i === j ? 3 : 0)
				}
			}
		})

		test('array size with scaler init', () => {
			const mat = Matrix.eye([100, 10], 3)
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBe(i === j ? 3 : 0)
				}
			}
		})
	})

	describe('random', () => {
		test('default', () => {
			const mat = Matrix.random(100, 10)
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(0)
					expect(mat.at(i, j)).toBeLessThan(1)
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBeCloseTo(1, 1)
			expect(min).toBeCloseTo(0, 1)
		})

		test('array size', () => {
			const mat = Matrix.random([100, 10])
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(0)
					expect(mat.at(i, j)).toBeLessThan(1)
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBeCloseTo(1, 1)
			expect(min).toBeCloseTo(0, 1)
		})

		test('min max', () => {
			const mat = Matrix.random(100, 10, -1, 2)
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(-1)
					expect(mat.at(i, j)).toBeLessThan(2)
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBeCloseTo(2, 1)
			expect(min).toBeCloseTo(-1, 1)
		})

		test('array size with min max', () => {
			const mat = Matrix.random([100, 10], -1, 2)
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(-1)
					expect(mat.at(i, j)).toBeLessThan(2)
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBeCloseTo(2, 1)
			expect(min).toBeCloseTo(-1, 1)
		})
	})

	describe('randint', () => {
		test('default', () => {
			const mat = Matrix.randint(100, 10)
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(0)
					expect(mat.at(i, j)).toBeLessThanOrEqual(1)
					expect(Number.isInteger(mat.at(i, j))).toBeTruthy()
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBe(1)
			expect(min).toBe(0)
		})

		test('array size', () => {
			const mat = Matrix.randint([100, 10])
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(0)
					expect(mat.at(i, j)).toBeLessThanOrEqual(1)
					expect(Number.isInteger(mat.at(i, j))).toBeTruthy()
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBe(1)
			expect(min).toBe(0)
		})

		test('min max', () => {
			const mat = Matrix.randint(100, 10, -1, 2)
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(-1)
					expect(mat.at(i, j)).toBeLessThanOrEqual(2)
					expect(Number.isInteger(mat.at(i, j))).toBeTruthy()
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBe(2)
			expect(min).toBe(-1)
		})

		test('array size with min max', () => {
			const mat = Matrix.randint([100, 10], -1, 2)
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < 100; i++) {
				for (let j = 0; j < 10; j++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(-1)
					expect(mat.at(i, j)).toBeLessThanOrEqual(2)
					expect(Number.isInteger(mat.at(i, j))).toBeTruthy()
					max = Math.max(max, mat.at(i, j))
					min = Math.min(min, mat.at(i, j))
				}
			}
			expect(max).toBe(2)
			expect(min).toBe(-1)
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

		test.each([10, 9])('default', n => {
			const mat = Matrix.randn(10001, n)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < n; j++) {
				expect(mean[j]).toBeCloseTo(0, 1)
				expect(vari[j][j]).toBeCloseTo(1, 0.9)
				for (let k = 0; k < n; k++) {
					if (j === k) {
						continue
					}
					expect(vari[j][k]).toBeCloseTo(0, 1)
				}
			}
		})

		test('array size', () => {
			const mat = Matrix.randn([10001, 10])
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 10; j++) {
				expect(mean[j]).toBeCloseTo(0, 1)
				expect(vari[j][j]).toBeCloseTo(1, 0.9)
				for (let k = 0; k < 10; k++) {
					if (j === k) {
						continue
					}
					expect(vari[j][k]).toBeCloseTo(0, 1)
				}
			}
		})

		test('scaler', () => {
			const mat = Matrix.randn(100000, 3, -10, 0.1)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 3; j++) {
				expect(mean[j]).toBeCloseTo(-10, 2)
				for (let k = 0; k < 3; k++) {
					expect(vari[j][k]).toBeCloseTo(j === k ? 0.1 : 0, 2)
				}
			}
		})

		test('array size with scaler', () => {
			const mat = Matrix.randn([100000, 3], -10, 0.1)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 3; j++) {
				expect(mean[j]).toBeCloseTo(-10, 2)
				for (let k = 0; k < 3; k++) {
					expect(vari[j][k]).toBeCloseTo(j === k ? 0.1 : 0, 2)
				}
			}
		})

		test('array mean', () => {
			const mat = Matrix.randn(100001, 3, [3, 6, 9], 2)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 3; j++) {
				expect(mean[j]).toBeCloseTo(j * 3 + 3, 1)
				for (let k = 0; k < 3; k++) {
					expect(vari[j][k]).toBeCloseTo(j === k ? 2 : 0, 1)
				}
			}
		})

		test('matrix mean', () => {
			const mat = Matrix.randn(100000, 2, Matrix.fromArray([3, 5]), 1.5)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 2; j++) {
				expect(mean[j]).toBeCloseTo(j * 2 + 3, 1)
				for (let k = 0; k < 2; k++) {
					expect(vari[j][k]).toBeCloseTo(j === k ? 1.5 : 0, 1)
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

		test('matrix vari', () => {
			const cov = Matrix.fromArray([
				[0.3, 0.1],
				[0.1, 0.5],
			])
			const mat = Matrix.randn(100000, 2, 5, cov)
			const [mean, vari] = calcMV(mat)
			for (let j = 0; j < 2; j++) {
				expect(mean[j]).toBeCloseTo(5, 1)
				for (let k = 0; k < 2; k++) {
					expect(vari[j][k]).toBeCloseTo(cov.at(j, k), 1)
				}
			}
		})

		test.each([[3, 5, 7], Matrix.randn(2, 2)])('fail invalid mean %p', m => {
			expect(() => Matrix.randn(100000, 2, m, 1)).toThrow("'myu' cols must be same as 'cols' and rows must be 1.")
		})

		test.each([
			[
				[1, 2],
				[3, 4],
				[5, 6],
			],
			Matrix.randn(2, 3),
		])('fail invalid mean %p', s => {
			expect(() => Matrix.randn(100000, 2, 0, s)).toThrow("'sigma' cols and rows must be same as 'cols'.")
		})
	})

	describe('diag', () => {
		test('scalar', () => {
			const mat = Matrix.diag([1, 2, 3, 4])
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					expect(mat.at(i, j)).toBe(i === j ? i + 1 : 0)
				}
			}
		})

		test('matrix', () => {
			const d = Matrix.randn(2, 3)
			const mat = Matrix.diag([1, d, 3, 4])
			expect(mat.sizes).toEqual([5, 6])
			expect(mat.at(0, 0)).toEqual(1)
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					expect(mat.at(i + 1, j + 1)).toBe(d.at(i, j))
				}
			}
			expect(mat.at(3, 4)).toEqual(3)
			expect(mat.at(4, 5)).toEqual(4)
		})
	})

	describe('fromArray', () => {
		test('matrix', () => {
			const org = Matrix.randn(10, 5)
			const mat = Matrix.fromArray(org)
			expect(mat).toBe(org)
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
		const org = Matrix.randn(2, 3)
		const mat = org.t
		expect(mat.sizes).toEqual([3, 2])
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(j, i)).toBe(org.at(i, j))
			}
		}
	})

	test('iterate', () => {
		const mat = Matrix.randn(10, 3)
		let i = 0
		for (const v of mat) {
			expect(v).toBe(mat.value[i++])
		}
	})

	test('toArray', () => {
		const mat = Matrix.randn(2, 3)
		const array = mat.toArray()
		expect(array).toBeInstanceOf(Array)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(array[i][j]).toBe(mat.at(i, j))
			}
		}
	})

	describe('toScaler', () => {
		test('success', () => {
			const mat = Matrix.randn(1, 1)
			const value = mat.toScaler()
			expect(value).toBe(mat.at(0, 0))
		})

		test.each([
			[1, 2],
			[2, 1],
			[0, 1],
			[1, 0],
			[2, 2],
		])('fail[%i, %i]', (r, c) => {
			const mat = new Matrix(r, c)
			expect(() => mat.toScaler()).toThrow('The matrix cannot convert to scaler.')
		})
	})

	test('toString', () => {
		const mat = new Matrix(2, 3, [
			[1, 2, 3],
			[4, 5, 6],
		])
		const str = mat.toString()
		expect(str).toEqual('[[1, 2, 3],\n [4, 5, 6]]')
	})

	describe('copy', () => {
		test('default', () => {
			const org = Matrix.randn(2, 3)
			const mat = org.copy()
			expect(mat._value).not.toBe(org._value)
			expect(mat._value).toEqual(org._value)
		})

		test('copy self dst', () => {
			const org = Matrix.randn(2, 3)
			const mat = org.copy(org)
			expect(mat).toBe(org)
		})

		test('dst', () => {
			const org = Matrix.randn(2, 3)
			const cp = new Matrix(0, 0)
			const mat = org.copy(cp)
			expect(mat).toBe(cp)
			expect(mat._value).not.toBe(org._value)
			expect(mat._value).toEqual(org._value)
		})
	})

	describe('equals', () => {
		test('same', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const mat1 = new Matrix(2, 3, data)
			const mat2 = new Matrix(2, 3, data)
			expect(mat1.equals(mat2)).toBeTruthy()
		})

		test('not same size', () => {
			const mat1 = Matrix.randn(2, 3)
			const mat2 = Matrix.randn(3, 2)
			expect(mat1.equals(mat2)).toBeFalsy()
		})

		test('not same value', () => {
			const mat1 = Matrix.randn(2, 3)
			const mat2 = Matrix.randn(2, 3)
			expect(mat1.equals(mat2)).toBeFalsy()
		})

		test('not matrix', () => {
			const mat = Matrix.randn(2, 3)
			expect(mat.equals(1)).toBeFalsy()
		})

		test.todo('tol')
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
					expect(mat.at([i, j])).toBe(data[i][j])
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
			expect(() => mat.at(i, j)).toThrow('Index out of bounds.')
			expect(() => mat.at([i, j])).toThrow('Index out of bounds.')
		})
	})

	describe('set', () => {
		test('scaler', () => {
			const mat = new Matrix(2, 3)
			mat.set(1, 2, 1.5)
			expect(mat.at(1, 2)).toBe(1.5)
		})

		test('scaler array', () => {
			const mat = new Matrix(2, 3)
			mat.set([1, 2], 1.5)
			expect(mat.at(1, 2)).toBe(1.5)
		})

		test.each([
			[-1, 0],
			[2, 0],
			[0, -1],
			[0, 3],
		])('fail scaler[%i, %i]', (i, j) => {
			const mat = new Matrix(2, 3)
			expect(() => mat.set(i, j, 0)).toThrow('Index out of bounds.')
			expect(() => mat.set([i, j], 0)).toThrow('Index out of bounds.')
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

		test('matrix array', () => {
			const mat = new Matrix(3, 4)
			const data = [
				[1, 2],
				[3, 4],
			]
			const smat = new Matrix(2, 2, data)
			mat.set([1, 2], smat)
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
			expect(() => mat.set(i, j, smat)).toThrow('Index out of bounds.')
			expect(() => mat.set([i, j], smat)).toThrow('Index out of bounds.')
		})
	})

	describe('row', () => {
		test.each([0, 1])('scaler[%i]', r => {
			const org = Matrix.randn(2, 3)
			const mat = org.row(r)
			expect(mat.sizes).toEqual([1, 3])
			for (let j = 0; j < 3; j++) {
				expect(mat.at(0, j)).toBe(org.at(r, j))
			}
		})

		test.each([-1, 2])('fail scaler[%i]', i => {
			const mat = new Matrix(2, 3)
			expect(() => mat.row(i)).toThrow('Index out of bounds.')
		})

		test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array %p', r => {
			const org = Matrix.randn(3, 5)
			const mat = org.row(r)
			expect(mat.sizes).toEqual([2, 5])
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 5; j++) {
					expect(mat.at(i, j)).toBe(org.at(r[i], j))
				}
			}
		})

		test.each([[[-1, 0]], [[0, 3]]])('fail array %p', r => {
			const mat = Matrix.randn(3, 5)
			expect(() => mat.row(r)).toThrow('Index out of bounds.')
		})

		test.each([[[false, true, false]], [[true, false, true]]])('boolean %p', r => {
			const org = Matrix.randn(3, 5)
			const mat = org.row(r)
			let p = 0
			for (let i = 0; i < 3; i++) {
				if (!r[i]) {
					continue
				}
				for (let j = 0; j < 5; j++) {
					expect(mat.at(p, j)).toBe(org.at(i, j))
				}
				p++
			}
			expect(mat.sizes).toEqual([p, 5])
		})

		test.each([[[false]], [[true, false]]])('fail boolean %p', r => {
			const mat = Matrix.randn(3, 5)
			expect(() => mat.row(r)).toThrow('Length is invalid.')
		})
	})

	describe('col', () => {
		test.each([0, 1, 2])('scaler[%i]', c => {
			const org = Matrix.randn(2, 3)
			const mat = org.col(c)
			expect(mat.sizes).toEqual([2, 1])
			for (let i = 0; i < 2; i++) {
				expect(mat.at(i, 0)).toBe(org.at(i, c))
			}
		})

		test.each([-1, 3])('fail scaler[%i]', i => {
			const mat = new Matrix(2, 3)
			expect(() => mat.col(i)).toThrow('Index out of bounds.')
		})

		test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array %p', c => {
			const org = Matrix.randn(5, 3)
			const mat = org.col(c)
			expect(mat.sizes).toEqual([5, 2])
			for (let i = 0; i < 5; i++) {
				for (let j = 0; j < 2; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, c[j]))
				}
			}
		})

		test.each([[[-1, 0]], [[0, 3]]])('fail array %p', c => {
			const mat = Matrix.randn(5, 3)
			expect(() => mat.col(c)).toThrow('Index out of bounds.')
		})

		test.each([[[false, true, false]], [[true, false, true]]])('boolean %p', c => {
			const org = Matrix.randn(5, 3)
			const mat = org.col(c)
			let p = 0
			for (let j = 0; j < 3; j++) {
				if (!c[j]) {
					continue
				}
				for (let i = 0; i < 5; i++) {
					expect(mat.at(i, p)).toBe(org.at(i, j))
				}
				p++
			}
			expect(mat.sizes).toEqual([5, p])
		})

		test.each([[[false]], [[true, false]]])('fail boolean %p', c => {
			const mat = Matrix.randn(5, 3)
			expect(() => mat.col(c)).toThrow('Length is invalid.')
		})
	})

	describe('slice', () => {
		describe.each([undefined, 0])('row(%p)', axis => {
			test.each([
				[1, 3],
				[0, 5],
				[8, 10],
			])('%p', (f, t) => {
				const mat = Matrix.randn(10, 3)
				const slice = mat.slice(f, t, axis)
				expect(slice.sizes).toEqual([t - f, 3])
				for (let i = 0; i < t - f; i++) {
					for (let j = 0; j < 3; j++) {
						expect(slice.at(i, j)).toBe(mat.at(i + f, j))
					}
				}
			})

			test.each([
				[null, null],
				[3, null],
				[null, 5],
			])('with null %p', (f, t) => {
				const mat = Matrix.randn(10, 3)
				const slice = mat.slice(f, t, axis)

				if (typeof f !== 'number') f = 0
				if (typeof t !== 'number') t = mat.rows

				expect(slice.sizes).toEqual([t - f, 3])
				for (let i = 0; i < t - f; i++) {
					for (let j = 0; j < 3; j++) {
						expect(slice.at(i, j)).toBe(mat.at(i + f, j))
					}
				}
			})
		})

		test.each([
			[1, 3],
			[0, 5],
			[8, 10],
		])('col %p', (f, t) => {
			const mat = Matrix.randn(3, 10)
			const slice = mat.slice(f, t, 1)
			expect(slice.sizes).toEqual([3, t - f])
			for (let j = 0; j < t - f; j++) {
				for (let i = 0; i < 3; i++) {
					expect(slice.at(i, j)).toBe(mat.at(i, j + f))
				}
			}
		})

		test.each([
			[null, null],
			[3, null],
			[null, 5],
		])('col with null %p', (f, t) => {
			const mat = Matrix.randn(3, 10)
			const slice = mat.slice(f, t, 1)

			if (typeof f !== 'number') f = 0
			if (typeof t !== 'number') t = mat.cols

			expect(slice.sizes).toEqual([3, t - f])
			for (let j = 0; j < t - f; j++) {
				for (let i = 0; i < 3; i++) {
					expect(slice.at(i, j)).toBe(mat.at(i, j + f))
				}
			}
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.slice(0, 3, axis)).toThrow('Invalid axis.')
		})

		test.each([
			[-1, 1],
			[0, 6],
		])('fail out of bounds', (f, t) => {
			const mat = new Matrix(5, 10)
			expect(() => mat.slice(f, t, 0)).toThrow('Index out of bounds.')
		})

		test('fail invalid relation', () => {
			const mat = new Matrix(5, 10)
			expect(() => mat.slice(1, 0, 0)).toThrow("'to' must be greater than or equals to 'from'.")
		})
	})

	describe('block', () => {
		test.each([
			[0, 0, 2, 2],
			[0, 1, 2, 3],
			[4, 5, 7, 9],
		])('%p', (rf, cf, rt, ct) => {
			const mat = Matrix.randn(8, 10)
			const block = mat.block(rf, cf, rt, ct)

			expect(block.sizes).toEqual([rt - rf, ct - cf])
			for (let i = 0; i < rt - rf; i++) {
				for (let j = 0; j < ct - cf; j++) {
					expect(block.at(i, j)).toBe(mat.at(i + rf, j + cf))
				}
			}
		})

		test.each([
			[null, null, null, null],
			[null, null, 4, 5],
			[3, 2, null, null],
		])('with null %p', (rf, cf, rt, ct) => {
			const mat = Matrix.randn(8, 10)
			const block = mat.block(rf, cf, rt, ct)

			if (typeof rf !== 'number') rf = 0
			if (typeof cf !== 'number') cf = 0
			if (typeof rt !== 'number') rt = mat.rows
			if (typeof ct !== 'number') ct = mat.cols

			expect(block.sizes).toEqual([rt - rf, ct - cf])
			for (let i = 0; i < rt - rf; i++) {
				for (let j = 0; j < ct - cf; j++) {
					expect(block.at(i, j)).toBe(mat.at(i + rf, j + cf))
				}
			}
		})

		test.each([
			[-1, 1, 0, 1],
			[0, 9, 0, 1],
			[0, 1, -1, 1],
			[0, 1, 0, 11],
		])('fail out of bounds', (rf, rt, cf, ct) => {
			const mat = new Matrix(8, 10)
			expect(() => mat.block(rf, cf, rt, ct)).toThrow('Index out of bounds.')
		})

		test('fail invalid rows', () => {
			const mat = new Matrix(8, 10)
			expect(() => mat.block(1, 0, 0, 1)).toThrow("'rows_to' must be greater than or equals to 'rows_from'.")
		})

		test('fail invalid cols', () => {
			const mat = new Matrix(8, 10)
			expect(() => mat.block(0, 1, 1, 0)).toThrow("'cols_to' must be greater than or equals to 'cols_from'.")
		})
	})

	describe('remove', () => {
		describe.each([undefined, 0])('row(%p)', axis => {
			test.each([0, 1, 2])('scaler[%i]', r => {
				const data = [
					[1, 2, 3],
					[4, 5, 6],
					[7, 8, 9],
				]
				const mat = new Matrix(3, 3, data)
				mat.remove(r, axis)
				expect(mat.sizes).toEqual([2, 3])
				for (let k = 0, i = 0; k < 3; k++) {
					if (k === r) {
						continue
					}
					for (let j = 0; j < 3; j++) {
						expect(mat.at(i, j)).toBe(data[k][j])
					}
					i++
				}
			})

			test.each([-1, 2])('fail scaler[%i]', i => {
				const mat = new Matrix(2, 3)
				expect(() => mat.remove(i, axis)).toThrow('Index out of bounds.')
			})

			test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array[%p]', r => {
				const mat = Matrix.randn(4, 5)
				const data = mat.toArray()
				mat.remove(r, axis)
				expect(mat.sizes).toEqual([2, 5])
				for (let k = 0, i = 0; k < 4; k++) {
					if (r.includes(k)) {
						continue
					}
					for (let j = 0; j < 5; j++) {
						expect(mat.at(i, j)).toBe(data[k][j])
					}
					i++
				}
			})

			test.each([[[-1, 0]], [[0, 3]]])('fail array[%p]', r => {
				const mat = Matrix.randn(3, 5)
				expect(() => mat.remove(r, axis)).toThrow('Index out of bounds.')
			})
		})

		describe('col', () => {
			test.each([0, 1, 2])('scaler[%i]', c => {
				const data = [
					[1, 2, 3],
					[4, 5, 6],
					[7, 8, 9],
				]
				const mat = new Matrix(3, 3, data)
				mat.remove(c, 1)
				expect(mat.sizes).toEqual([3, 2])
				for (let i = 0; i < 3; i++) {
					for (let k = 0, j = 0; k < 3; k++) {
						if (k === c) {
							continue
						}
						expect(mat.at(i, j)).toBe(data[i][k])
						j++
					}
				}
			})

			test.each([-1, 3])('fail scaler[%i]', i => {
				const mat = new Matrix(2, 3)
				expect(() => mat.remove(i, 1)).toThrow('Index out of bounds.')
			})

			test.each([[[0, 1]], [[1, 2]], [[0, 2]]])('array[%p]', c => {
				const mat = Matrix.randn(4, 5)
				const data = mat.toArray()
				mat.remove(c, 1)
				expect(mat.sizes).toEqual([4, 3])
				for (let i = 0; i < 4; i++) {
					for (let k = 0, j = 0; k < 5; k++) {
						if (c.includes(k)) {
							continue
						}
						expect(mat.at(i, j)).toBe(data[i][k])
						j++
					}
				}
			})

			test.each([[[-1, 0]], [[0, 3]]])('fail array[%p]', r => {
				const mat = Matrix.randn(5, 3)
				expect(() => mat.remove(r, 1)).toThrow('Index out of bounds.')
			})
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.remove(0, axis)).toThrow('Invalid axis.')
		})
	})

	describe('removeIf', () => {
		test.each([undefined, 0])('row(%p)', axis => {
			const org = Matrix.randn(100, 3)
			const mat = org.copy()
			mat.removeIf(r => r.some(v => v < 0), axis)

			for (let i = 0, r = 0; i < org.rows; i++) {
				if (org.row(i).some(v => v < 0)) {
					continue
				}
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(r, j)).toBe(org.at(i, j))
				}
				r++
			}
		})

		test('col', () => {
			const org = Matrix.randn(3, 100)
			const mat = org.copy()
			mat.removeIf(r => r.some(v => v < 0), 1)

			for (let j = 0, c = 0; j < org.cols; j++) {
				if (org.col(j).some(v => v < 0)) {
					continue
				}
				for (let i = 0; i < org.rows; i++) {
					expect(mat.at(i, c)).toBe(org.at(i, j))
				}
				c++
			}
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.removeIf(() => false, axis)).toThrow('Invalid axis.')
		})
	})

	describe('sample', () => {
		test.each([undefined, 0])('row(%p) index', axis => {
			const n = 3
			const org = Matrix.randn(10, 5)
			const [mat, idx] = org.sample(n, axis)
			expect(idx).toHaveLength(n)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let i = 0; i < org.rows; i++) {
					let flg = true
					for (let j = 0; j < org.cols; j++) {
						flg &= mat.at(k, j) === org.at(i, j)
					}
					if (flg) {
						expidx.push(i)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			expect(expidx).toEqual(idx)
		})

		test.each([undefined, 0])('row(%p) duplicate index', axis => {
			const n = 6
			const org = Matrix.randn(3, 5)
			const [mat, idx] = org.sample(n, axis, true)
			expect(idx).toHaveLength(n)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let i = 0; i < org.rows; i++) {
					let flg = true
					for (let j = 0; j < org.cols; j++) {
						flg &= mat.at(k, j) === org.at(i, j)
					}
					if (flg) {
						expidx.push(i)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			expect(expidx).toEqual(idx)
		})

		test('col index', () => {
			const n = 3
			const org = Matrix.randn(10, 5)
			const [mat, idx] = org.sample(n, 1)
			expect(idx).toHaveLength(n)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let j = 0; j < org.cols; j++) {
					let flg = true
					for (let i = 0; i < org.rows; i++) {
						flg &= mat.at(i, k) === org.at(i, j)
					}
					if (flg) {
						expidx.push(j)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			expect(expidx).toEqual(idx)
		})

		test('col duplicate index', () => {
			const n = 6
			const org = Matrix.randn(3, 5)
			const [mat, idx] = org.sample(n, 1, true)
			expect(idx).toHaveLength(n)

			const expidx = []
			for (let k = 0; k < n; k++) {
				for (let j = 0; j < org.cols; j++) {
					let flg = true
					for (let i = 0; i < org.rows; i++) {
						flg &= mat.at(i, k) === org.at(i, j)
					}
					if (flg) {
						expidx.push(j)
						break
					}
				}
			}
			expect(expidx).toHaveLength(n)
			expect(expidx).toEqual(idx)
		})

		test('fail invalid sampled size %p', () => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.sample(6, 0)).toThrow('Invalid sampled size.')
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.sample(4, axis)).toThrow('Invalid axis.')
		})
	})

	test('fill', () => {
		const mat = new Matrix(2, 3)
		mat.fill(6)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				expect(mat.at(i, j)).toBe(6)
			}
		}
	})

	test('map', () => {
		const org = Matrix.randn(2, 3)
		const mat = org.copy()
		mat.map(v => v ** 2)
		for (let i = 0; i < mat.length; i++) {
			expect(mat.value[i]).toBe(org.value[i] ** 2)
		}
	})

	test.todo('static map')

	describe('forEach', () => {
		test('values', () => {
			const mat = Matrix.randn(2, 3)
			const value = []
			mat.forEach(v => value.push(v))
			for (let i = 0; i < mat.length; i++) {
				expect(value[i]).toBe(mat.value[i])
			}
		})

		test.todo('index')
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
	})

	test.todo('adjoint')

	describe('flip', () => {
		test.each([undefined, 0])('axis %i', axis => {
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

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.flip(axis)).toThrow('Invalid axis.')
		})
	})

	describe('swap', () => {
		describe.each([undefined, 0])('axis=%p', axis => {
			test.each([
				[0, 1],
				[0, 2],
				[1, 2],
			])('swap %i and %i', (a, b) => {
				const data = [
					[1, 2, 3],
					[4, 5, 6],
					[7, 8, 9],
				]
				const mat = new Matrix(3, 3, data)
				mat.swap(a, b, axis)
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						expect(mat.at(i, j)).toBe(data[i === a ? b : i === b ? a : i][j])
					}
				}
			})

			test.each([
				[-1, 0],
				[1, 2],
				[-1, 2],
			])('fail swap %i and %i', (a, b) => {
				const mat = Matrix.random(2, 3)
				expect(() => mat.swap(a, b, axis)).toThrow('Index out of bounds.')
			})
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
					expect(mat.at(i, j)).toBe(data[i][j === a ? b : j === b ? a : j])
				}
			}
		})

		test.each([
			[-1, 0],
			[2, 3],
			[-1, 3],
		])('fail swap %i and %i (axis=1)', (a, b) => {
			const mat = Matrix.random(2, 3)
			expect(() => mat.swap(a, b, 1)).toThrow('Index out of bounds.')
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.swap(0, 1, axis)).toThrow('Invalid axis.')
		})
	})

	describe('sort', () => {
		describe.each([undefined, 0])('axis %p', axis => {
			test('default', () => {
				const org = Matrix.randn(10, 5)
				const mat = org.copy()
				const p = mat.sort(axis)
				for (let i = 0; i < org.rows; i++) {
					for (let j = 0; j < org.cols; j++) {
						expect(mat.at(i, j)).toBe(org.at(p[i], j))
					}
				}
				for (let i = 1; i < org.rows; i++) {
					let comp = true
					for (let j = 0; j < org.cols && comp; j++) {
						expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i - 1, j))
						comp &= mat.at(i, j) === mat.at(i - 1, j)
					}
				}
			})

			test('has same row', () => {
				const org = Matrix.randn(10, 5)
				for (let j = 0; j < org.cols; j++) {
					org.set(2, j, org.at(4, j))
				}
				const mat = org.copy()
				const p = mat.sort(axis)
				for (let i = 0; i < org.rows; i++) {
					for (let j = 0; j < org.cols; j++) {
						expect(mat.at(i, j)).toBe(org.at(p[i], j))
					}
				}
				for (let i = 1; i < org.rows; i++) {
					let comp = true
					for (let j = 0; j < org.cols && comp; j++) {
						expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i - 1, j))
						comp &= mat.at(i, j) === mat.at(i - 1, j)
					}
				}
			})
		})

		test('axis 1', () => {
			const org = Matrix.randn(5, 10)
			const mat = org.copy()
			const p = mat.sort(1)
			for (let j = 0; j < org.cols; j++) {
				for (let i = 0; i < org.rows; i++) {
					expect(mat.at(i, j)).toBe(org.at(i, p[j]))
				}
			}
			for (let j = 1; j < org.cols; j++) {
				let comp = true
				for (let i = 0; i < org.rows && comp; i++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i, j - 1))
					comp &= mat.at(i, j) === mat.at(i, j - 1)
				}
			}
		})

		test('axis 1 has same col', () => {
			const org = Matrix.randn(5, 10)
			for (let i = 0; i < org.rows; i++) {
				org.set(i, 2, org.at(i, 4))
			}
			const mat = org.copy()
			const p = mat.sort(1)
			for (let j = 0; j < org.cols; j++) {
				for (let i = 0; i < org.rows; i++) {
					expect(mat.at(i, j)).toBe(org.at(i, p[j]))
				}
			}
			for (let j = 1; j < org.cols; j++) {
				let comp = true
				for (let i = 0; i < org.rows && comp; i++) {
					expect(mat.at(i, j)).toBeGreaterThanOrEqual(mat.at(i, j - 1))
					comp &= mat.at(i, j) === mat.at(i, j - 1)
				}
			}
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.sort(axis)).toThrow('Invalid axis.')
		})
	})

	describe('shuffle', () => {
		test.each([undefined, 0])('axis %p', axis => {
			const org = Matrix.randn(10, 5)
			const mat = org.copy()
			mat.shuffle(axis)

			const expidx = []
			for (let k = 0; k < org.rows; k++) {
				for (let i = 0; i < org.rows; i++) {
					let flg = true
					for (let j = 0; j < org.cols; j++) {
						flg &= mat.at(k, j) === org.at(i, j)
					}
					if (flg) {
						expidx.push(i)
						break
					}
				}
			}
			expidx.sort((a, b) => a - b)
			expect(expidx).toHaveLength(org.rows)
			for (let i = 0; i < org.rows; i++) {
				expect(expidx[i]).toBe(i)
			}
		})

		test('axis 1', () => {
			const org = Matrix.randn(5, 10)
			const mat = org.copy()
			mat.shuffle(1)

			const expidx = []
			for (let k = 0; k < org.cols; k++) {
				for (let j = 0; j < org.cols; j++) {
					let flg = true
					for (let i = 0; i < org.rows; i++) {
						flg &= mat.at(i, k) === org.at(i, j)
					}
					if (flg) {
						expidx.push(j)
						break
					}
				}
			}
			expidx.sort((a, b) => a - b)
			expect(expidx).toHaveLength(org.cols)
			for (let i = 0; i < org.cols; i++) {
				expect(expidx[i]).toBe(i)
			}
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.shuffle(axis)).toThrow('Invalid axis.')
		})
	})

	describe('unique', () => {
		describe.each([undefined, 0])('axis %p', axis => {
			test('default', () => {
				const org = Matrix.randn(10, 5)
				org.set(1, 0, org.row(3))
				const mat = org.copy()

				const idx = mat.unique(axis)
				expect(mat.sizes).toEqual([9, 5])
				expect(idx).toEqual([0, 1, 2, 4, 5, 6, 7, 8, 9])
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(mat.at(i, j)).toBe(org.at(idx[i], j))
					}
				}
			})

			test('tol', () => {
				const org = Matrix.randn(10, 5)
				org.set(
					1,
					0,
					Matrix.map(org.row(3), v => v + (Math.random() * 2 - 1) * 1.0e-4)
				)
				const mat = org.copy()

				const idx = mat.unique(axis, 1.0e-4)
				expect(mat.sizes).toEqual([9, 5])
				expect(idx).toEqual([0, 1, 2, 4, 5, 6, 7, 8, 9])
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(mat.at(i, j)).toBeCloseTo(org.at(idx[i], j))
					}
				}
			})
		})

		test('axis 1', () => {
			const org = Matrix.randn(5, 10)
			org.set(0, 1, org.col(3))
			const mat = org.copy()

			const idx = mat.unique(1)
			expect(mat.sizes).toEqual([5, 9])
			expect(idx).toEqual([0, 1, 2, 4, 5, 6, 7, 8, 9])
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, idx[j]))
				}
			}
		})

		test('axis 1 tol', () => {
			const org = Matrix.randn(5, 10)
			org.set(
				0,
				1,
				Matrix.map(org.col(3), v => v + (Math.random() * 2 - 1) * 1.0e-4)
			)
			const mat = org.copy()

			const idx = mat.unique(1, 1.0e-4)
			expect(mat.sizes).toEqual([5, 9])
			expect(idx).toEqual([0, 1, 2, 4, 5, 6, 7, 8, 9])
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(mat.at(i, j)).toBeCloseTo(org.at(i, idx[j]))
				}
			}
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const mat = Matrix.randn(5, 10)
			expect(() => mat.unique(axis)).toThrow('Invalid axis.')
		})
	})

	describe('resize', () => {
		test.each([
			[5, 6],
			[3, 6],
			[6, 4],
			[3, 4],
			[2, 4],
			[3, 2],
			[2, 3],
			[2, 7],
			[5, 2],
		])('default [%i, %i]', (r, c) => {
			const org = Matrix.randn(3, 4)
			const mat = org.copy()
			mat.resize(r, c)
			expect(mat.sizes).toEqual([r, c])

			const mr = Math.min(org.rows, r)
			const mc = Math.min(org.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
		})

		test('array size', () => {
			const [r, c] = [2, 5]
			const org = Matrix.randn(3, 4)
			const mat = org.copy()
			mat.resize([r, c])
			expect(mat.sizes).toEqual([r, c])

			const mr = Math.min(org.rows, r)
			const mc = Math.min(org.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(mat.at(i, j)).toBe(0)
				}
			}
		})

		test.each([
			[5, 6],
			[3, 6],
			[6, 4],
			[3, 4],
			[2, 4],
			[3, 2],
			[2, 3],
			[2, 7],
			[5, 2],
		])('init [%i, %i]', (r, c) => {
			const org = Matrix.randn(3, 4)
			const mat = org.copy()
			mat.resize(r, c, 3)
			expect(mat.sizes).toEqual([r, c])

			const mr = Math.min(org.rows, r)
			const mc = Math.min(org.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(mat.at(i, j)).toBe(3)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(mat.at(i, j)).toBe(3)
				}
			}
		})

		test('array size with init', () => {
			const [r, c] = [2, 5]
			const org = Matrix.randn(3, 4)
			const mat = org.copy()
			mat.resize([r, c], 3)
			expect(mat.sizes).toEqual([r, c])

			const mr = Math.min(org.rows, r)
			const mc = Math.min(org.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(mat.at(i, j)).toBe(3)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(mat.at(i, j)).toBe(3)
				}
			}
		})
	})

	describe('static resize', () => {
		test.each([
			[5, 6],
			[3, 6],
			[6, 4],
			[3, 4],
			[2, 4],
			[3, 2],
			[2, 3],
			[2, 7],
			[5, 2],
		])('default [%i, %i]', (r, c) => {
			const mat = Matrix.randn(3, 4)
			const resize = Matrix.resize(mat, r, c)
			expect(resize.sizes).toEqual([r, c])

			const mr = Math.min(mat.rows, r)
			const mc = Math.min(mat.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(resize.at(i, j)).toBe(mat.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(resize.at(i, j)).toBe(0)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(resize.at(i, j)).toBe(0)
				}
			}
		})

		test('array size', () => {
			const [r, c] = [2, 5]
			const mat = Matrix.randn(3, 4)
			const resize = Matrix.resize(mat, [r, c])
			expect(resize.sizes).toEqual([r, c])

			const mr = Math.min(mat.rows, r)
			const mc = Math.min(mat.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(resize.at(i, j)).toBe(mat.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(resize.at(i, j)).toBe(0)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(resize.at(i, j)).toBe(0)
				}
			}
		})

		test.each([
			[5, 6],
			[3, 6],
			[6, 4],
			[3, 4],
			[2, 4],
			[3, 2],
			[2, 3],
			[2, 7],
			[5, 2],
		])('init [%i, %i]', (r, c) => {
			const mat = Matrix.randn(3, 4)
			const resize = Matrix.resize(mat, r, c, 3)
			expect(resize.sizes).toEqual([r, c])

			const mr = Math.min(mat.rows, r)
			const mc = Math.min(mat.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(resize.at(i, j)).toBe(mat.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(resize.at(i, j)).toBe(3)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(resize.at(i, j)).toBe(3)
				}
			}
		})

		test('array size with init', () => {
			const [r, c] = [2, 5]
			const mat = Matrix.randn(3, 4)
			const resize = Matrix.resize(mat, [r, c], 3)
			expect(resize.sizes).toEqual([r, c])

			const mr = Math.min(mat.rows, r)
			const mc = Math.min(mat.cols, c)
			for (let i = 0; i < mr; i++) {
				for (let j = 0; j < mc; j++) {
					expect(resize.at(i, j)).toBe(mat.at(i, j))
				}
				for (let j = mc; j < c; j++) {
					expect(resize.at(i, j)).toBe(3)
				}
			}
			for (let i = mr; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(resize.at(i, j)).toBe(3)
				}
			}
		})
	})

	describe('reshape', () => {
		test('success', () => {
			const org = Matrix.randn(3, 8)
			const mat = org.copy()
			mat.reshape(4, 6)
			expect(mat.sizes).toEqual([4, 6])
			expect(mat.length).toBe(org.length)
			expect(mat.value).toEqual(org.value)
		})

		test('array size', () => {
			const org = Matrix.randn(3, 8)
			const mat = org.copy()
			mat.reshape([4, 6])
			expect(mat.sizes).toEqual([4, 6])
			expect(mat.length).toBe(org.length)
			expect(mat.value).toEqual(org.value)
		})

		test.each([
			[-1, 6],
			[4, -1],
		])('neg value %i,%i', (r, c) => {
			const org = Matrix.randn(3, 8)
			const mat = org.copy()
			mat.reshape(r, c)
			expect(mat.sizes).toEqual([4, 6])
			expect(mat.length).toBe(org.length)
			expect(mat.value).toEqual(org.value)
		})

		test.each([
			[-1, 5],
			[4, -1],
			[3, 4],
			[6, 0],
		])('fail [%i, %i]', (r, c) => {
			const mat = Matrix.random(2, 3)
			expect(() => mat.reshape(r, c)).toThrow('Length is different.')
		})
	})

	describe('repeat', () => {
		test.each([
			[1, undefined],
			[[1], undefined],
			[1, 0],
			[[1], 0],
			[1, 1],
			[[1], 1],
			[[1, 1], null],
		])('no repeat %p', (n, axis) => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat(n, axis)
			expect(mat.sizes).toEqual([org.rows, org.cols])
			for (let i = 0; i < org.rows; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j))
				}
			}
		})

		test.each([undefined, 0])('axis %p', axis => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat(3, axis)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j))
				}
			}
		})

		test('axis 1', () => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat(3, 1)
			expect(mat.sizes).toEqual([org.rows, org.cols * 3])
			for (let i = 0; i < org.rows; i++) {
				for (let j = 0; j < org.cols * 3; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j % org.cols))
				}
			}
		})

		test('array 1', () => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat([3], 0)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j))
				}
			}
		})

		test('array 2', () => {
			const org = Matrix.randn(4, 5)
			const mat = org.copy()
			mat.repeat([3, 4], 0)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols * 4])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols * 4; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j % org.cols))
				}
			}
		})
	})

	describe('static repeat', () => {
		test.each([
			[1, undefined],
			[[1], undefined],
			[1, 0],
			[[1], 0],
			[1, 1],
			[[1], 1],
			[[1, 1], null],
		])('no repeat %p', (n, axis) => {
			const org = Matrix.randn(4, 5)
			const mat = Matrix.repeat(org, n, axis)
			expect(mat.sizes).toEqual([org.rows, org.cols])
			for (let i = 0; i < org.rows; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j))
				}
			}
		})

		test.each([undefined, 0])('axis %p', axis => {
			const org = Matrix.randn(4, 5)
			const mat = Matrix.repeat(org, 3, axis)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j))
				}
			}
		})

		test('axis 1', () => {
			const org = Matrix.randn(4, 5)
			const mat = Matrix.repeat(org, 3, 1)
			expect(mat.sizes).toEqual([org.rows, org.cols * 3])
			for (let i = 0; i < org.rows; i++) {
				for (let j = 0; j < org.cols * 3; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j % org.cols))
				}
			}
		})

		test('array 1', () => {
			const org = Matrix.randn(4, 5)
			const mat = Matrix.repeat(org, [3], 0)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j))
				}
			}
		})

		test('array 2', () => {
			const org = Matrix.randn(4, 5)
			const mat = Matrix.repeat(org, [3, 4], 0)
			expect(mat.sizes).toEqual([org.rows * 3, org.cols * 4])
			for (let i = 0; i < org.rows * 3; i++) {
				for (let j = 0; j < org.cols * 4; j++) {
					expect(mat.at(i, j)).toBe(org.at(i % org.rows, j % org.cols))
				}
			}
		})
	})

	describe('concat', () => {
		describe.each([undefined, 0])('axis %p', axis => {
			test('default', () => {
				const a = Matrix.randn(3, 10)
				const b = Matrix.randn(5, 10)
				const concat = a.copy()
				concat.concat(b, axis)
				expect(concat.sizes).toEqual([8, 10])
				for (let i = 0; i < 8; i++) {
					for (let j = 0; j < 10; j++) {
						expect(concat.at(i, j)).toBe(i < 3 ? a.at(i, j) : b.at(i - 3, j))
					}
				}
			})

			test('fail', () => {
				const a = Matrix.randn(3, 10)
				const b = Matrix.randn(3, 9)
				expect(() => a.concat(b)).toThrow('Size is different.')
			})
		})

		test('axis 1', () => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(10, 5)
			const concat = a.copy()
			concat.concat(b, 1)
			expect(concat.sizes).toEqual([10, 8])
			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < 8; j++) {
					expect(concat.at(i, j)).toBe(j < 3 ? a.at(i, j) : b.at(i, j - 3))
				}
			}
		})

		test('fail axis 1', () => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(9, 3)
			expect(() => a.concat(b, 1)).toThrow('Size is different.')
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(9, 3)
			expect(() => a.concat(b, axis)).toThrow('Invalid axis.')
		})
	})

	describe('static concat', () => {
		describe.each([undefined, 0])('axis %p', axis => {
			test('axis 0', () => {
				const a = Matrix.randn(3, 10)
				const b = Matrix.randn(5, 10)
				const concat = Matrix.concat(a, b, axis)
				expect(concat.sizes).toEqual([8, 10])
				for (let i = 0; i < 8; i++) {
					for (let j = 0; j < 10; j++) {
						expect(concat.at(i, j)).toBe(i < 3 ? a.at(i, j) : b.at(i - 3, j))
					}
				}
			})

			test('fail axis 0', () => {
				const a = Matrix.randn(3, 10)
				const b = Matrix.randn(3, 9)
				expect(() => Matrix.concat(a, b, axis)).toThrow('Size is different.')
			})
		})

		test('axis 1', () => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(10, 5)
			const concat = Matrix.concat(a, b, 1)
			expect(concat.sizes).toEqual([10, 8])
			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < 8; j++) {
					expect(concat.at(i, j)).toBe(j < 3 ? a.at(i, j) : b.at(i, j - 3))
				}
			}
		})

		test('fail axis 1', () => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(9, 3)
			expect(() => Matrix.concat(a, b, 1)).toThrow('Size is different.')
		})

		test.each([-1, 2])('fail invalid axis %p', axis => {
			const a = Matrix.randn(10, 3)
			const b = Matrix.randn(9, 3)
			expect(() => Matrix.concat(a, b, axis)).toThrow('Invalid axis.')
		})
	})

	describe('reduce', () => {
		describe.each([undefined, -1, [-1], [0, 1]])('axis -1', axis => {
			test('no init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, null, axis)
				expect(reduce).toBeCloseTo(mat.value.reduce((s, v) => s + v))
			})

			test('with init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, 1, axis)
				expect(reduce).toBeCloseTo(1 + mat.value.reduce((s, v) => s + v))
			})

			test('keepdims', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, 0, axis, true)
				expect(reduce.sizes).toEqual([1, 1])
				expect(reduce.at(0, 0)).toBeCloseTo(mat.value.reduce((s, v) => s + v))
			})
		})

		describe.each([0, [0]])('axis %p', axis => {
			test('no init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, undefined, axis)
				expect(reduce.sizes).toEqual([1, 7])

				for (let i = 0; i < mat.cols; i++) {
					let v = 0
					for (let j = 0; j < mat.rows; j++) {
						v += mat.at(j, i)
					}
					expect(reduce.at(0, i)).toBeCloseTo(v)
				}
			})

			test('with init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, 1, axis)
				expect(reduce.sizes).toEqual([1, 7])

				for (let i = 0; i < mat.cols; i++) {
					let v = 1
					for (let j = 0; j < mat.rows; j++) {
						v += mat.at(j, i)
					}
					expect(reduce.at(0, i)).toBeCloseTo(v)
				}
			})

			test('keepdims false', () => {
				const mat = Matrix.randn(5, 7)
				expect(() => mat.reduce((s, v) => s + v, 0, axis, false)).toThrow(
					'keepdims only accept true if axis >= 0.'
				)
			})
		})

		describe.each([1, [1]])('axis %p', axis => {
			test('no init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, undefined, axis)
				expect(reduce.sizes).toEqual([5, 1])

				for (let i = 0; i < mat.rows; i++) {
					let v = 0
					for (let j = 0; j < mat.cols; j++) {
						v += mat.at(i, j)
					}
					expect(reduce.at(i, 0)).toBeCloseTo(v)
				}
			})

			test('with init', () => {
				const mat = Matrix.randn(5, 7)
				const reduce = mat.reduce((s, v) => s + v, 1, axis)
				expect(reduce.sizes).toEqual([5, 1])

				for (let i = 0; i < mat.rows; i++) {
					let v = 1
					for (let j = 0; j < mat.cols; j++) {
						v += mat.at(i, j)
					}
					expect(reduce.at(i, 0)).toBeCloseTo(v)
				}
			})

			test('keepdims false', () => {
				const mat = Matrix.randn(5, 7)
				expect(() => mat.reduce((s, v) => s + v, 0, axis, false)).toThrow(
					'keepdims only accept true if axis >= 0.'
				)
			})
		})

		test.each([2, [2]])('invalid axis %i', axis => {
			const mat = Matrix.randn(5, 7)
			expect(() => mat.reduce((s, v) => s + v, 0, axis)).toThrow('Invalid axis.')
		})
	})

	describe('every', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.every(v => v > 0)).toBe(true)
			expect(org.every(v => v > 1)).toBe(false)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const every = org.every(v => v > 1, 0)
			expect(every.sizes).toEqual([1, 3])
			expect(every.value).toEqual([false, true, true])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const every = org.every(v => v > 1, 1)
			expect(every.sizes).toEqual([2, 1])
			expect(every.value).toEqual([false, true])
		})
	})

	describe('some', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.some(v => v > 4)).toBe(true)
			expect(org.some(v => v > 6)).toBe(false)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const some = org.some(v => v > 4, 0)
			expect(some.sizes).toEqual([1, 3])
			expect(some.value).toEqual([false, true, true])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const some = org.some(v => v > 5, 1)
			expect(some.sizes).toEqual([2, 1])
			expect(some.value).toEqual([false, true])
		})
	})

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

	describe('median', () => {
		test('even', () => {
			const data = [
				[0, 2, 3],
				[4, 5, 7],
			]
			const org = new Matrix(2, 3, data)
			expect(org.median()).toBe(3.5)
		})

		test('odd', () => {
			const data = [
				[0, 2, 3],
				[4, 5, 6],
				[10, 11, 12],
			]
			const org = new Matrix(3, 3, data)
			expect(org.median()).toBe(5)
		})

		test('axis 0', () => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const median = org.median(0)
			expect(median.sizes).toEqual([1, 3])
			expect(median.value).toEqual([7, 6, 7])
		})

		test('axis 1', () => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const median = org.median(1)
			expect(median.sizes).toEqual([4, 1])
			expect(median.value).toEqual([2, 5, 8, 10])
		})
	})

	describe('quantile', () => {
		const quantile = (a, q) => {
			a.sort((a, b) => a - b)
			if (q === 0) {
				return a[0]
			} else if (q === 1) {
				return a[a.length - 1]
			}
			const n = (a.length - 1) * q
			const l = Math.floor(n)
			return a[l] + (n - l) * (a[l + 1] - a[l])
		}

		test.each([0, 0.1, 0.5, 0.8, 1])('single q=%f', q => {
			const data = Math.random()
			const org = new Matrix(1, 1, data)
			expect(org.quantile(q)).toBeCloseTo(data)
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('even q=%f', q => {
			const data = [
				[0, 2, 3],
				[4, 5, 7],
			]
			const org = new Matrix(2, 3, data)
			expect(org.quantile(q)).toBeCloseTo(quantile(data.flat(), q))
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('odd q=%f', q => {
			const data = [
				[0, 2, 3],
				[4, 5, 6],
				[10, 11, 12],
			]
			const org = new Matrix(3, 3, data)
			expect(org.quantile(q)).toBeCloseTo(quantile(data.flat(), q))
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('axis 0, q=%f', q => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const quant = org.quantile(q, 0)
			expect(quant.sizes).toEqual([1, 3])
			for (let i = 0; i < org.cols; i++) {
				expect(quant.at(0, i)).toBeCloseTo(
					quantile(
						data.map(r => r[i]),
						q
					)
				)
			}
		})

		test.each([0, 0.1, 0.5, 0.8, 1])('axis 1, q=%f', q => {
			const data = [
				[1, 2, 6],
				[4, 5, 9],
				[12, 7, 8],
				[10, 11, 3],
			]
			const org = new Matrix(4, 3, data)
			const quant = org.quantile(q, 1)
			expect(quant.sizes).toEqual([4, 1])
			for (let i = 0; i < org.rows; i++) {
				expect(quant.at(i, 0)).toBeCloseTo(quantile(data[i], q))
			}
		})
	})

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

	describe('variance', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.variance()).toBe(17.5 / 6)
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.variance(0)
			expect(prod.sizes).toEqual([1, 3])
			expect(prod.value).toEqual([4.5 / 2, 4.5 / 2, 4.5 / 2])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.variance(1)
			expect(prod.sizes).toEqual([2, 1])
			expect(prod.value).toEqual([8 / 3, 8 / 3])
		})
	})

	describe('std', () => {
		test('default', () => {
			const data = [
				[1, 2, 3],
				[4, 5, 6],
			]
			const org = new Matrix(2, 3, data)
			expect(org.std()).toBe(Math.sqrt(17.5 / 6))
		})

		test('axis 0', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.std(0)
			expect(prod.sizes).toEqual([1, 3])
			expect(prod.value).toEqual([Math.sqrt(4.5 / 2), Math.sqrt(4.5 / 2), Math.sqrt(4.5 / 2)])
		})

		test('axis 1', () => {
			const data = [
				[1, 5, 3],
				[4, 2, 6],
			]
			const org = new Matrix(2, 3, data)
			const prod = org.std(1)
			expect(prod.sizes).toEqual([2, 1])
			expect(prod.value).toEqual([Math.sqrt(8 / 3), Math.sqrt(8 / 3)])
		})
	})

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

	describe('isDiag', () => {
		test.each([
			[0, 0],
			[1, 1],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i === j) {
						mat.set(i, j, Math.random())
					}
				}
			}
			expect(mat.isDiag()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const a = Math.floor(Math.random() * r)
			mat.set(a, (a + 1) % c, Math.random())
			expect(mat.isDiag()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					const r = Math.random() * 2 - 1
					if (i === j) {
						mat.set(i, j, r)
					} else {
						mat.set(i, j, r / 1.0e4)
					}
				}
			}

			expect(mat.isDiag(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const mat = Matrix.zeros(5, 5)
			const a = Math.floor(Math.random() * 5)
			mat.set(a, (a + 1) % 5, 1.1e-4)
			expect(mat.isDiag(1.0e-4)).toBeFalsy()
		})
	})

	describe('isIdentity', () => {
		test.each([0, 1, 2, 3, 5])('expect true %i', n => {
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				mat.set(i, i, 1)
			}
			expect(mat.isIdentity()).toBeTruthy()
		})

		test.each([
			[0, 1],
			[2, 3],
		])('expect false (not square) [%i %i]', (r, c) => {
			const mat = new Matrix(r, c)
			for (let i = 0; i < Math.min(r, c); i++) {
				mat.set(i, i, 1)
			}
			expect(mat.isIdentity()).toBeFalsy()
		})

		test.each([1, 3, 5])('expect false (diag is not 1) %i', n => {
			const mat = new Matrix(n, n)
			expect(mat.isIdentity()).toBeFalsy()
		})

		test.each([3, 5])('expect false (non diag is not 0) %i', n => {
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				mat.set(i, i, 1)
			}
			const r = Math.floor(Math.random() * n)
			mat.set(r, (r + 1) % n, 1)
			expect(mat.isIdentity()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					const r = Math.random() * 2 - 1
					if (i === j) {
						mat.set(i, j, 1 + r / 1.0e4)
					} else {
						mat.set(i, j, r / 1.0e4)
					}
				}
			}

			expect(mat.isIdentity(1.0e-4)).toBeTruthy()
		})

		test('tol expect false (diag is not 1)', () => {
			const mat = new Matrix(5, 5)
			for (let i = 0; i < 5; i++) {
				mat.set(i, i, 1 + 1.1e-4)
			}
			expect(mat.isIdentity(1.0e-4)).toBeFalsy()
		})

		test('tol expect false (non diag is not 0)', () => {
			const mat = new Matrix(5, 5)
			for (let i = 0; i < 5; i++) {
				mat.set(i, i, 1)
			}
			const r = Math.floor(Math.random() * 5)
			mat.set(r, (r + 1) % 5, 1.1e-4)
			expect(mat.isIdentity(1.0e-4)).toBeFalsy()
		})
	})

	describe('isZero', () => {
		test.each([0, 1, 2, 3, 5])('expect true %i', n => {
			const mat = new Matrix(n, n)
			expect(mat.isZero()).toBeTruthy()
		})

		test.each([1, 3, 5])('expect false (some is not 1) %i', n => {
			const mat = new Matrix(n, n)
			const r = Math.floor(Math.random() * n)
			mat.set(r, (r + 1) % n, Math.random())
			expect(mat.isZero()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r / 1.0e4)
				}
			}

			expect(mat.isZero(1.0e-4)).toBeTruthy()
		})

		test('tol expect false (some is not 1)', () => {
			const mat = new Matrix(5, 5)
			const r = Math.floor(Math.random() * 5)
			mat.set(r, (r + 1) % 5, 1.1e-4)
			expect(mat.isZero(1.0e-4)).toBeFalsy()
		})
	})

	describe('isTriangular', () => {
		describe.each(['lower', 'upper'])('%s', t => {
			const toZero = (a, b) => (t === 'lower' ? a > b : b < a)
			test.each([
				[0, 0],
				[1, 1],
				[1, 3],
				[3, 1],
				[10, 10],
				[5, 7],
				[7, 5],
			])('expect true [%i, %i]', (r, c) => {
				const mat = Matrix.random(r, c)
				for (let i = 0; i < r; i++) {
					for (let j = 0; j < c; j++) {
						if (toZero(i, j)) {
							mat.set(i, j, 0)
						}
					}
				}
				expect(mat.isTriangular()).toBeTruthy()
			})

			test('tol', () => {
				const n = 5
				const mat = Matrix.randn(n, n)
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						if (toZero(i, j)) {
							const r = Math.random() * 2 - 1
							mat.set(i, j, r / 1.0e4)
						}
					}
				}

				expect(mat.isTriangular(1.0e-4)).toBeTruthy()
			})

			test('tol expect false', () => {
				const n = 5
				const mat = Matrix.randn(n, n)

				const toZeroIdx = []
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						if (toZero(i, j)) {
							toZeroIdx.push([i, j])
						}
					}
				}
				const idx = toZeroIdx[Math.floor(Math.random() * toZeroIdx.length)]
				mat.set(idx[0], idx[1], 1.1e4)

				expect(mat.isTriangular(1.0e-4)).toBeFalsy()
			})
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const ua = Math.floor(Math.random() * Math.min(r, c - 1))
			const ub = ua + Math.floor(Math.random() * (c - ua - 1)) + 1
			mat.set(ua, ub, Math.random())
			const la = Math.floor(Math.random() * (r - 1)) + 1
			const lb = Math.min(c - 1, Math.floor(Math.random() * la))
			mat.set(la, lb, Math.random())
			expect(mat.isTriangular()).toBeFalsy()
		})
	})

	describe('isLowerTriangular', () => {
		test.each([
			[0, 0],
			[1, 1],
			[1, 3],
			[3, 1],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = i + 1; j < c; j++) {
					mat.set(i, j, 0)
				}
			}
			expect(mat.isLowerTriangular()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const a = Math.floor(Math.random() * Math.min(r, c - 1))
			const b = a + Math.floor(Math.random() * (c - a - 1)) + 1
			mat.set(a, b, Math.random())
			expect(mat.isLowerTriangular()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r / 1.0e4)
				}
			}

			expect(mat.isLowerTriangular(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			const toZeroIdx = []
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					toZeroIdx.push([i, j])
				}
			}
			const idx = toZeroIdx[Math.floor(Math.random() * toZeroIdx.length)]
			mat.set(idx[0], idx[1], 1.1e4)

			expect(mat.isLowerTriangular(1.0e-4)).toBeFalsy()
		})
	})

	describe('isUpperTriangular', () => {
		test.each([
			[0, 0],
			[1, 1],
			[1, 3],
			[3, 1],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect true [%i, %i]', (r, c) => {
			const mat = Matrix.random(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < Math.min(i, c); j++) {
					mat.set(i, j, 0)
				}
			}
			expect(mat.isUpperTriangular()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const a = Math.floor(Math.random() * (r - 1)) + 1
			const b = Math.min(c - 1, Math.floor(Math.random() * a))
			mat.set(a, b, Math.random())
			expect(mat.isUpperTriangular()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r / 1.0e4)
				}
			}

			expect(mat.isUpperTriangular(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			const toZeroIdx = []
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					toZeroIdx.push([i, j])
				}
			}
			const idx = toZeroIdx[Math.floor(Math.random() * toZeroIdx.length)]
			mat.set(idx[0], idx[1], 1.1e4)

			expect(mat.isUpperTriangular(1.0e-4)).toBeFalsy()
		})
	})

	describe('isSymmetric', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.add(mat.t)
			expect(mat.isSymmetric()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isSymmetric()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, r + r / 1.0e4)
					}
				}
			}

			expect(mat.isSymmetric(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.add(mat.t)

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isSymmetric(1.0e-4)).toBeFalsy()
		})
	})

	describe('isHermitian', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.add(mat.adjoint())
			expect(mat.isHermitian()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isHermitian()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, r + r / 1.0e4)
					}
				}
			}

			expect(mat.isHermitian(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.add(mat.adjoint())

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isHermitian(1.0e-4)).toBeFalsy()
		})
	})

	describe('isAlternating', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.sub(mat.t)
			expect(mat.isAlternating()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isAlternating()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, -r + r / 1.0e4)
					}
				}
			}

			expect(mat.isAlternating(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.sub(mat.t)

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isAlternating(1.0e-4)).toBeFalsy()
		})
	})

	describe('isSkewHermitian', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.sub(mat.adjoint())
			expect(mat.isSkewHermitian()).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isSkewHermitian()).toBeFalsy()
		})

		test('tol', () => {
			const n = 5
			const mat = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const r = Math.random() * 2 - 1
					mat.set(i, j, r)
					if (i !== j) {
						mat.set(j, i, -r + r / 1.0e4)
					}
				}
			}

			expect(mat.isSkewHermitian(1.0e-4)).toBeTruthy()
		})

		test('tol expect false', () => {
			const n = 5
			const mat = Matrix.randn(n, n)
			mat.sub(mat.adjoint())

			const i = Math.floor(Math.random() * n)
			const j = (i + 1) % n
			mat.set(i, j, mat.at(j, i) + 1.1e-4)

			expect(mat.isSkewHermitian(1.0e-4)).toBeFalsy()
		})
	})

	describe('isRegular', () => {
		test.each([0, 1, 2, 5])('expect true %i', n => {
			const mat = Matrix.random(n, n).gram()
			const evalue = mat.eigenValues()
			mat.sub(Matrix.eye(n, n, evalue[0]))
			expect(mat.isRegular(1.0e-10)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isRegular()).toBeFalsy()
		})
	})

	describe('isNormal', () => {
		test.each([0, 1, 2, 5])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			mat.add(mat.t)
			mat.div(2)
			expect(mat.isNormal(1.0e-12)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isNormal()).toBeFalsy()
		})
	})

	describe('isOrthogonal', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			for (let i = 0; i < n; i++) {
				const a = mat.row(i)
				for (let k = 0; k < i; k++) {
					const u = mat.row(k)
					u.mult(mat.row(i).dot(u.t))
					a.sub(u)
				}
				a.div(a.norm())
				mat.set(i, 0, a)
			}
			expect(mat.isOrthogonal(1.0e-12)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isOrthogonal()).toBeFalsy()
		})

		test('expect false diag is 1', () => {
			const mat = new Matrix(5, 5, Math.sqrt(0.2))
			expect(mat.isOrthogonal(1.0e-12)).toBeFalsy()
		})
	})

	describe('isUnitary', () => {
		test.each([0, 1, 2, 10])('expect true %i', n => {
			const mat = Matrix.random(n, n)
			for (let i = 0; i < n; i++) {
				const a = mat.row(i)
				for (let k = 0; k < i; k++) {
					const u = mat.row(k)
					u.mult(mat.row(i).dot(u.t))
					a.sub(u)
				}
				a.div(a.norm())
				mat.set(i, 0, a)
			}
			expect(mat.isUnitary(1.0e-12)).toBeTruthy()
		})

		test.each([
			[2, 2],
			[10, 10],
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isUnitary()).toBeFalsy()
		})
	})

	describe('isNilpotent', () => {
		test.each([0, 1, 2, 3, 10])('expect true %i', n => {
			const mat = Matrix.zeros(n, n)
			for (let i = 0; i < n - 1; i++) {
				mat.set(i, i + 1, 1)
			}
			expect(mat.isNilpotent(1.0e-12)).toBeTruthy()
		})

		test('expect false (not zero)', () => {
			const mat = Matrix.fromArray([
				[1, 2],
				[2, 1],
			])
			expect(mat.isNilpotent()).toBeFalsy()
		})

		test('expect false (NaN)', () => {
			const mat = Matrix.fromArray([
				[1, -1],
				[2, 1],
			])
			expect(mat.isNilpotent()).toBeFalsy()
		})

		test.each([
			[5, 7],
			[7, 5],
		])('expect false [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(mat.isNilpotent()).toBeFalsy()
		})
	})

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

	describe('norm', () => {
		test('1', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.norm(1)
			expect(norm).toBeCloseTo(mat.value.reduce((s, v) => s + Math.abs(v), 0))
		})

		test('2', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.norm(2)
			expect(norm).toBeCloseTo(Math.sqrt(mat.value.reduce((s, v) => s + v ** 2, 0)))
		})

		test('Infinity', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.norm(Infinity)
			expect(norm).toBeCloseTo(mat.value.reduce((s, v) => Math.max(s, Math.abs(v)), 0))
		})
	})

	describe('normInduced', () => {
		test('1', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normInduced(1)
			expect(norm).toBeCloseTo(Matrix.map(mat, Math.abs).sum(0).max())
		})

		test.each([undefined, 2])('%p', axis => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normInduced(axis)
			expect(norm).toBeCloseTo(mat.singularValues()[0])
		})

		test('Infinity', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normInduced(Infinity)
			expect(norm).toBeCloseTo(Matrix.map(mat, Math.abs).sum(1).max())
		})

		test.each([3, 4])('fail %i', p => {
			const mat = Matrix.randn(10, 10)
			expect(() => mat.normInduced(p)).toThrow('Not implemented')
		})
	})

	test('normSpectral', () => {
		const mat = Matrix.randn(10, 10)
		const norm = mat.normSpectral()
		expect(norm).toBeCloseTo(mat.singularValues()[0])
	})

	describe('normEntrywise', () => {
		test('1', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normEntrywise(1)
			expect(norm).toBeCloseTo(mat.value.reduce((s, v) => s + Math.abs(v), 0))
		})

		test.each([undefined, 2])('%p', axis => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normEntrywise(axis)
			expect(norm).toBeCloseTo(Math.sqrt(mat.value.reduce((s, v) => s + v ** 2, 0)))
		})

		test('Infinity', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normEntrywise(Infinity)
			expect(norm).toBeCloseTo(mat.value.reduce((s, v) => Math.max(s, Math.abs(v)), 0))
		})
	})

	test('normFrobenius', () => {
		const mat = Matrix.randn(10, 10)
		const norm = mat.normFrobenius()
		expect(norm).toBeCloseTo(Math.sqrt(mat.value.reduce((s, v) => s + v ** 2, 0)))
	})

	test('normMax', () => {
		const mat = Matrix.randn(10, 10)
		const norm = mat.normMax()
		expect(norm).toBeCloseTo(mat.value.reduce((s, v) => Math.max(s, Math.abs(v)), 0))
	})

	describe('normSchatten', () => {
		test('1', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normSchatten(1)
			const sv = mat.singularValues().slice(0, Math.min(mat.rows, mat.cols))
			expect(norm).toBeCloseTo(sv.reduce((s, v) => s + v, 0))
		})

		test.each([undefined, 2])('2', axis => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normSchatten(axis)
			const sv = mat.singularValues().slice(0, Math.min(mat.rows, mat.cols))
			expect(norm).toBeCloseTo(Math.sqrt(sv.reduce((s, v) => s + v ** 2, 0)))
		})

		test('Infinity', () => {
			const mat = Matrix.randn(10, 10)
			const norm = mat.normSchatten(Infinity)
			const sv = mat.singularValues().slice(0, Math.min(mat.rows, mat.cols))
			expect(norm).toBeCloseTo(sv.reduce((s, v) => Math.max(s, Math.abs(v)), 0))
		})
	})

	test('normNuclear', () => {
		const mat = Matrix.randn(10, 10)
		const norm = mat.normNuclear()
		const sv = mat.singularValues().slice(0, Math.min(mat.rows, mat.cols))
		expect(norm).toBeCloseTo(sv.reduce((s, v) => s + v, 0))
	})

	describe('rank', () => {
		test('regular default tol', () => {
			const mat = new Matrix(2, 2, [
				[1, 2],
				[3, 4],
			])
			const rank = mat.rank()
			expect(rank).toBe(2)
		})

		test.each([
			[1, 1],
			[4, 4],
			[2, 3],
			[3, 2],
		])('regular (%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			const rank = mat.rank(1.0e-12)
			expect(rank).toBe(Math.min(r, c))
		})

		test('not regular', () => {
			const r = 4
			const c = 5
			const mat = Matrix.randn(r, c)
			for (let i = 0; i < c; i++) {
				mat.set(r - 3, i, mat.at(r - 2, i))
			}
			const rank = mat.rank(1.0e-12)
			expect(rank).toBe(3)
		})

		test('all element 0', () => {
			const mat = new Matrix(2, 2, 0)
			const rank = mat.rank()
			expect(rank).toBe(0)
		})

		test.todo('tol')
	})

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
			const idx = Array.from({ length: n }, (_, i) => i)
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

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.det()).toThrow('Determine only define square matrix.')
		})
	})

	describe('spectralRadius', () => {
		test('default', () => {
			const mat = Matrix.randn(5, 5).gram()
			const r = mat.spectralRadius()
			expect(r).toBeGreaterThan(0)

			const pmat = mat.copy()
			const mmat = mat.copy()
			for (let k = 0; k < 5; k++) {
				pmat.subAt(k, k, r)
				mmat.addAt(k, k, r)
			}
			expect(pmat.det() * mmat.det()).toBeCloseTo(0)
		})

		test('fail', () => {
			const mat = new Matrix(5, 4)
			expect(() => mat.spectralRadius()).toThrow('Spectral radius only define square matrix.')
		})
	})

	test.each([
		['not', v => +!v],
		['bitnot', v => ~v],
	])('%s', (name, calc) => {
		const mat = Matrix.randint(100, 10, -10, 10)
		const cp = mat.copy()
		cp[name]()
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				expect(cp.at(i, j)).toBe(calc(mat.at(i, j)))
			}
		}
	})

	test.each([
		['negative', v => -v],
		['abs', Math.abs],
		['round', Math.round],
		['floor', Math.floor],
		['ceil', Math.ceil],
	])('%s', (name, calc) => {
		const mat = Matrix.randn(100, 10)
		const cp = mat.copy()
		cp[name]()
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				expect(cp.at(i, j)).toBe(calc(mat.at(i, j)))
			}
		}
	})

	test.each([
		['leftShift', v => v << 2],
		['signedRightShift', v => v >> 2],
		['unsignedRightShift', v => v >>> 2],
	])('%s', (name, calc) => {
		const mat = Matrix.randint(100, 10, -10, 10)
		const cp = mat.copy()
		cp[name](2)
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				expect(cp.at(i, j)).toBe(calc(mat.at(i, j)))
			}
		}
	})

	describe('broadcastOperate', () => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const cp = mat.copy()
			cp.broadcastOperate(2, (a, b) => a + b)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(mat.at(i, j) + 2)
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[100, 2],
			[2, 2],
			[300, 10],
			[100, 40],
			[300, 40],
			[2, 40],
			[300, 2],
		])('matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const cp = mat.copy()
			cp.broadcastOperate(other, (a, b) => a + b)

			expect(cp.sizes).toEqual([Math.max(100, r), Math.max(10, c)])
			for (let i = 0; i < cp.rows; i++) {
				for (let j = 0; j < cp.cols; j++) {
					expect(cp.at(i, j)).toBe(mat.at(i % 100, j % 10) + other.at(i % other.rows, j % other.cols))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat.broadcastOperate(other, (a, b) => a + b)).toThrow('Broadcasting size invalid.')
		})

		test('2d tensor', () => {
			const org = Matrix.randn(100, 10)
			const mat = org.copy()
			const ten = Tensor.randn([100, 10])
			mat.broadcastOperate(ten, (a, b) => a + b)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j) + ten.at(i, j))
				}
			}
		})

		test('1d tensor', () => {
			const org = Matrix.randn(100, 10)
			const mat = org.copy()
			const ten = Tensor.randn([10])
			mat.broadcastOperate(ten, (a, b) => a + b)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(mat.at(i, j)).toBe(org.at(i, j) + ten.at(j))
				}
			}
		})

		test('3d tensor', () => {
			const org = Matrix.randn(100, 10)
			const mat = org.copy()
			const ten = Tensor.randn([1, 100, 10])
			expect(() => mat.broadcastOperate(ten, (a, b) => a + b)).toThrow('Broadcasting size invalid.')
		})
	})

	describe('operateAt', () => {
		test('scalar', () => {
			const org = Matrix.randn(100, 10)
			const mat = org.copy()
			mat.operateAt(1, 1, v => v + 1)
			expect(mat.at(1, 1)).toBe(org.at(1, 1) + 1)
		})

		test('array', () => {
			const org = Matrix.randn(100, 10)
			const mat = org.copy()
			mat.operateAt([1, 1], v => v + 1)
			expect(mat.at(1, 1)).toBe(org.at(1, 1) + 1)
		})

		test.each([
			[-1, 0],
			[0, -1],
			[100, 0],
			[0, 10],
		])('fail at(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			expect(() => mat.operateAt(r, c, 2)).toThrow('Index out of bounds.')
		})
	})

	describe.each([
		['add', (a, b) => a + b],
		['sub', (a, b) => a - b],
		['isub', (a, b) => b - a],
		['mult', (a, b) => a * b],
		['div', (a, b) => a / b],
		['idiv', (a, b) => b / a],
	])('%s', (name, calc) => {
		test('scalar', () => {
			const mat = Matrix.randn(100, 10)
			const cp = mat.copy()
			cp[name](2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), 2))
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(100, 10)

			const cp = mat.copy()
			cp[name](other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), other.at(i, j)))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[100, 2],
			[2, 2],
			[300, 10],
			[100, 40],
			[300, 40],
			[2, 40],
			[300, 2],
		])('diff size matrix [%i %i]', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)

			const cp = mat.copy()
			cp[name](other)

			expect(cp.sizes).toEqual([Math.max(100, r), Math.max(10, c)])
			for (let i = 0; i < cp.rows; i++) {
				for (let j = 0; j < cp.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i % 100, j % 10), other.at(i % other.rows, j % other.cols)))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			const other = Matrix.randn(r, c)
			expect(() => mat[name](other)).toThrow('Broadcasting size invalid.')
		})

		test('at', () => {
			const mat = Matrix.randn(100, 10)
			const cp = mat.copy()
			cp[name + 'At'](1, 3, 2)
			expect(cp.at(1, 3)).toBe(calc(mat.at(1, 3), 2))
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === 1 && j === 3) {
						continue
					}
					expect(cp.at(i, j)).toBe(mat.at(i, j))
				}
			}
		})

		test.each([
			[-1, 0],
			[0, -1],
			[100, 0],
			[0, 10],
		])('fail at(%i, %i)', (r, c) => {
			const mat = Matrix.randn(100, 10)
			expect(() => mat[name + 'At'](r, c, 2)).toThrow('Index out of bounds.')
		})

		test('static (mat, number)', () => {
			if (name[0] === 'i') {
				return
			}
			const mat = Matrix.randn(100, 10)
			const cp = Matrix[name](mat, 2)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), 2))
				}
			}
		})

		test('static (number, mat)', () => {
			if (name[0] === 'i') {
				return
			}
			const mat = Matrix.randn(100, 10)
			const cp = Matrix[name](2, mat)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(2, mat.at(i, j)))
				}
			}
		})

		test('static (number, number)', () => {
			if (name[0] === 'i') {
				return
			}
			const cp = Matrix[name](2, 3)
			expect(cp.sizes).toEqual([1, 1])
			expect(cp.at(0, 0)).toBe(calc(2, 3))
		})
	})

	describe.each([
		['mod', (a, b) => a % b],
		['imod', (a, b) => b % a],
	])('%s', (name, calc) => {
		test('scalar', () => {
			const mat = Matrix.randint(100, 10, -5, 5)
			const cp = mat.copy()
			cp[name](3)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), 3))
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.randint(100, 10, -5, 5)
			const other = Matrix.randint(100, 10, -5, 5)

			const cp = mat.copy()
			cp[name](other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), other.at(i, j)))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[100, 2],
			[2, 2],
			[300, 10],
			[100, 40],
			[300, 40],
			[2, 40],
			[300, 2],
		])('diff size matrix [%i %i]', (r, c) => {
			const mat = Matrix.randint(100, 10, -5, 5)
			const other = Matrix.randint(r, c, -5, 5)

			const cp = mat.copy()
			cp[name](other)

			expect(cp.sizes).toEqual([Math.max(100, r), Math.max(10, c)])
			for (let i = 0; i < cp.rows; i++) {
				for (let j = 0; j < cp.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i % 100, j % 10), other.at(i % other.rows, j % other.cols)))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.randint(100, 10, -5, 5)
			const other = Matrix.randint(r, c, -5, 5)
			expect(() => mat[name](other)).toThrow('Broadcasting size invalid.')
		})

		test('at %i', () => {
			const mat = Matrix.randint(100, 10, -5, 5)
			const cp = mat.copy()
			cp[name + 'At'](1, 3, 3)
			expect(cp.at(1, 3)).toBe(calc(mat.at(1, 3), 3))
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === 1 && j === 3) {
						continue
					}
					expect(cp.at(i, j)).toBe(mat.at(i, j))
				}
			}
		})

		test.each([
			[-1, 0],
			[0, -1],
			[100, 0],
			[0, 10],
		])('fail at(%i, %i)', (r, c) => {
			const mat = Matrix.randint(100, 10, -5, 5)
			expect(() => mat[name + 'At'](r, c, 2)).toThrow('Index out of bounds.')
		})

		test('static (mat, number)', () => {
			if (name[0] === 'i') {
				return
			}
			const mat = Matrix.randint(100, 10, -5, 5)
			const cp = Matrix[name](mat, 3)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), 3))
				}
			}
		})

		test('static (number, mat)', () => {
			if (name[0] === 'i') {
				return
			}
			const mat = Matrix.randint(100, 10, -5, 5)
			const cp = Matrix[name](13, mat)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(13, mat.at(i, j)))
				}
			}
		})

		test('static (number, number)', () => {
			if (name[0] === 'i') {
				return
			}
			const cp = Matrix[name](13, 3)
			expect(cp.sizes).toEqual([1, 1])
			expect(cp.at(0, 0)).toBe(calc(13, 3))
		})
	})

	describe.each([
		['and', (a, b) => +(!!b && !!a)],
		['or', (a, b) => +(!!b || !!a)],
		['bitand', (a, b) => b & a],
		['bitor', (a, b) => b | a],
		['bitxor', (a, b) => b ^ a],
	])('%s', (name, calc) => {
		test.each([0, 1, -1])('scalar %i', value => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			const cp = mat.copy()
			cp[name](value)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), value))
				}
			}
		})

		test('same size matrix', () => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			const other = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))

			const cp = mat.copy()
			cp[name](other)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), other.at(i, j)))
				}
			}
		})

		test.each([
			[100, 10],
			[2, 10],
			[100, 2],
			[2, 2],
			[300, 10],
			[100, 40],
			[300, 40],
			[2, 40],
			[300, 2],
		])('diff size matrix [%i %i]', (r, c) => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			const other = Matrix.map(Matrix.random(r, c, -1, 2), v => Math.floor(v))

			const cp = mat.copy()
			cp[name](other)

			expect(cp.sizes).toEqual([Math.max(100, r), Math.max(10, c)])
			for (let i = 0; i < cp.rows; i++) {
				for (let j = 0; j < cp.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i % 100, j % 10), other.at(i % other.rows, j % other.cols)))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[120, 10],
			[100, 11],
		])('fail matrix(%i, %i)', (r, c) => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			const other = Matrix.map(Matrix.random(r, c, -1, 2), v => Math.floor(v))
			expect(() => mat[name](other)).toThrow('Broadcasting size invalid.')
		})

		test.each([0, 1, -1])('at %i', value => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			mat.set(1, 1, -1)
			mat.set(1, 2, 0)
			mat.set(1, 3, 1)
			const cp = mat.copy()
			for (let i = 1; i <= 3; i++) {
				cp[name + 'At'](1, i, value)
				expect(cp.at(1, i)).toBe(calc(mat.at(1, i), value))
			}
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === 1 && 1 <= j && j <= 3) {
						continue
					}
					expect(cp.at(i, j)).toBe(mat.at(i, j))
				}
			}
		})

		test.each([
			[-1, 0],
			[0, -1],
			[100, 0],
			[0, 10],
		])('fail at(%i, %i)', (r, c) => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			expect(() => mat[name + 'At'](r, c, 2)).toThrow('Index out of bounds.')
		})

		test.each([0, 1, -1])('static (mat, number) %i', value => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			const cp = Matrix[name](mat, value)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(mat.at(i, j), value))
				}
			}
		})

		test.each([0, 1, -1])('static (number, mat) %i', value => {
			const mat = Matrix.map(Matrix.random(100, 10, -1, 2), v => Math.floor(v))
			const cp = Matrix[name](value, mat)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(cp.at(i, j)).toBe(calc(value, mat.at(i, j)))
				}
			}
		})

		test.each([
			[0, 0],
			[0, 1],
			[0, -1],
			[1, 0],
			[1, 1],
			[1, -1],
			[-1, 0],
			[-1, 1],
			[-1, -1],
		])('static (number, number) %i %i', (value1, value2) => {
			const cp = Matrix[name](value1, value2)
			expect(cp.sizes).toEqual([1, 1])
			expect(cp.at(0, 0)).toBe(calc(value1, value2))
		})
	})

	describe('dot', () => {
		test.each([
			[
				[0, 0],
				[0, 0],
				[0, 0],
			],
			[
				[1, 1],
				[1, 1],
				[1, 1],
			],
			[
				[3, 5],
				[5, 4],
				[3, 4],
			],
		])('a%p, b%p', (sa, sb, sc) => {
			const a = Matrix.randn(...sa)
			const b = Matrix.randn(...sb)
			const dot = a.dot(b)
			expect(dot.sizes).toEqual(sc)
			for (let i = 0; i < sc[0]; i++) {
				for (let j = 0; j < sc[1]; j++) {
					let v = 0
					for (let k = 0; k < sa[1]; k++) {
						v += a.at(i, k) * b.at(k, j)
					}
					expect(dot.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('sparce', () => {
			const a = Matrix.randn(20, 18)
			for (let i = 0; i < a.rows; i++) {
				const p = Math.floor(Math.random() * a.cols)
				for (let j = 0; j < a.cols; j++) {
					if (j !== p) {
						a.set(i, j, 0)
					}
				}
			}
			const b = Matrix.randn(18, 16)
			const dot = a.dot(b)
			expect(dot.sizes).toEqual([a.rows, b.cols])
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					let v = 0
					for (let k = 0; k < a.cols; k++) {
						v += a.at(i, k) * b.at(k, j)
					}
					expect(dot.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('zeros', () => {
			const a = Matrix.zeros(20, 18)
			const b = Matrix.randn(18, 16)
			const dot = a.dot(b)
			expect(dot.sizes).toEqual([a.rows, b.cols])
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(dot.at(i, j)).toBe(0)
				}
			}
		})

		test('fail', () => {
			const a = Matrix.randn(4, 10)
			const b = Matrix.randn(4, 6)
			expect(() => a.dot(b)).toThrow('Dot size invalid.')
		})
	})

	describe('tDot', () => {
		test.each([
			[
				[0, 0],
				[0, 0],
				[0, 0],
			],
			[
				[1, 1],
				[1, 1],
				[1, 1],
			],
			[
				[5, 3],
				[5, 4],
				[3, 4],
			],
		])('a%p, b%p', (sa, sb, sc) => {
			const a = Matrix.randn(...sa)
			const b = Matrix.randn(...sb)
			const tDot = a.tDot(b)
			expect(tDot.sizes).toEqual(sc)
			for (let i = 0; i < sc[0]; i++) {
				for (let j = 0; j < sc[1]; j++) {
					let v = 0
					for (let k = 0; k < sa[0]; k++) {
						v += a.at(k, i) * b.at(k, j)
					}
					expect(tDot.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('fail', () => {
			const a = Matrix.randn(10, 4)
			const b = Matrix.randn(4, 6)
			expect(() => a.tDot(b)).toThrow('tDot size invalid.')
		})
	})

	test('kron', () => {
		const a = Matrix.randn(2, 3)
		const b = Matrix.randn(2, 3)
		const kron = a.kron(b)
		expect(kron.sizes).toEqual([4, 9])
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 9; j++) {
				expect(kron.at(i, j)).toBeCloseTo(a.at(Math.floor(i / 2), Math.floor(j / 3)) * b.at(i % 2, j % 3))
			}
		}
	})

	describe('convolute', () => {
		test('normalized', () => {
			const r = 10
			const c = 5
			const org = Matrix.randn(r, c)
			const mat = org.copy()
			const kernel = [
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
			]
			mat.convolute(kernel)

			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					let v = 0
					let count = 0
					for (let s = Math.max(0, i - 1); s <= Math.min(r - 1, i + 1); s++) {
						for (let t = Math.max(0, j - 1); t <= Math.min(c - 1, j + 1); t++) {
							count += kernel[s - i + 1][t - j + 1]
							v += org.at(s, t) * kernel[s - i + 1][t - j + 1]
						}
					}
					expect(mat.at(i, j)).toBeCloseTo(v / count)
				}
			}
		})

		test('not normalized', () => {
			const r = 10
			const c = 5
			const org = Matrix.randn(r, c)
			const mat = org.copy()
			const kernel = [
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
			]
			mat.convolute(kernel, false)

			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					let v = 0
					for (let s = Math.max(0, i - 1); s <= Math.min(r - 1, i + 1); s++) {
						for (let t = Math.max(0, j - 1); t <= Math.min(c - 1, j + 1); t++) {
							v += org.at(s, t) * kernel[s - i + 1][t - j + 1]
						}
					}
					expect(mat.at(i, j)).toBeCloseTo(v)
				}
			}
		})
	})

	describe('reducedRowEchelonForm', () => {
		test('regular default tol', () => {
			const mat = new Matrix(2, 2, [
				[1, 2],
				[3, 4],
			])
			mat.reducedRowEchelonForm()

			expect(mat.at(0, 0)).toBe(1)
			expect(mat.at(0, 1)).toBe(0)
			expect(mat.at(1, 0)).toBe(0)
			expect(mat.at(1, 1)).toBe(1)
		})

		test('not regular', () => {
			const r = 4
			const c = 5
			const org = Matrix.randn(r, c)
			for (let i = 0; i < c; i++) {
				org.set(r - 3, i, org.at(r - 2, i))
			}
			const mat = org.copy()
			mat.reducedRowEchelonForm(1.0e-12)

			for (let i = 0; i < r - 1; i++) {
				for (let j = 0; j < r - 1; j++) {
					expect(mat.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
			for (let j = 0; j < c; j++) {
				expect(mat.at(r - 1, j)).toBeCloseTo(0)
			}
		})

		test('all element 0', () => {
			const mat = new Matrix(2, 2, 0)
			mat.reducedRowEchelonForm()
			for (let i = 0; i < mat.length; i++) {
				expect(mat.value[i]).toBe(0)
			}
		})

		test.todo('tol')
	})

	describe('inv', () => {
		test.each([0, 1, 2, 3, 10])('symmetric sizes[%i]', n => {
			const mat = Matrix.randn(n, n).gram()
			const inv = mat.inv()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([0, 1, 2, 3, 10])('upper triangular[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.inv()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([0, 1, 2, 3, 10])('lower triangular[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.inv()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.inv()).toThrow('Inverse matrix only define square matrix.')
		})
	})

	describe('invLowerTriangular', () => {
		test.each([0, 1, 2, 3, 10])('sizes[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.invLowerTriangular()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invLowerTriangular()).toThrow('Inverse matrix only define square matrix.')
		})
	})

	describe('invUpperTriangular', () => {
		test.each([0, 1, 2, 3, 10])('sizes[%i]', n => {
			const mat = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					mat.set(i, j, 0)
				}
			}
			const inv = mat.invUpperTriangular()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invUpperTriangular()).toThrow('Inverse matrix only define square matrix.')
		})
	})

	describe('invRowReduction', () => {
		test.each([0, 1, 2, 3, 10])('symmetric sizes[%i]', n => {
			const mat = Matrix.randn(n, n).gram()
			const inv = mat.invRowReduction()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('pivot', () => {
			const mat = Matrix.randn(5, 5).gram()
			mat.set(0, 0, 0)
			const inv = mat.invRowReduction()

			const eye = mat.dot(inv)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invRowReduction()).toThrow('Inverse matrix only define square matrix.')
		})

		test('fail with matrix of zeros', () => {
			const mat = Matrix.zeros(2, 2)
			expect(() => mat.invRowReduction()).toThrow()
		})
	})

	describe('invLU', () => {
		test.each([0, 1, 2, 3, 10])('symmetric sizes[%i]', n => {
			const mat = Matrix.randn(n, n).gram()
			const inv = mat.invLU()

			const eye = mat.dot(inv)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.invLU()).toThrow('Inverse matrix only define square matrix.')
		})
	})

	describe('pseudoInv', () => {
		test.each([
			[0, 0],
			[1, 1],
			[1, 5],
			[5, 1],
			[2, 2],
			[5, 5],
			[2, 3],
			[3, 2],
		])('size[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const inv = mat.pseudoInv()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})

		test.each([
			[1, 1],
			[1, 5],
			[5, 1],
			[2, 2],
		])('zeros size[%i, %i]', (r, c) => {
			const mat = Matrix.zeros(r, c)
			const inv = mat.pseudoInv()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})

		test('zero det[2, 2]', () => {
			const r = 2
			const c = 2
			const mat = new Matrix(r, c, [1, 2, 2, 4])
			const inv = mat.pseudoInv()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})
	})

	describe('pseudoInvNaive', () => {
		test.each([
			[2, 2],
			[5, 5],
			[2, 3],
			[3, 2],
		])('size[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const inv = mat.pseudoInvNaive()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})
	})

	describe('pseudoInvQR', () => {
		test.each([
			[2, 2],
			[5, 5],
			[2, 3],
			[3, 2],
		])('size[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const inv = mat.pseudoInvQR()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})
	})

	describe('pseudoInvSVD', () => {
		test.each([
			[2, 2],
			[5, 5],
			[2, 3],
			[3, 2],
		])('size[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const inv = mat.pseudoInvSVD()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})

		test('zero sv', () => {
			const r = 2
			const c = 2
			const mat = new Matrix(r, c, [1, 2, 2, 4])
			const inv = mat.pseudoInvSVD()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})
	})

	describe('pseudoInvBenIsraelCohen', () => {
		test.each([
			[2, 2],
			[5, 5],
			[2, 3],
			[3, 2],
		])('size[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const inv = mat.pseudoInvBenIsraelCohen()

			const aapa = mat.dot(inv).dot(mat)
			const apaap = inv.dot(mat).dot(inv)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(aapa.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(apaap.at(j, i)).toBeCloseTo(inv.at(j, i))
				}
			}
			const aap = mat.dot(inv)
			expect(aap.sizes).toEqual([r, r])
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(aap.at(i, j)).toBeCloseTo(aap.at(j, i))
				}
			}
			const apa = inv.dot(mat)
			expect(apa.sizes).toEqual([c, c])
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(apa.at(i, j)).toBeCloseTo(apa.at(j, i))
				}
			}
		})
	})

	describe('sqrt', () => {
		test('empty', () => {
			const mat = Matrix.randn(0, 0)
			const sqrt = mat.sqrt()
			expect(sqrt).toBe(mat)
		})

		test('diag', () => {
			const n = 5
			const mat = Matrix.diag(Matrix.randn(n, 1).value.map(Math.abs))
			const sqrt = mat.sqrt()

			for (let i = 0; i < n; i++) {
				expect(sqrt.at(i, i)).toBeCloseTo(Math.sqrt(mat.at(i, i)))
			}

			const sqrt2 = sqrt.dot(sqrt)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(sqrt2.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
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

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.sqrt()).toThrow('sqrt only define square matrix.')
		})
	})

	describe('power', () => {
		test('0', () => {
			const n = 10
			const mat = Matrix.randn(n, n)
			const pow = mat.power(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(pow.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
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
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
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
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
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
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0, 1)
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
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
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

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.power(2)).toThrow('Only square matrix can power.')
		})

		test('fail not int', () => {
			const mat = Matrix.randn(3, 3)
			expect(() => mat.power(2.3)).toThrow('Power only defined integer.')
		})
	})

	describe('exp', () => {
		test('diag', () => {
			const mat = Matrix.diag(Matrix.randn(5, 1).value)
			const exp = mat.exp()

			for (let i = 0; i < mat.rows; i++) {
				expect(exp.at(i, i)).toBeCloseTo(Math.exp(mat.at(i, i)))
			}
			expect(exp.det()).toBeCloseTo(Math.exp(mat.trace()))
		})

		test('one', () => {
			const mat = Matrix.randn(1, 1)
			const exp = mat.exp()

			expect(exp.at(0, 0)).toBeCloseTo(Math.exp(mat.at(0, 0)))
			expect(exp.det()).toBeCloseTo(Math.exp(mat.trace()))
		})

		test.each([2, 3, 10])('%i', n => {
			const mat = Matrix.randn(n, n)
			const exp = mat.exp()

			expect(exp.det()).toBeCloseTo(Math.exp(mat.trace()))
		})

		test('fail not square', () => {
			const mat = Matrix.randn(3, 4)
			expect(() => mat.exp()).toThrow('Only square matrix can exp.')
		})
	})

	describe('log', () => {
		test('diag', () => {
			const mat = Matrix.diag(Matrix.random(5, 1).value)
			const log = mat.log()

			for (let i = 0; i < mat.rows; i++) {
				expect(log.at(i, i)).toBeCloseTo(Math.log(mat.at(i, i)))
			}
			expect(log.trace()).toBeCloseTo(Math.log(mat.det()))
		})

		test('one', () => {
			const mat = Matrix.random(1, 1)
			const log = mat.log()

			expect(log.at(0, 0)).toBeCloseTo(Math.log(mat.at(0, 0)))
			expect(log.trace()).toBeCloseTo(Math.log(mat.det()))
		})

		test.each([2, 3, 10])('%i', n => {
			const mat = Matrix.randn(n, n).gram()
			const log = mat.log()

			expect(log.trace()).toBeCloseTo(Math.log(mat.det()))
		})

		test('fail not square', () => {
			const mat = Matrix.randn(3, 4)
			expect(() => mat.log()).toThrow('Only square matrix can log.')
		})
	})

	describe('cov', () => {
		test('ddof 0', () => {
			const mat = Matrix.randn(100, 5, [1, 2, 3, 4, 5], 0.1)
			const cov = mat.cov()
			expect(cov.sizes).toEqual([5, 5])

			const d = Matrix.sub(mat, mat.mean(0))
			const c = d.tDot(d)
			c.div(mat.rows)
			for (let i = 0; i < 5; i++) {
				for (let j = 0; j < 5; j++) {
					expect(cov.at(i, j)).toBeCloseTo(c.at(i, j))
				}
			}
		})

		test('ddof 1', () => {
			const mat = Matrix.randn(100, 5, [1, 2, 3, 4, 5], 0.1)
			const cov = mat.cov(1)
			expect(cov.sizes).toEqual([5, 5])

			const d = Matrix.sub(mat, mat.mean(0))
			const c = d.tDot(d)
			c.div(mat.rows - 1)
			for (let i = 0; i < 5; i++) {
				for (let j = 0; j < 5; j++) {
					expect(cov.at(i, j)).toBeCloseTo(c.at(i, j))
				}
			}
		})
	})

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

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 4)
			const b = Matrix.randn(10, 1)
			expect(() => a.solve(b)).toThrow('Only square matrix or matrix with more columns than rows can be solved.')
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(3, 4)
			const b = Matrix.randn(4, 1)
			expect(() => a.solve(b)).toThrow('b size is invalid.')
		})
	})

	describe('solveLowerTriangular', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					x.set(i, j, 0)
				}
			}
			const b = Matrix.randn(n, 1)

			const a = x.solveLowerTriangular(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.each([[4, 5]])('success %i,%i', (r, c) => {
			const x = Matrix.randn(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = i + 1; j < c; j++) {
					x.set(i, j, 0)
				}
			}
			const b = Matrix.randn(r, 1)

			const a = x.solveLowerTriangular(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 9)
			const b = Matrix.randn(10, 1)
			expect(() => a.solveLowerTriangular(b)).toThrow(
				'Matrix that column rank is less than row rank can not solve.'
			)
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(3, 1)
			expect(() => a.solveLowerTriangular(b)).toThrow('b size is invalid.')
		})
	})

	describe('solveUpperTriangular', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					x.set(i, j, 0)
				}
			}
			const b = Matrix.randn(n, 1)

			const a = x.solveUpperTriangular(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.each([[4, 5]])('success %i,%i', (r, c) => {
			const x = Matrix.randn(r, c)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < i; j++) {
					x.set(i, j, 0)
				}
			}
			const b = Matrix.randn(r, 1)

			const a = x.solveUpperTriangular(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 9)
			const b = Matrix.randn(10, 1)
			expect(() => a.solveUpperTriangular(b)).toThrow(
				'Matrix that column rank is less than row rank can not solve.'
			)
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(3, 1)
			expect(() => a.solveUpperTriangular(b)).toThrow('b size is invalid.')
		})
	})

	describe('solveJacobi', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			x.add(Matrix.eye(n, n, 100))
			const b = Matrix.randn(n, 1)

			const a = x.solveJacobi(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.each([0, 1, 5])('excessive columns (%i)', n => {
			const x = Matrix.randn(n, n)
			x.add(Matrix.eye(n, n, 100))
			const b = Matrix.randn(n, 1 + Math.floor(Math.random() * 10))

			const a = x.solveJacobi(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 4)
			const b = Matrix.randn(10, 1)
			expect(() => a.solveJacobi(b)).toThrow('solveJacobi only define square matrix.')
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(3, 3)
			const b = Matrix.randn(4, 1)
			expect(() => a.solveJacobi(b)).toThrow('b size is invalid.')
		})

		test('fail can not calculate', () => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(4, 1)
			expect(() => a.solveJacobi(b)).toThrow('Can not calculate solved value.')
		})
	})

	describe('solveGaussSeidel', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			x.add(Matrix.eye(n, n, 100))
			const b = Matrix.randn(n, 1)

			const a = x.solveGaussSeidel(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.each([0, 1, 5])('excessive columns (%i)', n => {
			const x = Matrix.randn(n, n)
			x.add(Matrix.eye(n, n, 100))
			const b = Matrix.randn(n, 1 + Math.floor(Math.random() * 10))

			const a = x.solveGaussSeidel(b)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 4)
			const b = Matrix.randn(10, 1)
			expect(() => a.solveGaussSeidel(b)).toThrow('solveGaussSeidel only define square matrix.')
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(3, 3)
			const b = Matrix.randn(4, 1)
			expect(() => a.solveGaussSeidel(b)).toThrow('b size is invalid.')
		})

		test('fail can not calculate', () => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(4, 1)
			expect(() => a.solveGaussSeidel(b)).toThrow('Can not calculate solved value.')
		})
	})

	describe('solveSOR', () => {
		test.each([0, 1, 5])('success %i', n => {
			const x = Matrix.randn(n, n)
			x.add(Matrix.eye(n, n, 100))
			const b = Matrix.randn(n, 1)

			const a = x.solveSOR(b, 0.8)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test.each([0, 1, 5])('excessive columns (%i)', n => {
			const x = Matrix.randn(n, n)
			x.add(Matrix.eye(n, n, 100))
			const b = Matrix.randn(n, 1 + Math.floor(Math.random() * 10))

			const a = x.solveSOR(b, 0.8)

			const t = x.dot(a)
			for (let i = 0; i < b.rows; i++) {
				for (let j = 0; j < b.cols; j++) {
					expect(t.at(i, j)).toBeCloseTo(b.at(i, j))
				}
			}
		})

		test('fail invalid columns', () => {
			const a = Matrix.randn(10, 4)
			const b = Matrix.randn(10, 1)
			expect(() => a.solveSOR(b, 0.8)).toThrow('solveSOR only define square matrix.')
		})

		test('fail invalid rows', () => {
			const a = Matrix.randn(3, 3)
			const b = Matrix.randn(4, 1)
			expect(() => a.solveSOR(b, 0.8)).toThrow('b size is invalid.')
		})

		test.each([-1, 0, 2, 3])('fail invalid w', w => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(4, 1)
			expect(() => a.solveSOR(b, w)).toThrow('w must be positive and less than 2.')
		})

		test('fail can not calculate', () => {
			const a = Matrix.randn(4, 4)
			const b = Matrix.randn(4, 1)
			expect(() => a.solveSOR(b, 0.8)).toThrow('Can not calculate solved value.')
		})
	})

	describe('bidiag', () => {
		test.each([
			[2, 3],
			[3, 2],
		])('[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const bidiag = mat.bidiag()
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test('[0,0] is positive', () => {
			const mat = Matrix.randn(3, 2)
			mat.set(0, 0, 1)
			const bidiag = mat.bidiag()
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test('[0,0] is negative', () => {
			const mat = Matrix.randn(3, 2)
			mat.set(0, 0, -1)
			const bidiag = mat.bidiag()
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}
		})
	})

	describe('bidiagHouseholder', () => {
		test.each([
			[2, 3],
			[3, 2],
		])('[%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const bidiag = mat.bidiagHouseholder()
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test('[0,0] is positive', () => {
			const mat = Matrix.randn(3, 2)
			mat.set(0, 0, 1)
			const bidiag = mat.bidiagHouseholder()
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test('[0,0] is negative', () => {
			const mat = Matrix.randn(3, 2)
			mat.set(0, 0, -1)
			const bidiag = mat.bidiagHouseholder()
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test('linear dependent', () => {
			const n = 2
			const mat = new Matrix(n, n, [1, 2, 2, 4])
			const bidiag = mat.bidiagHouseholder()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('return uv [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const [bidiag, uh, vh] = mat.bidiagHouseholder(true)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					if (i === j || i + 1 === j) {
						continue
					}
					expect(bidiag.at(i, j)).toBeCloseTo(0)
				}
			}

			const [, v] = mat.svd()
			const a = bidiag.dot(bidiag.adjoint())
			for (let i = 0; i < v.length; i++) {
				const s = Matrix.sub(a, Matrix.eye(a.rows, a.cols, v[i] ** 2))
				expect(s.det()).toBeCloseTo(0)
			}

			const uu = uh.tDot(uh)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < r; j++) {
					expect(uu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
			const vv = vh.tDot(vh)
			for (let i = 0; i < c; i++) {
				for (let j = 0; j < c; j++) {
					expect(vv.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
			const uav = uh.tDot(mat).dot(vh)
			const ubv = uh.dot(bidiag).dot(vh.t)
			for (let i = 0; i < r; i++) {
				for (let j = 0; j < c; j++) {
					expect(uav.at(i, j)).toBeCloseTo(bidiag.at(i, j))
					expect(ubv.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})
	})

	describe('tridiag', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const tridiag = mat.tridiag()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
				for (let j = i + 2; j < n; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
			}
			for (let i = 0; i < n - 1; i++) {
				expect(tridiag.at(i, i + 1)).toBeCloseTo(tridiag.at(i + 1, i))
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = Matrix.sub(tridiag, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[3, 3],
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.tridiag()).toThrow('Tridiagonal only define symmetric matrix.')
		})
	})

	describe('tridiagHouseholder', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const tridiag = mat.tridiagHouseholder()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
				for (let j = i + 2; j < n; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
			}
			for (let i = 0; i < n - 1; i++) {
				expect(tridiag.at(i, i + 1)).toBeCloseTo(tridiag.at(i + 1, i))
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = Matrix.sub(tridiag, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[3, 3],
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.tridiagHouseholder()).toThrow('Tridiagonal only define symmetric matrix.')
		})

		test.each([2, 5])('return u %i', n => {
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const [tridiag, uh] = mat.tridiagHouseholder(true)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
				for (let j = i + 2; j < n; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
			}
			for (let i = 0; i < n - 1; i++) {
				expect(tridiag.at(i, i + 1)).toBeCloseTo(tridiag.at(i + 1, i))
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = Matrix.sub(tridiag, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}

			const uu = uh.tDot(uh)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(uu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
			const umu = uh.tDot(mat).dot(uh)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(umu.at(i, j)).toBeCloseTo(tridiag.at(i, j))
				}
			}
		})
	})

	describe('tridiagLanczos', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const tridiag = mat.tridiagLanczos()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
				for (let j = i + 2; j < n; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
			}
			for (let i = 0; i < n - 1; i++) {
				expect(tridiag.at(i, i + 1)).toBeCloseTo(tridiag.at(i + 1, i))
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = Matrix.sub(tridiag, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([9])('k %i', k => {
			const n = 10
			const mat = Matrix.randn(n, n, 0, 0.1).gram()
			const tridiag = mat.tridiagLanczos(k)
			expect(tridiag.sizes).toEqual([k, k])
			for (let i = 0; i < k; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
				for (let j = i + 2; j < k; j++) {
					expect(tridiag.at(i, j)).toBeCloseTo(0)
				}
			}
			for (let i = 0; i < k - 1; i++) {
				expect(tridiag.at(i, i + 1)).toBeCloseTo(tridiag.at(i + 1, i))
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = Matrix.sub(tridiag, Matrix.eye(k, k, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[3, 3],
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.tridiagLanczos()).toThrow('Tridiagonal only define symmetric matrix.')
		})
	})

	describe('hessenberg', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const hessenberg = mat.hessenberg()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = Matrix.sub(hessenberg, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([2, 3, 5])('not symmetric %i', n => {
			const mat = Matrix.randn(n, n)
			const hessenberg = mat.hessenberg()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				if (isNaN(orgeig[i])) {
					continue
				}
				const s = Matrix.sub(hessenberg, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.hessenberg()).toThrow('Hessenberg only define square matrix.')
		})
	})

	describe('hessenbergArnoldi', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const hessenberg = mat.hessenbergArnoldi()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const s = Matrix.sub(hessenberg, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([2, 3, 5])('not symmetric %i', n => {
			const mat = Matrix.randn(n, n)
			const hessenberg = mat.hessenbergArnoldi()
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}

			const orgeig = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				if (isNaN(orgeig[i])) {
					continue
				}
				const s = Matrix.sub(hessenberg, Matrix.eye(n, n, orgeig[i]))
				expect(s.det()).toBeCloseTo(0)
			}
		})

		test.each([4])('k %i', k => {
			const n = 5
			const mat = Matrix.randn(n, n).gram()
			const hessenberg = mat.hessenbergArnoldi(k)
			expect(hessenberg.sizes).toEqual([k, k])
			for (let i = 0; i < k; i++) {
				for (let j = 0; j < i - 1; j++) {
					expect(hessenberg.at(i, j)).toBeCloseTo(0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.hessenbergArnoldi()).toThrow('Hessenberg only define square matrix.')
		})
	})

	describe('balancing', () => {
		test.each([1, 2, 3, 4])('square %d', n => {
			const mat = Matrix.random(n, n, 0.1, 10)
			const [d1, a, d2] = mat.balancing()

			expect(a.sizes).toEqual([n, n])
			expect(d1).toHaveLength(n)
			expect(d2).toHaveLength(n)
			const s0 = a.sum(0).value
			const s1 = a.sum(1).value
			for (let i = 0; i < n; i++) {
				expect(s0[i]).toBeCloseTo(1)
				expect(s1[i]).toBeCloseTo(1)
			}

			const dad = Matrix.diag(d1).dot(a).dot(Matrix.diag(d2))
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(dad.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test('fail neg value', () => {
			const mat = Matrix.randn(3, 3)
			mat.set(0, 0, -0.1)
			expect(() => mat.balancing()).toThrow('Doubly stochastic matrix only calculate for non negative matrix.')
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.balancing()).toThrow('Doubly stochastic matrix only defined for square matrix.')
		})
	})

	describe('balancingSinkhornKnopp', () => {
		test.each([1, 2, 3, 4])('square %d', n => {
			const mat = Matrix.random(n, n, 0.1, 10)
			const [d1, a, d2] = mat.balancingSinkhornKnopp()

			expect(a.sizes).toEqual([n, n])
			expect(d1).toHaveLength(n)
			expect(d2).toHaveLength(n)
			const s0 = a.sum(0).value
			const s1 = a.sum(1).value
			for (let i = 0; i < n; i++) {
				expect(s0[i]).toBeCloseTo(1)
				expect(s1[i]).toBeCloseTo(1)
			}

			const dad = Matrix.diag(d1).dot(a).dot(Matrix.diag(d2))
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(dad.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test('fail neg value', () => {
			const mat = Matrix.randn(3, 3)
			mat.set(0, 0, -0.1)
			expect(() => mat.balancingSinkhornKnopp()).toThrow(
				'Doubly stochastic matrix only calculate for non negative matrix.'
			)
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.balancingSinkhornKnopp()).toThrow(
				'Doubly stochastic matrix only defined for square matrix.'
			)
		})
	})

	describe('lu', () => {
		test.each([0, 1, 2, 3, 5])('success %i', n => {
			const mat = Matrix.randn(n, n)
			const [l, u] = mat.lu()

			const res = l.dot(u)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(u.at(i, j)).toBeCloseTo(0)
				}
				expect(l.at(i, i)).toBeCloseTo(1)
				for (let j = i + 1; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(l.at(i, j)).toBeCloseTo(0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.lu()).toThrow('LU decomposition only define square matrix.')
		})
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
				}
				for (let j = 0; j < i && j < cols; j++) {
					expect(r.at(i, j)).toBeCloseTo(0)
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < rows; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('success [10, 1]', () => {
			const rows = 10
			const cols = 1
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qr()
			expect(q.sizes).toEqual([rows, cols])
			expect(r.sizes).toEqual([cols, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = 0; j < i && i < cols; j++) {
					expect(r.at(i, j)).toBeCloseTo(0)
				}
			}

			const eye = q.tDot(q)
			expect(eye.at(0, 0)).toBeCloseTo(1)
		})
	})

	describe('qrGramSchmidt', () => {
		test.each([
			// [1, 10],
			[10, 1],
			[10, 10],
			[10, 7],
			// [7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qrGramSchmidt()
			expect(q.sizes).toEqual([rows, cols])
			expect(r.sizes).toEqual([cols, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = 0; j < i && i < cols; j++) {
					expect(r.at(i, j)).toBeCloseTo(0)
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < cols; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('zeros row', () => {
			const rows = 2
			const cols = 2
			const mat = new Matrix(rows, cols, [0, 1, 0, 0])
			const [q, r] = mat.qrGramSchmidt()
			expect(q.sizes).toEqual([rows, cols])
			expect(r.sizes).toEqual([cols, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = 0; j < i && i < cols; j++) {
					expect(r.at(i, j)).toBeCloseTo(0)
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < cols; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j && i === 1 ? 1 : 0)
				}
			}
		})
	})

	describe('qrHouseholder', () => {
		test.each([
			[0, 0],
			[1, 10],
			[10, 1],
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [q, r] = mat.qrHouseholder()
			expect(q.sizes).toEqual([rows, rows])
			expect(r.sizes).toEqual([rows, cols])

			const res = q.dot(r)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = 0; j < i && j < cols; j++) {
					expect(r.at(i, j)).toBeCloseTo(0)
				}
			}

			const eye = q.tDot(q)
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < rows; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})
	})

	describe('singularValues', () => {
		test.each([
			[10, 6],
			[6, 10],
		])('size [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const sv = mat.singularValues()
			expect(sv).toHaveLength(r)
			expect(sv[0]).toBeGreaterThanOrEqual(0)
			for (let i = 1; i < r; i++) {
				expect(sv[i]).toBeGreaterThanOrEqual(0)
				expect(sv[i]).toBeLessThanOrEqual(sv[i - 1])
			}
			expect(sv.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mat.dot(mat.t).det())
			expect(sv.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mat.dot(mat.t).trace())
		})

		test('almost zero but neg', () => {
			const mat = new Matrix(5, 3, [
				[1.5, -1.2, -0.1],
				[-0.2, 0, 0.1],
				[1.3, -0.1, -1.8],
				[1.8, 0.9, -0.4],
				[0.2, -1.2, -1.4],
			])
			const sv = mat.singularValues()
			expect(sv).toHaveLength(5)
			expect(sv[0]).toBeGreaterThanOrEqual(0)
			for (let i = 1; i < 2; i++) {
				expect(sv[i]).toBeGreaterThanOrEqual(0)
				expect(sv[i]).toBeLessThanOrEqual(sv[i - 1])
			}
			expect(sv.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mat.dot(mat.t).det())
			expect(sv.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mat.dot(mat.t).trace())
		})
	})

	describe('singularValuePowerIteration', () => {
		test.each([
			[10, 6],
			[6, 10],
		])('size [%i, %i]', (r, c) => {
			const mat = Matrix.randn(r, c)
			const sv = mat.singularValuePowerIteration()
			expect(sv).toBeGreaterThanOrEqual(0)

			const [ev] = mat.tDot(mat).eigenPowerIteration()
			expect(sv ** 2).toBeCloseTo(ev)
		})

		test('iteration not converged', () => {
			const mat = new Matrix(2, 2, [
				[-1, -2],
				[2, -2],
			])
			expect(() => mat.singularValuePowerIteration(1)).toThrow('singularValuePowerIteration not converged.')
		})
	})

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

			const mm = rows > cols ? mat.tDot(mat) : mat.dot(mat.t)
			expect(d.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mm.det())
			expect(d.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mm.trace())

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
					expect(eyeu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})
	})

	describe('svdEigen', () => {
		test.each([
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [u, d, v] = mat.svdEigen()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const mm = rows > cols ? mat.tDot(mat) : mat.dot(mat.t)
			expect(d.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mm.det())
			expect(d.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mm.trace())

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
					expect(eyeu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([[3, 2]])('some 0 [%i %i]', (rows, cols) => {
			const mat = new Matrix(rows, cols, [1, 2, 2, 4, 3, 6])
			const [u, d, v] = mat.svdEigen()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const mm = rows > cols ? mat.tDot(mat) : mat.dot(mat.t)
			expect(d.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mm.det())
			expect(d.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mm.trace())

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
					expect(eyeu.at(i, j)).toBeCloseTo(i === j && d[i] > 0 ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([[2, 3]])('some 0 [%i %i]', (rows, cols) => {
			const mat = new Matrix(rows, cols, [1, 1, 2, 2, 2, 4])
			const [u, d, v] = mat.svdEigen()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const mm = rows > cols ? mat.tDot(mat) : mat.dot(mat.t)
			expect(d.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mm.det())
			expect(d.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mm.trace())

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
					expect(eyeu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j && d[i] > 0 ? 1 : 0)
				}
			}
		})
	})

	describe('svdGolubKahan', () => {
		test.each([
			[10, 10],
			[10, 7],
			[7, 10],
		])('success [%i %i]', (rows, cols) => {
			const mat = Matrix.randn(rows, cols)
			const [u, d, v] = mat.svdGolubKahan()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const mm = rows > cols ? mat.tDot(mat) : mat.dot(mat.t)
			expect(d.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mm.det())
			expect(d.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mm.trace())

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
					expect(eyeu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('negative bidiag 0,0', () => {
			const rows = 3
			const cols = 3
			const mat = new Matrix(3, 3, [
				[1.5, 1.5, -1.6],
				[0.2, -0.2, -0.6],
				[0.8, -1.4, 1.2],
			])
			const [u, d, v] = mat.svdGolubKahan()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const mm = rows > cols ? mat.tDot(mat) : mat.dot(mat.t)
			expect(d.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mm.det())
			expect(d.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mm.trace())

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
					expect(eyeu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test('linear dependent', () => {
			const rows = 2
			const cols = 2
			const mat = new Matrix(rows, cols, [1, 2, 2, 4])
			const [u, d, v] = mat.svdGolubKahan()
			const minsize = Math.min(rows, cols)
			expect(u.sizes).toEqual([rows, minsize])
			expect(d).toHaveLength(minsize)
			expect(v.sizes).toEqual([cols, minsize])

			const mm = rows > cols ? mat.tDot(mat) : mat.dot(mat.t)
			expect(d.reduce((s, v) => s * v ** 2, 1)).toBeCloseTo(mm.det())
			expect(d.reduce((s, v) => s + v ** 2, 0)).toBeCloseTo(mm.trace())

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
					expect(eyeu.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					expect(eyev.at(i, j)).toBeCloseTo(i === j && i === 0 ? 1 : 0)
				}
			}
		})
	})

	describe('cholesky', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const chol = mat.cholesky()

			const res = chol.dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = i + 1; j < n; j++) {
					expect(chol.at(i, j)).toBeCloseTo(0, 1)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.cholesky()).toThrow('Cholesky decomposition only define symmetric matrix.')
		})
	})

	describe('choleskyGaussian', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const chol = mat.choleskyGaussian()

			const res = chol.dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = i + 1; j < n; j++) {
					expect(chol.at(i, j)).toBeCloseTo(0, 1)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.choleskyGaussian()).toThrow('Cholesky decomposition only define symmetric matrix.')
		})
	})

	describe('choleskyBanachiewicz', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const chol = mat.choleskyBanachiewicz()

			const res = chol.dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = i + 1; j < n; j++) {
					expect(chol.at(i, j)).toBeCloseTo(0, 1)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.choleskyBanachiewicz()).toThrow('Cholesky decomposition only define symmetric matrix.')
		})
	})

	describe('choleskyCrout', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const chol = mat.choleskyCrout()

			const res = chol.dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = i + 1; j < n; j++) {
					expect(chol.at(i, j)).toBeCloseTo(0, 1)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.choleskyCrout()).toThrow('Cholesky decomposition only define symmetric matrix.')
		})
	})

	describe('modifiedCholesky', () => {
		test('success', () => {
			const n = 10
			const mat = Matrix.randn(n, n).gram()
			const [chol, d] = mat.modifiedCholesky()

			const res = chol.dot(Matrix.diag(d)).dot(chol.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
				for (let j = i + 1; j < n; j++) {
					expect(chol.at(i, j)).toBeCloseTo(0, 1)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.modifiedCholesky()).toThrow(
				'Modified cholesky decomposition only define symmetric matrix.'
			)
		})
	})

	describe('schur', () => {
		test.each([0, 1, 2, 3, 4])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [q, u] = mat.schur()

			const res = q.dot(u).dot(q.t)
			const qq = q.dot(q.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(qq.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
				for (let j = 0; j < i; j++) {
					expect(u.at(i, j)).toBeCloseTo(0)
				}
			}
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const [q, u] = mat.schur()

			const res = q.dot(u).dot(q.t)
			const qq = q.dot(q.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(qq.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
				for (let j = 0; j < i; j++) {
					expect(u.at(i, j)).toBeCloseTo(0)
				}
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, u.at(i, i))
				}
				expect(cmat.det()).toBeCloseTo(0, 1)
			}
		})

		test.each([2, 5])('zeros %i', n => {
			const mat = Matrix.zeros(n, n)
			const [q, u] = mat.schur()

			const res = q.dot(u).dot(q.t)
			const qq = q.dot(q.t)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
					expect(qq.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
				for (let j = 0; j < i; j++) {
					expect(u.at(i, j)).toBeCloseTo(0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.schur()).toThrow('Schur decomposition only define square matrix.')
		})
	})

	describe('schurQR', () => {
		describe.each([undefined, 'no', 'single'])('%s shift', shift => {
			test.each([0, 1, 2, 3, 4])('symmetric %i', n => {
				const mat = Matrix.randn(n, n).gram()
				const [q, u] = mat.schurQR(shift)

				const res = q.dot(u).dot(q.t)
				const qq = q.tDot(q)
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
						expect(qq.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					}
					for (let j = 0; j < i; j++) {
						expect(u.at(i, j)).toBeCloseTo(0)
					}
					const cmat = mat.copy()
					for (let k = 0; k < n; k++) {
						cmat.subAt(k, k, u.at(i, i))
					}
					expect(cmat.det()).toBeCloseTo(0)
				}
			})

			test('non symmetric', () => {
				const n = 4
				const mat = new Matrix(4, 4, [
					[16, -1, 1, 2],
					[2, 12, 1, -1],
					[1, 3, -24, 2],
					[4, -2, 1, 20],
				])
				const [q, u] = mat.schurQR(shift)

				const res = q.dot(u).dot(q.t)
				const qq = q.dot(q.t)
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
						expect(qq.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					}
					for (let j = 0; j < i; j++) {
						expect(u.at(i, j)).toBeCloseTo(0)
					}
					const cmat = mat.copy()
					for (let k = 0; k < n; k++) {
						cmat.subAt(k, k, u.at(i, i))
					}
					expect(cmat.det()).toBeCloseTo(0, 1)
				}
			})

			test('non symmetric nan', () => {
				const n = 4
				const mat = new Matrix(4, 4, [
					[-0.4, -0.5, 0.2, -0.8],
					[-1, -0.2, -0.4, -0.5],
					[-0.6, 0, -0.2, 1],
					[-1.7, 0.5, -0.3, 1.4],
				])
				const [q, u] = mat.schurQR(shift)

				const res = q.dot(u).dot(q.t)
				const qq = q.dot(q.t)
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
						expect(qq.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					}
					for (let j = 0; j < i; j++) {
						expect(u.at(i, j)).toBeCloseTo(0)
					}
					const cmat = mat.copy()
					for (let k = 0; k < n; k++) {
						cmat.subAt(k, k, u.at(i, i))
					}
					expect(cmat.det()).toBeCloseTo(0, 1)
				}
			})

			test.each([2, 5])('zeros %i', n => {
				const mat = Matrix.zeros(n, n)
				const [q, u] = mat.schur(shift)

				const res = q.dot(u).dot(q.t)
				const qq = q.dot(q.t)
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < n; j++) {
						expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
						expect(qq.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
					}
					for (let j = 0; j < i; j++) {
						expect(u.at(i, j)).toBeCloseTo(0)
					}
				}
			})
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.schurQR()).toThrow('Schur decomposition only define square matrix.')
		})
	})

	describe('rankFactorization', () => {
		test('default', () => {
			const mat = Matrix.randn(7, 5)
			const [c, f] = mat.rankFactorization()

			expect(c.sizes).toEqual([7, 5])
			expect(f.sizes).toEqual([5, 5])
			const res = c.dot(f)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})

		test('low rank', () => {
			const mat = Matrix.randn(7, 5)
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < mat.cols; j++) {
					mat.set(i, j, mat.at(i + 3, j))
				}
			}
			const [c, f] = mat.rankFactorization()

			expect(c.sizes).toEqual([7, 4])
			expect(f.sizes).toEqual([4, 5])
			const res = c.dot(f)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					expect(res.at(i, j)).toBeCloseTo(mat.at(i, j))
				}
			}
		})
	})

	describe('eigen', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalues, eigvectors] = mat.eigen()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvectors.col(i))
				const y = Matrix.mult(eigvectors.col(i), eigvalues[i])
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([2, 5])('zeros %i', n => {
			const mat = Matrix.zeros(n, n)
			const [eigvalues, eigvectors] = mat.eigen()

			for (let i = 0; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBe(i === 0 ? 1 : 0)
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eigvectors.at(i, j)).toBeCloseTo(i > 0 && i === j ? 1 : 0)
				}
			}
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const [eigvalues, eigvectors] = mat.eigen()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvectors.col(i))
				const y = Matrix.mult(eigvectors.col(i), eigvalues[i])
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigen()).toThrow('Eigen values only define square matrix.')
		})
	})

	describe('eigenValues', () => {
		test.each([0, 1, 2, 3, 4, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValues()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test.each([2, 5])('zeros %i', n => {
			const mat = Matrix.zeros(n, n)
			const eigvalues = mat.eigenValues()

			for (let i = 0; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBe(i === 0 ? 1 : 0)
			}
		})

		test('non symmetric', () => {
			const mat = new Matrix(5, 5, [
				[16, -1, 1, 2, 4],
				[2, 12, 1, -1, 10],
				[1, 3, -24, 2, -4],
				[4, -2, 1, 20, 1],
				[-2, 2, 8, -1, 8],
			])
			const eigvalues = mat.eigenValues()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test('NaN 3', () => {
			const mat = new Matrix(3, 3, [
				[-1.5, -1, 1],
				[-0.5, 0.3, -1.8],
				[-0.3, -0.9, -1],
			])
			const eigvalues = mat.eigenValues()
			for (let i = 0; i < 1; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
			expect(eigvalues[1]).toBeNaN()
			expect(eigvalues[2]).toBeNaN()
		})

		test('NaN 4', () => {
			const mat = new Matrix(4, 4, [
				[0.3, 0.5, -2.8, -0.6],
				[-0.8, 1.2, -1.1, 1.4],
				[0.2, 0, 0.7, -0.8],
				[-0.3, 0, 0, 0],
			])
			const eigvalues = mat.eigenValues()
			for (let i = 0; i < 2; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
			expect(eigvalues[2]).toBeNaN()
			expect(eigvalues[3]).toBeNaN()
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValues()).toThrow('Eigen values only define square matrix.')
		})
	})

	describe('eigenVectors', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvectors = mat.eigenVectors()

			for (let i = 0; i < n; i++) {
				const x = mat.dot(eigvectors.col(i))
				x.div(eigvectors.col(i))
				for (let k = 1; k < n; k++) {
					expect(x.at(0, 0)).toBeCloseTo(x.at(k, 0))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([2, 5])('zeros %i', n => {
			const mat = Matrix.zeros(n, n)
			const eigvectors = mat.eigenVectors()

			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eigvectors.at(i, j)).toBeCloseTo(i > 0 && i === j ? 1 : 0)
				}
			}
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const eigvectors = mat.eigenVectors()

			for (let i = 0; i < n; i++) {
				const x = mat.dot(eigvectors.col(i))
				x.div(eigvectors.col(i))
				for (let k = 1; k < n; k++) {
					expect(x.at(0, 0)).toBeCloseTo(x.at(k, 0))
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenVectors()).toThrow('Eigen vectors only define square matrix.')
		})
	})

	describe('eigenValuesBiSection', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValuesBiSection()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValuesBiSection()).toThrow('eigenValuesBiSection can only use symmetric matrix.')
		})
	})

	describe('eigenValuesLR', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValuesLR()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test('non symmetric', () => {
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const eigvalues = mat.eigenValuesLR()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValuesLR()).toThrow('Eigen values only define square matrix.')
		})

		test('iteration not converged', () => {
			const mat = new Matrix(2, 2, [
				[-1, -2],
				[2, -2],
			])
			expect(() => mat.eigenValuesLR()).toThrow('eigenValuesLR not converged.')
		})
	})

	describe('eigenValuesQR', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const eigvalues = mat.eigenValuesQR()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test('non symmetric', () => {
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const eigvalues = mat.eigenValuesQR()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
		})

		test('some small ev is NaN', () => {
			const mat = new Matrix(5, 5, [
				[-0.2, -1.5, 1.4, -0.8, -1],
				[1.3, -0.3, 0, -1.5, 0.9],
				[-0.3, 0.4, -0.3, -0.3, -0.7],
				[0, -0.8, -1.4, -2.3, -0.1],
				[-0.9, 1.2, -0.1, -0.6, 1.2],
			])
			const eigvalues = mat.eigenValuesQR()
			expect(eigvalues[1]).toBeLessThanOrEqual(eigvalues[0])
			for (let i = 0; i < 2; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < mat.rows; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}
			expect(eigvalues[2]).toBeNaN()
			expect(eigvalues[3]).toBeNaN()
			expect(eigvalues[4]).toBeNaN()
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenValuesQR()).toThrow('Eigen values only define square matrix.')
		})

		test('iteration not converged', () => {
			const mat = new Matrix(3, 3, [
				[-0.3, -0.4, 1.7],
				[-0.2, -1.8, -0.8],
				[-0.9, 0.5, -0.5],
			])
			expect(() => mat.eigenValuesQR(1)).toThrow('eigenValuesQR not converged.')
		})
	})

	describe('eigenJacobi', () => {
		test.each([0, 1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalues, eigvectors] = mat.eigenJacobi()

			for (let i = 1; i < eigvalues.length; i++) {
				expect(eigvalues[i]).toBeLessThanOrEqual(eigvalues[i - 1])
			}
			for (let i = 0; i < eigvalues.length; i++) {
				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalues[i])
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvectors.col(i))
				const y = Matrix.mult(eigvectors.col(i), eigvalues[i])
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					expect(eye.at(i, j)).toBeCloseTo(i === j ? 1 : 0)
				}
			}
		})

		test.each([
			[2, 3],
			[3, 2],
			[3, 3],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenJacobi()).toThrow('Jacobi method can only use symmetric matrix.')
		})

		describe('log mock', () => {
			let orgLog
			beforeAll(() => {
				orgLog = console.log
			})

			afterAll(() => {
				console.log = orgLog
			})

			test('not converged', () => {
				const mat = Matrix.randn(10, 10).gram()
				console.log = jest.fn()

				mat.eigenJacobi(1)
				const msg = console.log.mock.calls[0][0]
				expect(msg.constructor.name).toBe('MatrixException')
				expect(msg.message).toBe('eigenJacobi not converged.')
			})
		})
	})

	describe('eigenPowerIteration', () => {
		test.each([1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalue, eigvector] = mat.eigenPowerIteration()

			const cmat = mat.copy()
			for (let k = 0; k < n; k++) {
				cmat.subAt(k, k, eigvalue)
			}
			expect(cmat.det()).toBeCloseTo(0)

			const x = mat.dot(eigvector)
			const y = Matrix.mult(eigvector, eigvalue)
			for (let k = 0; k < n; k++) {
				expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
			}
			const eye = eigvector.tDot(eigvector)
			expect(eye.at(0, 0)).toBeCloseTo(1)
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const [eigvalue, eigvector] = mat.eigenPowerIteration()

			const cmat = mat.copy()
			for (let k = 0; k < n; k++) {
				cmat.subAt(k, k, eigvalue)
			}
			expect(cmat.det()).toBeCloseTo(0)

			const x = mat.dot(eigvector)
			const y = Matrix.mult(eigvector, eigvalue)
			for (let k = 0; k < n; k++) {
				expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
			}
			const eye = eigvector.tDot(eigvector)
			expect(eye.at(0, 0)).toBeCloseTo(1)
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenPowerIteration()).toThrow('Eigen vectors only define square matrix.')
		})

		test('iteration not converged', () => {
			const mat = new Matrix(2, 2, [
				[-1, -2],
				[2, -2],
			])
			expect(() => mat.eigenPowerIteration(1)).toThrow('eigenPowerIteration not converged.')
		})
	})

	describe('eigenSimultaneousIteration', () => {
		test.each([
			[1, 1],
			[2, 2],
			[5, 3],
		])('symmetric %i,%i', (n, k) => {
			const mat = Matrix.randn(n, n).gram()
			const [eigvalues, eigvectors] = mat.eigenSimultaneousIteration(k)

			for (let t = 0; t < k; t++) {
				const cmat = mat.copy()
				for (let i = 0; i < n; i++) {
					cmat.subAt(i, i, eigvalues[t])
				}
				expect(cmat.det()).toBeCloseTo(0)
			}

			const x = mat.dot(eigvectors)
			const y = Matrix.mult(eigvectors, new Matrix(1, k, eigvalues))
			for (let t = 0; t < k; t++) {
				for (let i = 0; i < n; i++) {
					expect(x.at(i, t)).toBeCloseTo(y.at(i, t))
				}
			}
			const eye = eigvectors.tDot(eigvectors)
			for (let t = 0; t < k; t++) {
				expect(eye.at(t, t)).toBeCloseTo(1)
			}
		})

		test('non symmetric', () => {
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			expect(() => mat.eigenSimultaneousIteration(1)).toThrow(
				'Simultaneous iteration method can only use symmetric matrix.'
			)
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenSimultaneousIteration(1)).toThrow(
				'Simultaneous iteration method can only use symmetric matrix.'
			)
		})

		test('iteration not converged', () => {
			const mat = new Matrix(2, 2, [
				[-1, 2],
				[2, -2],
			])
			expect(() => mat.eigenSimultaneousIteration(1, 1)).toThrow('eigenSimultaneousIteration not converged.')
		})
	})

	describe('eigenInverseIteration', () => {
		test.each([1, 2, 5])('symmetric %i', n => {
			const mat = Matrix.randn(n, n).gram()
			const ev = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const e = ev[i] - (ev[i] - (ev[i + 1] || ev[i] - 1)) / 4
				const [eigvalue, eigvector] = mat.eigenInverseIteration(e)

				expect(eigvalue).toBeCloseTo(ev[i])

				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalue)
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvector)
				const y = Matrix.mult(eigvector, eigvalue)
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
				const eye = eigvector.tDot(eigvector)
				expect(eye.at(0, 0)).toBeCloseTo(1)
			}
		})

		test('non symmetric', () => {
			const n = 4
			const mat = new Matrix(4, 4, [
				[16, -1, 1, 2],
				[2, 12, 1, -1],
				[1, 3, -24, 2],
				[4, -2, 1, 20],
			])
			const ev = mat.eigenValues()
			for (let i = 0; i < n; i++) {
				const e = ev[i] - (ev[i] - (ev[i + 1] || ev[i] - 1)) / 4
				const [eigvalue, eigvector] = mat.eigenInverseIteration(e)

				expect(eigvalue).toBeCloseTo(ev[i])

				const cmat = mat.copy()
				for (let k = 0; k < n; k++) {
					cmat.subAt(k, k, eigvalue)
				}
				expect(cmat.det()).toBeCloseTo(0)

				const x = mat.dot(eigvector)
				const y = Matrix.mult(eigvector, eigvalue)
				for (let k = 0; k < n; k++) {
					expect(x.at(k, 0)).toBeCloseTo(y.at(k, 0))
				}
				const eye = eigvector.tDot(eigvector)
				expect(eye.at(0, 0)).toBeCloseTo(1)
			}
		})

		test.each([
			[2, 3],
			[3, 2],
		])('fail(%i, %i)', (r, c) => {
			const mat = Matrix.randn(r, c)
			expect(() => mat.eigenInverseIteration()).toThrow('Eigen vectors only define square matrix.')
		})

		test('iteration not converged', () => {
			const mat = new Matrix(2, 2, [
				[-1, -2],
				[2, -2],
			])
			expect(() => mat.eigenInverseIteration(0, 1)).toThrow('eigenInverseIteration not converged.')
		})
	})
})

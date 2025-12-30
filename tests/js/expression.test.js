import { describe, expect, jest, test } from '@jest/globals'

jest.retryTimes(3)

import stringToFunction from '../../js/expression.js'

describe('operator', () => {
	describe.each([
		['+', v => v],
		['-', v => -v],
		['!', v => +!v],
	])('unary operator %s', (op, fn) => {
		test.each([
			[`${op}1`, {}, fn(1)],
			[`${op} 1`, {}, fn(1)],
			[`${op}0`, {}, fn(0)],
			[`${op} 0`, {}, fn(0)],
			[`${op}x`, { x: 2 }, fn(2)],
			[`${op} x`, { x: 2 }, fn(2)],
		])('"%s" env:%p', (expression, env, t) => {
			const fn = stringToFunction(expression)

			const result = fn(env)
			expect(result).toBe(t)
		})
	})

	describe.each([
		['||', (a, b) => +!!(a || b)],
		['&&', (a, b) => +!!(a && b)],
		['==', (a, b) => +(a === b)],
		['!=', (a, b) => +(a !== b)],
		['<', (a, b) => +(a < b)],
		['<=', (a, b) => +(a <= b)],
		['>', (a, b) => +(a > b)],
		['>=', (a, b) => +(a >= b)],
		['+', (a, b) => a + b],
		['-', (a, b) => a - b],
		['*', (a, b) => a * b],
		['/', (a, b) => a / b],
		['//', (a, b) => Math.floor(a / b)],
		['%', (a, b) => a % b],
		['^', (a, b) => a ** b],
	])('binary operator %s', (op, fn) => {
		test.each([
			[`1${op}2`, {}, fn(1, 2)],
			[`1 ${op} 2`, {}, fn(1, 2)],
			[`2${op}1`, {}, fn(2, 1)],
			[`2 ${op} 1`, {}, fn(2, 1)],
			[`0${op}1`, {}, fn(0, 1)],
			[`0 ${op} 1`, {}, fn(0, 1)],
			[`1${op}0`, {}, fn(1, 0)],
			[`1 ${op} 0`, {}, fn(1, 0)],
			[`1${op}1`, {}, fn(1, 1)],
			[`1 ${op} 1`, {}, fn(1, 1)],
			[`0${op}0`, {}, fn(0, 0)],
			[`0 ${op} 0`, {}, fn(0, 0)],
			[`1${op}x`, { x: 2 }, fn(1, 2)],
			[`1 ${op} x`, { x: 2 }, fn(1, 2)],
			[`x${op}1`, { x: 2 }, fn(2, 1)],
			[`x ${op} 1`, { x: 2 }, fn(2, 1)],
			[`x${op}y`, { x: 2, y: 3 }, fn(2, 3)],
			[`x ${op} y`, { x: 2, y: 3 }, fn(2, 3)],
			[`4${op}2${op}1`, {}, fn(fn(4, 2), 1)],
			[`4 ${op} 2 ${op} 1`, {}, fn(fn(4, 2), 1)],
		])('"%s" env:%p', (expression, env, t) => {
			const fn = stringToFunction(expression)

			const result = fn(env)
			expect(result).toBe(t)
		})
	})

	test.each([
		[1, 2, 3, 2],
		[0, 2, 3, 3],
	])('ternary cond:%p,t:%p,f:%p', (c, t, f, r) => {
		const expression = `cond(${c}, ${t}, ${f})`
		const fn = stringToFunction(expression)

		const result = fn({})
		expect(result).toBe(r)
	})

	test.each([['*', '*']])('invalid operation %s', (expression, token) => {
		expect(() => stringToFunction(expression)).toThrow(`Invalid operation '${token}'.`)
	})
})

describe('function', () => {
	describe.each([
		['abs', v => Math.abs(v)],
		['ceil', v => Math.ceil(v)],
		['floor', v => Math.floor(v)],
		['round', v => Math.round(v)],
		['sqrt', v => Math.sqrt(v)],
		['cbrt', v => Math.cbrt(v)],
		['sin', v => Math.sin(v)],
		['cos', v => Math.cos(v)],
		['tan', v => Math.tan(v)],
		['asin', v => Math.asin(v)],
		['acos', v => Math.acos(v)],
		['atan', v => Math.atan(v)],
		['tanh', v => Math.tanh(v)],
		['exp', v => Math.exp(v)],
		['log', v => Math.log(v)],
		['sign', v => Math.sign(v)],
	])('unary function %s', (op, fn) => {
		test.each([
			[`${op}(1)`, {}, fn(1)],
			[`${op}(1.1)`, {}, fn(1.1)],
			[`${op}(1.9)`, {}, fn(1.9)],
			[`${op}(0)`, {}, fn(0)],
			[`${op}(-1)`, {}, fn(-1)],
			[`${op}(x)`, { x: 2 }, fn(2)],
		])('"%s" env:%p', (expression, env, t) => {
			const fn = stringToFunction(expression)

			const result = fn(env)
			expect(result).toBe(t)
		})
	})

	test('rand', () => {
		const expression = 'rand()'
		const fn = stringToFunction(expression)

		const results = []
		for (let i = 0; i < 10000; i++) {
			const v = fn({})
			expect(v).toBeGreaterThanOrEqual(0)
			expect(v).toBeLessThan(1)
			results.push(v)
		}
		const mean = results.reduce((s, v) => s + v, 0) / results.length
		expect(mean).toBeCloseTo(0.5)
		const max = results.reduce((s, v) => Math.max(s, v), -Infinity)
		expect(max).toBeCloseTo(1)
		const min = results.reduce((s, v) => Math.min(s, v), Infinity)
		expect(min).toBeCloseTo(0)
	})

	test('randn', () => {
		const expression = 'randn()'
		const fn = stringToFunction(expression)

		const results = []
		for (let i = 0; i < 10000; i++) {
			const v = fn({})
			results.push(v)
		}
		const mean = results.reduce((s, v) => s + v, 0) / results.length
		expect(mean).toBeCloseTo(0, 1)
		const vari = results.reduce((s, v) => s + (v - mean) ** 2, 0) / results.length
		expect(vari).toBeCloseTo(1, 1)
	})
})

test.each([
	['pi', Math.PI],
	['e', Math.E],
])('constant %s', (name, t) => {
	const fn = stringToFunction(name)

	const result = fn({})
	expect(result).toBe(t)
})

test('unknown variable', () => {
	const fn = stringToFunction('x')

	const result = fn({})
	expect(result).toBe(0)
})

describe('comma', () => {
	test('expressio', () => {
		const expression = `cond(1, 1 + 2, 3 + 4)`
		const fn = stringToFunction(expression)

		const result = fn({})
		expect(result).toBe(3)
	})

	test.each([','])('invalid parenthesis %s', expression => {
		expect(() => stringToFunction(expression)).toThrow('Invalid parenthesis')
	})
})

describe('parenthesis', () => {
	test('change priority', () => {
		const fn = stringToFunction('3*(1+2)')

		const result = fn({})
		expect(result).toBe(9)
	})

	test.each([')'])('invalid parenthesis %s', expression => {
		expect(() => stringToFunction(expression)).toThrow('Invalid parenthesis')
	})
})

describe('subscription', () => {
	test.each([
		[[1, 2, 3], 0],
		[[1, 2, 3], 1],
		[[1, 2, 3], 2],
	])('arr:%p,idx:%p', (arr, i) => {
		const expression = `x[${i}]`
		const fn = stringToFunction(expression)

		const result = fn({ x: arr })
		expect(result).toBe(arr[i])
	})

	test('expression', () => {
		const fn = stringToFunction('x[1+2]')

		const result = fn({ x: [1, 2, 3, 4] })
		expect(result).toBe(4)
	})

	test.each([[']']])('invalid parenthesis %s', expression => {
		expect(() => stringToFunction(expression)).toThrow('Invalid parenthesis')
	})
})

import Tree from '../../../lib/util/tree.js'

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
			const childs = [new Tree(1), new Tree(2)]
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
		const childs = [new Tree(1), new Tree(2)]
		const tree = new Tree(null, childs)
		let i = 0
		for (const child of tree) {
			expect(child).toBe(childs[i++])
		}
	})

	test('at', () => {
		const childs = [new Tree(1), new Tree(2)]
		const tree = new Tree(null, childs)
		for (let i = 0; i < childs.length; i++) {
			expect(tree.at(i)).toBe(childs[i])
		}
	})

	test('push', () => {
		const child = new Tree(1)
		const tree = new Tree()
		tree.push(child)
		expect(tree).toHaveLength(1)
		expect(tree.at(0)).toBe(child)
	})

	describe('set', () => {
		test('success', () => {
			const childs = [new Tree(1), new Tree(2)]
			const child = new Tree(3)
			const tree = new Tree(null, childs)
			tree.set(1, child)
			expect(tree.at(0)).toBe(childs[0])
			expect(tree.at(1)).toBe(child)
			expect(tree.at(1)).not.toBe(childs[1])
		})

		test('success not tree', () => {
			const childs = [new Tree(1), new Tree(2)]
			const tree = new Tree(null, childs)
			tree.set(1, 3)
			expect(tree.at(0)).toBe(childs[0])
			expect(tree.at(1).value).toBe(3)
			expect(tree.at(1)).not.toBe(childs[1])
		})

		test.each([-1, 2])('ignore %i', i => {
			const childs = [new Tree(1), new Tree(2)]
			const child = new Tree(3)
			const tree = new Tree(null, childs)
			tree.set(i, child)
			expect(tree.at(0)).toBe(childs[0])
			expect(tree.at(1)).toBe(childs[1])
		})
	})

	describe('removeAt', () => {
		test('success', () => {
			const childs = [new Tree(1), new Tree(2)]
			const tree = new Tree(null, childs)
			tree.removeAt(0)
			expect(tree).toHaveLength(1)
			expect(tree.at(0)).toBe(childs[1])
		})

		test.each([-1, 2])('ignore %i', i => {
			const childs = [new Tree(1), new Tree(2)]
			const tree = new Tree(null, childs)
			tree.removeAt(i)
			expect(tree).toHaveLength(2)
		})
	})

	test('clear', () => {
		const childs = [new Tree(1), new Tree(2)]
		const tree = new Tree(null, childs)
		tree.clear()
		expect(tree).toHaveLength(0)
	})

	test('isLeaf', () => {
		const childs = [new Tree(1), new Tree(2)]
		const tree = new Tree(null, childs)
		expect(childs[0].isLeaf()).toBeTruthy()
		expect(childs[1].isLeaf()).toBeTruthy()
		expect(tree.isLeaf()).toBeFalsy()
	})

	test('isRoot', () => {
		const childs = [new Tree(1), new Tree(2)]
		const tree = new Tree(null, childs)
		expect(tree.isRoot()).toBeTruthy()
		expect(childs[0].isRoot()).toBeFalsy()
		expect(childs[1].isRoot()).toBeFalsy()
	})

	test('root', () => {
		const childs = [new Tree(1), new Tree(2)]
		const tree = new Tree(null, childs)
		expect(tree.root()).toBe(tree)
		expect(childs[0].root()).toBe(tree)
		expect(childs[1].root()).toBe(tree)
	})

	test('leafs', () => {
		const childs2 = [new Tree(3), new Tree(4)]
		const childs1 = [new Tree(1, childs2), new Tree(2)]
		const tree = new Tree(null, childs1)
		const leafs = tree.leafs()
		expect(leafs).toHaveLength(3)
		expect(leafs[0]).toBe(childs2[0])
		expect(leafs[1]).toBe(childs2[1])
		expect(leafs[2]).toBe(childs1[1])
	})

	test('leafValues', () => {
		const childs2 = [new Tree(3), new Tree(4)]
		const childs1 = [new Tree(1, childs2), new Tree(2)]
		const tree = new Tree(null, childs1)
		const leafValues = tree.leafValues()
		expect(leafValues).toHaveLength(3)
		expect(leafValues).toEqual([3, 4, 2])
	})

	test('leafCount', () => {
		const childs2 = [new Tree(3), new Tree(4)]
		const childs1 = [new Tree(1, childs2), new Tree(2)]
		const tree = new Tree(null, childs1)
		expect(tree.leafCount()).toBe(3)
	})

	test('forEach', () => {
		const childs2 = [new Tree(3), new Tree(4)]
		const childs1 = [new Tree(1, childs2), new Tree(2)]
		const tree = new Tree(null, childs1)

		const values = []
		tree.forEach(v => values.push(v))
		expect(values).toHaveLength(2)
		expect(values[0]).toBe(childs1[0])
		expect(values[1]).toBe(childs1[1])
	})

	test('scan', () => {
		const childs2 = [new Tree(3), new Tree(4)]
		const childs1 = [new Tree(1, childs2), new Tree(2)]
		const tree = new Tree(null, childs1)

		const values = []
		tree.scan(v => values.push(v))
		expect(values).toHaveLength(5)
		expect(values[0]).toBe(tree)
		expect(values[1]).toBe(childs1[0])
		expect(values[2]).toBe(childs2[0])
		expect(values[3]).toBe(childs2[1])
		expect(values[4]).toBe(childs1[1])
	})

	test('scanLeaf', () => {
		const childs2 = [new Tree(3), new Tree(4)]
		const childs1 = [new Tree(1, childs2), new Tree(2)]
		const tree = new Tree(null, childs1)

		const values = []
		tree.scanLeaf(v => values.push(v))
		expect(values).toHaveLength(3)
		expect(values[0]).toBe(childs2[0])
		expect(values[1]).toBe(childs2[1])
		expect(values[2]).toBe(childs1[1])
	})
})

/**
 * Tree class
 *
 * @property {*} value A value of this node.
 * @property {Tree[]} childs Children of this node.
 * @property {Tree} [parent] Parent of this node.
 */
export default class Tree {
	/**
	 * @param {*} value Value that have this node
	 * @param {Array<Tree>} [childs] Initial childten of this node
	 */
	constructor(value, childs) {
		this.value = value
		this.childs = childs?.concat() || []
		this.childs.forEach(c => (c.parent = this))
		this.parent = null
	}

	/**
	 * Number of the children.
	 *
	 * @type {number}
	 */
	get length() {
		return this.childs.length
	}

	/**
	 * Depth of the tree.
	 *
	 * @type {number}
	 */
	get depth() {
		return this.isLeaf()
			? 1
			: 1 +
					Math.max.apply(
						null,
						this.childs.map(c => c.depth)
					)
	}

	/**
	 * Iterate over the children.
	 *
	 * @yields {Tree}
	 */
	*[Symbol.iterator]() {
		yield* this.childs
	}

	/**
	 * Returns the child at the index.
	 *
	 * @param {number} index Index
	 * @returns {Tree} Child at the index.
	 */
	at(index) {
		return this.childs[index]
	}

	/**
	 * Add a value to the child.
	 *
	 * @param {* | Tree} value Child node or its value
	 */
	push(value) {
		value = value instanceof Tree ? value : new Tree(value)
		this.childs.push(value)
		value.parent = this
	}

	/**
	 * Set a value of the child at the index.
	 *
	 * @param {number} index Where to set a child node
	 * @param {* | Tree} value Child node or its value
	 */
	set(index, value) {
		if (index < 0 || this.childs.length <= index) {
			return
		}
		value = value instanceof Tree ? value : new Tree(value)
		this.childs[index].parent = null
		this.childs[index] = value
		value.parent = this
	}

	/**
	 * Remove a child at the index.
	 *
	 * @param {number} index Index of the child node to be deleted
	 * @returns {Tree} Removed tree.
	 */
	removeAt(index) {
		if (index < 0 || this.childs.length <= index) {
			return
		}
		this.childs[index].parent = null
		return this.childs.splice(index, 1)[0]
	}

	/**
	 * Remove all children.
	 */
	clear() {
		this.childs.forEach(c => (c.parent = null))
		this.childs.length = 0
	}

	/**
	 * Returns this tree is the leaf node or not.
	 *
	 * @returns {boolean} True if this is leaf node
	 */
	isLeaf() {
		return this.childs.length === 0
	}

	/**
	 * Returns this tree is the root node or not.
	 *
	 * @returns {boolean} True if this is root node
	 */
	isRoot() {
		return this.parent === null
	}

	/**
	 * Returns the root node.
	 *
	 * @returns {Tree} Root node
	 */
	root() {
		return this.isRoot() ? this : this.parent.root()
	}

	/**
	 * Returns the leaf nodes.
	 *
	 * @returns {Tree[]} Leaf nodes
	 */
	leafs() {
		let vals = []
		this.scanLeaf(l => vals.push(l))
		return vals
	}

	/**
	 * Returns the values of all leaf nodes.
	 *
	 * @returns {*[]} Values of all leaf nodes
	 */
	leafValues() {
		let vals = []
		this.scanLeaf(l => vals.push(l.value))
		return vals
	}

	/**
	 * Returns the number of the leaf nodes.
	 *
	 * @returns {number} Number of the leaf nodes
	 */
	leafCount() {
		return this.isLeaf() ? 1 : this.childs.reduce((acc, c) => acc + c.leafCount(), 0)
	}

	/**
	 * Iterate over the children.
	 *
	 * @param {function (Tree): void} cb Callback function to apply to each children
	 * @param {*} [thisArg] this
	 */
	forEach(cb, thisArg) {
		this.childs.forEach(cb, thisArg)
	}

	/**
	 * Iterate over the children recursively.
	 *
	 * @param {function (Tree): void} cb Callback function to apply to each children
	 */
	scan(cb) {
		cb(this)
		this.childs.forEach(c => c.scan(cb))
	}

	/**
	 * Iterate over the leaf nodes.
	 *
	 * @param {function (Tree): void} cb Callback function to apply to each leaf nodes
	 */
	scanLeaf(cb) {
		this.isLeaf() ? cb(this) : this.childs.forEach(c => c.scanLeaf(cb))
	}
}

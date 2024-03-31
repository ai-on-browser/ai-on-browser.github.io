import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

/**
 * Graph SAGE layer
 */
export default class GraphSAGELayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} config.out_size Size of output
	 * @param {'mean'} [config.aggregate] Aggregate function
	 * @param {number[][] | Matrix | string} [config.w] Weight of kernel
	 * @param {number[][] | Matrix | string} [config.b] Bias
	 * @param {string | object} [config.activation] Name of activation or activation layer object
	 * @param {number} [config.l2_decay] L2 decay
	 * @param {number} [config.l1_decay] L1 decay
	 */
	constructor({
		out_size,
		aggregate = 'mean',
		w = null,
		b = null,
		activation = null,
		l2_decay = 0,
		l1_decay = 0,
		...rest
	}) {
		super(rest)
		this._out_size = out_size
		this._w = null
		if (typeof w === 'string') {
			this._wname = w
		} else if (w) {
			this._w = Matrix.fromArray(w)
		}
		this._b = null
		if (typeof b === 'string') {
			this._bname = b
		} else if (b) {
			this._b = Matrix.fromArray(b)
		}
		if (typeof activation === 'string') {
			this._activation = Layer.fromObject({ type: activation })
		} else if (activation) {
			this._activation = Layer.fromObject(activation)
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
		this._aggregate = aggregate
	}

	calc(x) {
		if (this._wname) {
			this._w = this.graph.getNode(this._wname).outputValue
			if (!this._out_size) {
				this._out_size = this._w.sizes.at(-1)
			}
		}
		if (this._bname) {
			this._b = this.graph.getNode(this._bname).outputValue
		}
		if (!this._w) {
			this._w = Matrix.randn(x.value[0].nodes[0].sizes.at(-1) * 2, this._out_size)
		}
		if (!this._b) {
			this._b = Matrix.zeros(1, this._out_size)
		}
		this._i = x
		this._cum = []
		this._o = x.copy()
		for (let k = 0; k < x.length; k++) {
			const graph = x.value[k].copy()
			const cgraph = x.value[k].copy()
			for (let i = 0; i < graph.order; i++) {
				const vi = x.value[k].getNode(i).copy()
				const v = vi.copy()
				v.fill(0)
				const adj = x.value[k].adjacencies(i, true, 'in')
				for (let j = 0; j < adj.length; j++) {
					v.add(x.value[k].getNode(adj[j]))
				}
				if (this._aggregate === 'mean') {
					v.div(adj.length)
				}
				vi.concat(v, 1)
				cgraph.nodes[i] = vi
				let o = vi.dot(this._w)
				o.broadcastOperate(this._b, (a, b) => a + b)
				if (this._activation) {
					o = this._activation.calc(o)
				}
				graph.nodes[i] = o
			}
			this._cum[k] = cgraph
			this._o.value[k] = graph
		}
		return this._o
	}

	grad(bo) {
		if (this._activation) {
			for (let k = 0; k < bo.length; k++) {
				for (let i = 0; i < bo.value[k].order; i++) {
					bo.value[k].nodes[i] = this._activation.grad(bo.value[k].nodes[i])
				}
			}
		}

		this._dw = null
		this._db = null
		this._bi = this._i.copy()
		for (let k = 0; k < this._bi.length; k++) {
			const graph = this._i.value[k].copy()
			for (let i = 0; i < this._bi.value[k].order; i++) {
				graph.nodes[i] = this._i.value[k].nodes[i].copy()
				graph.nodes[i].fill(0)
			}
			this._bi.value[k] = graph
		}
		let count = 0
		for (let k = 0; k < bo.length; k++) {
			for (let i = 0; i < bo.value[k].order; i++) {
				const dw = this._cum[k].nodes[i].tDot(bo.value[k].nodes[i])
				const db = bo.value[k].nodes[i].sum(0)
				if (!this._dw) {
					this._dw = dw
					this._db = db
				} else {
					this._dw.add(dw)
					this._db.add(db)
				}
				count++
				const bik = bo.value[k].nodes[i].dot(this._w.t)
				const bik_self = bik.slice(0, this._i.value[k].nodes[i].sizes[1], 1)
				const bik_other = bik.slice(this._i.value[k].nodes[i].sizes[1], bik.sizes[1], 1)
				const adj = this._bi.value[k].adjacencies(i, true, 'in')
				if (this._aggregate === 'mean') {
					bik_other.div(adj.length)
				}
				this._bi.value[k].nodes[i].broadcastOperate(bik_self, (a, b) => a + b)
				for (let j = 0; j < adj.length; j++) {
					this._bi.value[k].nodes[adj[j]].broadcastOperate(bik_other, (a, b) => a + b)
				}
			}
		}
		this._dw.div(count)
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			for (let i = 0; i < this._dw.rows; i++) {
				for (let j = 0; j < this._dw.cols; j++) {
					const v = this._w.at(i, j)
					this._dw.addAt(i, j, v * this._l2_decay + Math.sign(v) * this._l1_decay)
				}
			}
		}
		this._db.div(count)

		if (this._wname || this._bname) {
			const gp = {}
			if (this._wname) {
				gp[this._wname] = this._dw
			}
			if (this._bname) {
				gp[this._bname] = this._db
			}
			return [this._bi, gp]
		}
		return this._bi
	}

	update(optimizer) {
		if (!this._wname) {
			this._w.sub(optimizer.delta('w', this._dw))
		}
		if (!this._bname) {
			this._b.sub(optimizer.delta('b', this._db))
		}
	}

	toObject() {
		return {
			type: 'graph_sage',
			out_size: this._out_size,
			aggregate: this._aggregate,
			w: this._wname || this._w?.toArray(),
			b: this._bname || this._b?.toArray(),
			activation: this._activation?.toObject(),
			l2_decay: this._l2_decay,
			l1_decay: this._l1_decay,
		}
	}
}

GraphSAGELayer.registLayer('graph_sage')

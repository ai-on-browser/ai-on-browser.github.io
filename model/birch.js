import { KMeansModel, KMeanspp } from './kmeans.js'

class CFTree {
	constructor(b = 10, t = 0.2, l = Infinity) {
		this._b = b
		this._l = l
		this._t = t
		this._datas = [];
		this._children = [];
		this._parent = null
	}

	get size() {
		return this._datas.length
	}

	get length() {
		return this._children.length
	}

	get depth() {
		if (this.isLeaf()) {
			return 1
		}
		return this._children.reduce((s, v) => Math.max(s, v.depth + 1), -Infinity)
	}

	get cf() {
		if (this._cf) {
			return this._cf
		}
		if (this.isLeaf()) {
			const n = this._datas.length;
			if (n === 0) {
				this._cf = {
					n: 0,
					ls: null,
					ss: 0
				}
			} else {
				const ls = Array(this._datas[0].length).fill(0)
				let ss = 0
				for (let i = 0; i < n; i++) {
					for (let j = 0; j < this._datas[i].length; j++) {
						ls[j] += this._datas[i][j]
						ss += this._datas[i][j] ** 2
					}
				};
				this._cf = {
					n: n,
					ls: ls,
					ss: ss
				}
			}
		} else {
			this._cf = {
				n: this._children[0].cf.n,
				ls: this._children[0].cf.ls.concat(),
				ss: this._children[0].cf.ss
			}
			for (let i = 1; i < this.length; i++) {
				const cf = this._children[i].cf
				this._cf.n += cf.n
				this._cf.ss += cf.ss
				for (let j = 0; j < cf.ls.length; j++) {
					this._cf.ls[j] += cf.ls[j]
				}
			}
		}
		return this._cf
	}

	get r() {
		if (this._r) {
			return this._r
		}
		if (this.isLeaf()) {
			const n = this._datas.length
			if (n <= 1) {
				this._r = Infinity
			} else {
				let r = 0;
				for (let i = 0; i < n; i++) {
					const di = this._datas[i]
					for (let j = 0; j < i; j++) {
						r += 2 * this._datas[j].reduce((s, v, k) => s + (v - di[k]) ** 2, 0)
					}
				}
				this._r = Math.sqrt(r / (n * (n - 1)))
			}
		} else {
			this._r = this._children.reduce((m, c) => Math.max(m, c.r), -Infinity)
		}
		return this._r
	}

	get c() {
		return this.cf.ls.map(v => v / this.cf.n)
	}

	at(index) {
		return this._children[index]
	}

	isRoot() {
		return this._parent === null
	}

	isLeaf() {
		return this._children.length === 0;
	}

	push(data) {
		this._cf = null
		this._r = null
		if (!this.isLeaf()) {
			let min_d = Infinity
			let min_i = -1
			for (let i = 0; i < this.length; i++) {
				const c = this._children[i].c
				const d = data.reduce((s, v, k) => s + (v - c[k]) ** 2, 0)
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			this._children[min_i].push(data)
			if (this._children.length >= this._b) {
				this._separate();
			}
			return
		}
		this._datas.push(data);
		if (this._datas.length <= 2) return
		if (this._datas.length >= this._l || this.r > this._t) {
			this._separate();
		}
	}

	_separate() {
		const d = this.isLeaf() ? this._datas : this._children.map(c => c.c)
		const model = new KMeansModel();
		model.method = new KMeanspp();
		model.add(d);
		model.add(d);
		while (model.fit(d) > 0);
		const p = model.predict(d);
		if (this.isLeaf()) {
			if (this.isRoot()) {
				const c1 = new CFTree(this._b, this._t, this._l);
				c1._datas = d.filter((v, i) => p[i] === 0);
				c1._parent = this
				const c2 = new CFTree(this._b, this._t, this._l);
				c2._datas = d.filter((v, i) => p[i] === 1);
				c2._parent = this
				this._children = [c1, c2]
				this._datas = null
			} else {
				const new_c = new CFTree(this._b, this._t, this._l);
				new_c._datas = d.filter((v, i) => p[i] === 1);
				new_c._parent = this._parent
				this._parent._children.push(new_c)
				this._datas = d.filter((v, i) => p[i] === 0)
			}
		} else {
			if (this.isRoot()) {
				const c1 = new CFTree(this._b, this._t, this._l)
				c1._children = this._children.filter((c, i) => p[i] === 0)
				c1._children.forEach(c => c._parent = c1)
				c1._parent = this
				const c2 = new CFTree(this._b, this._t, this._l)
				c2._children = this._children.filter((c, i) => p[i] === 1)
				c2._children.forEach(c => c._parent = c2)
				c2._parent = this
				this._children = [c1, c2]
			} else {
				const new_c = new CFTree(this._b, this._t, this._l)
				new_c._children = this._children.filter((c, i) => p[i] === 1);
				new_c._children.forEach(c => c._parent = new_c)
				new_c._parent = this._parent
				this._parent._children.push(new_c)
				this._children = this._children.filter((c, i) => p[i] === 0)
			}
		}
	}
}

class BIRCH {
	// https://en.wikipedia.org/wiki/BIRCH
	// http://somathor.hatenablog.com/entry/2013/04/23/205320
	constructor(k, b, t, l) {
		this._k = k
		this._tree = new CFTree(b, t, l)
	}

	fit(datas) {
		for (let i = 0; i < datas.length; i++) {
			this._tree.push(datas[i])
		}
	}

	predict(datas) {
		if (this._tree.isLeaf()) {
			return Array(datas.length).fill(0);
		}
		const centers = this._tree._children.map(c => c.c);
		return datas.map(data => {
			let min_d = Infinity
			let min_i = -1
			for (let i = 0; i < centers.length; i++) {
				const d = data.reduce((s, v, k) => s + (v - centers[i][k]) ** 2, 0)
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			return min_i;
		})
	}
}

var dispBIRCH = function(elm, platform) {

	const fitModel = (cb) => {
		platform.fit(
			(tx, ty, pred_cb) => {
				const b = +elm.select("[name=b]").property("value")
				const t = +elm.select("[name=t]").property("value")
				const l = +elm.select("[name=l]").property("value")
				const model = new BIRCH(null, b, t, l)
				model.fit(tx)
				const pred = model.predict(tx);
				pred_cb(pred.map(v => v + 1))
				elm.select("[name=clusters]").text(new Set(pred).size);
				cb && cb()
			}
		);
	}

	elm.append("span")
		.text(" b ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "b")
		.attr("min", 2)
		.attr("max", 1000)
		.attr("value", 10)
	elm.append("span")
		.text(" t ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "t")
		.attr("min", 0.01)
		.attr("max", 10)
		.attr("step", 0.01)
		.attr("value", 0.2)
	elm.append("span")
		.text(" l ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "l")
		.attr("min", 2)
		.attr("max", 10000)
		.attr("value", 10000)
	elm.append("span")
		.text(" sub algorithm ")
	elm.append("select")
		.attr("name", "subalgo")
		.selectAll("option")
		.data([
			"none",
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
	elm.append("span")
		.text(" Clusters: ");
	elm.append("span")
		.attr("name", "clusters");
	return () => {
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispBIRCH(platform.setting.ml.configElement, platform);
}

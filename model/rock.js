class Link {
	constructor() {
		this._link = []
	}

	at(i, j) {
		if (i < j) {
			return this._link[i]?.[j] || 0
		} else {
			return this._link[j]?.[i] || 0
		}
	}

	set(i, j, value) {
		if (i < j) {
			this._link[i] ||= []
			this._link[i][j] = value
		} else {
			this._link[j] ||= []
			this._link[j][i] = value
		}
	}
}

class ROCK {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.103.5187&rep=rep1&type=pdf
	// ROCK: A Robust Clustering Algorithm for Categorical Attributes.
	constructor(th) {
		this._th = th
	}

	_f() {
		return (1 - this._th) / (1 + this._th)
	}

	_g(c1, c2, links) {
		const v1 = c1.leafValues()
		const v2 = c2.leafValues()

		let link = 0
		for (let i = 0; i < v1.length; i++) {
			for (let j = 0; j < v2.length; j++) {
				link += links.at(v1[i].index, v2[j].index)
			}
		}
		const p = 1 + 2 * this._f()
		return link / ((v1.length + v2.length) ** p - v1.length ** p - v2.length ** p)
	}

	_sim(a, b) {
		return 1 / (1 + Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)))
	}

	_link(data) {
		const n = data.length
		const nbrlist = []
		for (let i = 0; i < n; nbrlist[i++] = []);
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				if (this._sim(data[i], data[j]) >= this._th) {
					nbrlist[i].push(j)
					nbrlist[j].push(i)
				}
			}
		}
		const link = new Link()
		for (let i = 0; i < n; link[i++] = Array(n).fill(0));
		for (let i = 0; i < n; i++) {
			const nbr = nbrlist[i]
			for (let j = 0; j < nbr.length; j++) {
				for (let l = j + 1; l < nbr.length - 1; l++) {
					link.set(nbr[j], nbr[l], link.at(nbr[j], nbr[l]) + 1)
				}
			}
		}
		return link
	}

	fit(data) {
		const link = this._link(data)
		const n = data.length

		const Q = []
		for (let i = 0; i < n; i++) {
			Q.push(new Tree({
				point: data[i],
				index: i,
				distance: 0
			}))
		}

		const q = []
		for (let i = 0; i < n; i++) {
			q[i] = []
			for (let j = 0; j < n; j++) {
				if (link.at(i, j) > 0) {
					q[i].push({index: j, g: this._g(Q[i], Q[j], link)})
				}
			}
			q[i].sort((a, b) => b.g - a.g)
			Q[i].value.g = q[i][0]?.g || 0
		}
		Q.sort((a, b) => b.value.g - a.value.g)

		let supidx = n

		while (Q.length > 2) {
			const u = Q.shift()
			if (u.value.g === 0) {
				Q.push(u)
				break
			}
			const uidx = u.value.index
			const vidx = q[uidx][0].index
			let v = null
			for (let i = 0; i < Q.length; i++) {
				if (Q[i].value.index === vidx) {
					v = Q.splice(i, 1)[0]
					break
				}
			}
			const widx = supidx++
			const w = new Tree({
				index: widx
			}, [u, v])

			const xidx = [...new Set([...q[uidx].map(v => v.index), ...q[vidx].map(v => v.index)])]
			q[widx] = []
			for (let i = 0; i < xidx.length; i++) {
				if (xidx[i] === uidx || xidx[i] === vidx) continue
				link.set(widx, xidx[i], link.at(uidx, xidx[i]) + link.at(vidx, xidx[i]))

				const x = Q.find(v => v.value.index === xidx[i])
				const g = this._g(w, x, link)
				q[widx].push({index: xidx[i], g: g})

				q[xidx[i]] = q[xidx[i]].filter(v => v.index !== uidx && v.index !== vidx)
				q[xidx[i]].push({index: widx, g: g})

				q[xidx[i]].sort((a, b) => b.g - a.g)
				x.value.g = q[xidx[i]][0].g
			}
			q[uidx] = []
			q[vidx] = []

			q[widx].sort((a, b) => b.g - a.g)
			w.value.g = q[widx][0]?.g || 0

			Q.push(w)
			Q.sort((a, b) => b.value.g - a.value.g)
		}
		this._root = new Tree({g: 0}, Q)
	}

	getClusters(number) {
		const scanNodes = this._root.childs
		while (scanNodes.length < number) {
			let min_goodness = Infinity;
			let min_goodness_idx = -1;
			for (let i = 0; i < scanNodes.length; i++) {
				const node = scanNodes[i];
				if (!node.isLeaf() && node.value.g < min_goodness) {
					min_goodness_idx = i;
					min_goodness = node.value.g
				}
			}
			if (min_goodness_idx === -1) {
				break
			}
			const min_goodness_node = scanNodes[min_goodness_idx];
			scanNodes.splice(min_goodness_idx, 1, min_goodness_node.at(0), min_goodness_node.at(1))
		}
		return scanNodes;
	}

	predict(k) {
		const p = []
		const clusters = this.getClusters(k)
		for (let i = 0; i < clusters.length; i++) {
			const leafs = clusters[i].leafValues()
			for (let k = 0; k < leafs.length; k++) {
				p[leafs[k].index] = i
			}
		}
		return p
	}
}

var dispROCK = function(elm, platform) {
	const fitModel = () => {
		platform.fit(
			(tx, ty, pred_cb) => {
				const th = +elm.select("[name=th]").property("value")
				const k = +elm.select("[name=k]").property("value")
				const model = new ROCK(th)
				model.fit(tx)
				const pred = model.predict(k)
				pred_cb(pred.map(v => v + 1))
			}
		);
	}

	elm.append("span")
		.text(" threshold ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "th")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.95)
		.attr("step", 0.01)
	elm.append("span")
		.text(" k ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 3)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			fitModel()
		});
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispROCK(platform.setting.ml.configElement, platform)
}


import { DecisionTreeClassifier, DecisionTreeRegression } from '../model/decision_tree.js'

class DecisionTreePlotter {
	constructor(platform) {
		this._platform = platform
		this._mode = platform.task
		this._svg = platform.svg
		this._r = null
		this._lineEdge = []
	}

	remove() {
		this._svg.select('.separation').remove()
	}

	plot(tree) {
		this._svg.select('.separation').remove()
		if (this._platform.datas.length == 0) {
			return
		}
		if (this._platform.datas.dimension === 1) {
			this._r = this._svg.insert('g').attr('class', 'separation')
		} else {
			this._r = this._svg.insert('g', ':first-child').attr('class', 'separation').attr('opacity', 0.5)
		}
		this._lineEdge = []
		this._dispRange(tree._tree)
		if (this._platform.datas.dimension === 1) {
			const line = d3
				.line()
				.x(d => d[0])
				.y(d => d[1])
			this._r.append('path').attr('stroke', 'red').attr('fill-opacity', 0).attr('d', line(this._lineEdge))
		}
	}

	_dispRange(root, r) {
		r = r || this._platform.datas.domain
		if (root.isLeaf()) {
			const sep = this._r
			let max_cls = 0,
				max_v = 0
			if (this._mode === 'CF') {
				root.value['value'].forEach((v, k) => {
					if (v > max_v) {
						max_v = v
						max_cls = k
					}
				})
			} else {
				max_cls = root.value['value']
			}
			if (this._platform.datas.dimension === 1) {
				const p1 = this._platform.datas._renderer.toPoint([r[0][0], max_cls])
				const p2 = this._platform.datas._renderer.toPoint([r[0][1], max_cls])
				this._lineEdge.push(p1)
				this._lineEdge.push(p2)
			} else {
				const p1 = this._platform.datas._renderer.toPoint([r[0][0], r[1][0]])
				const p2 = this._platform.datas._renderer.toPoint([r[0][1], r[1][1]])
				sep.append('rect')
					.attr('x', p1[0])
					.attr('y', p1[1])
					.attr('width', p2[0] - p1[0])
					.attr('height', p2[1] - p1[1])
					.attr('fill', getCategoryColor(max_cls))
			}
		} else {
			root.forEach((n, i) => {
				let r0 = [[].concat(r[0]), [].concat(r[1])]
				let mm = i === 0 ? 1 : 0
				r0[root.value['feature']][mm] = root.value['threshold']
				this._dispRange(n, r0)
			})
		}
	}
}

var dispDTree = function (elm, platform) {
	const mode = platform.task
	const plotter = new DecisionTreePlotter(platform)
	let tree = null

	const dispRange = function () {
		if (platform.task === 'FS') {
			platform.fit((tx, ty, cb) => {
				const importance = tree.importance().map((v, i) => [v, i])
				importance.sort((a, b) => b[0] - a[0])
				const tdim = platform.dimension
				const idx = importance.map(i => i[1]).slice(0, tdim)
				const x = Matrix.fromArray(tx)
				cb(x.col(idx).toArray())
			})
		} else if (platform.datas.dimension <= 2) {
			plotter.plot(tree)
		} else {
			platform.predict((px, pred_cb) => {
				let pred = tree.predict(px)
				pred_cb(pred)
			}, 2)
		}
		platform.evaluate((x, e_cb) => {
			e_cb(tree.predict(x))
		})
	}

	elm.append('select')
		.selectAll('option')
		.data([
			{
				value: 'CART',
			},
		])
		.enter()
		.append('option')
		.attr('value', d => d['value'])
		.text(d => d['value'])
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Initialize')
		.on('click', () => {
			if (mode == 'CF') {
				tree = new DecisionTreeClassifier()
			} else {
				tree = new DecisionTreeRegression()
			}
			tree.init(platform.datas.x, platform.datas.y)
			dispRange()

			elm.select('[name=depthnumber]').text(tree.depth)
		})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Separate')
		.on('click', () => {
			if (!tree) {
				return
			}
			tree.fit()

			dispRange()

			elm.select('[name=depthnumber]').text(tree.depth)
		})
	elm.append('span').attr('name', 'depthnumber').text('0')
	elm.append('span').text(' depth ')

	return () => {
		plotter.remove()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Separate".'
	platform.setting.terminate = dispDTree(platform.setting.ml.configElement, platform)
}
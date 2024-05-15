import Matrix from '../../lib/util/matrix.js'

import { DecisionTreeClassifier, DecisionTreeRegression } from '../../lib/model/decision_tree.js'
import Controller from '../controller.js'
import { getCategoryColor } from '../utils.js'

class DecisionTreePlotter {
	constructor(platform) {
		this._platform = platform
		this._mode = platform.task
		this._svg = platform.svg
		this._r = null
		this._lineEdge = []
	}

	remove() {
		this._svg.querySelector('.separation')?.remove()
	}

	plot(tree) {
		this._svg.querySelector('.separation')?.remove()
		if (this._platform.datas.length === 0) {
			return
		}
		this._r = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this._r.classList.add('separation')
		if (this._platform.datas.dimension === 1) {
			this._svg.append(this._r)
		} else {
			this._svg.insertBefore(this._r, this._svg.firstChild)
			this._r.setAttribute('opacity', 0.5)
		}
		this._lineEdge = []
		this._dispRange(tree._tree)
		if (this._platform.datas.dimension === 1) {
			const line = p => {
				let s = ''
				for (let i = 0; i < p.length; i++) {
					s += `${i === 0 ? 'M' : 'L'}${p[i][0]},${p[i][1]}`
				}
				return s
			}
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			path.setAttribute('stroke', 'red')
			path.setAttribute('fill-opacity', 0)
			path.setAttribute('d', line(this._lineEdge))
			this._r.append(path)
		}
	}

	_dispRange(root, r) {
		r = r || this._platform.datas.domain
		if (root.children.length === 0) {
			let max_cls = 0,
				max_v = 0
			if (this._mode === 'CF') {
				root.value.forEach((v, k) => {
					if (v > max_v) {
						max_v = v
						max_cls = k
					}
				})
			} else {
				max_cls = root.value
			}
			if (this._platform.datas.dimension === 1) {
				const p1 = this._platform._renderer[0].toPoint([r[0][0], max_cls])
				const p2 = this._platform._renderer[0].toPoint([r[0][1], max_cls])
				this._lineEdge.push(p1)
				this._lineEdge.push(p2)
			} else {
				const p1 = this._platform._renderer[0].toPoint([r[0][0], r[1][0]])
				const p2 = this._platform._renderer[0].toPoint([r[0][1], r[1][1]])
				const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				rect.setAttribute('x', p1[0])
				rect.setAttribute('y', p1[1])
				rect.setAttribute('width', p2[0] - p1[0])
				rect.setAttribute('height', p2[1] - p1[1])
				rect.setAttribute('fill', getCategoryColor(max_cls))
				this._r.append(rect)
			}
		} else {
			root.children.forEach((n, i) => {
				let r0 = [[].concat(r[0]), [].concat(r[1])]
				let mm = i === 0 ? 1 : 0
				r0[root.feature][mm] = root.threshold
				this._dispRange(n, r0)
			})
		}
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Separate".'
	platform.setting.ml.reference = {
		title: 'Decision tree (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Decision_tree',
	}
	const controller = new Controller(platform)
	const mode = platform.task
	const plotter = new DecisionTreePlotter(platform)
	let tree = null

	const dispRange = function () {
		if (platform.task === 'FS') {
			const importance = tree.importance().map((v, i) => [v, i])
			importance.sort((a, b) => b[0] - a[0])
			const tdim = platform.dimension
			const idx = importance.map(i => i[1]).slice(0, tdim)
			const x = Matrix.fromArray(platform.trainInput)
			platform.trainResult = x.col(idx).toArray()
		} else if (platform.datas.dimension <= 2) {
			plotter.plot(tree)
		} else {
			let pred = tree.predict(platform.testInput(2))
			platform.testResult(pred)
		}
		platform.evaluate((x, e_cb) => {
			e_cb(tree.predict(x))
		})
	}

	const methods = mode === 'CF' ? ['CART', 'ID3'] : ['CART']
	const method = controller.select(methods)
	controller.input.button('Initialize').on('click', () => {
		if (mode === 'CF') {
			tree = new DecisionTreeClassifier(method.value)
		} else {
			tree = new DecisionTreeRegression()
		}
		tree.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		dispRange()

		depth.value = tree.depth
	})
	controller.input.button('Separate').on('click', () => {
		if (!tree) {
			return
		}
		tree.fit()

		dispRange()

		depth.value = tree.depth
	})
	const depth = controller.text('0')
	controller.text(' depth ')

	return () => {
		plotter.remove()
	}
}

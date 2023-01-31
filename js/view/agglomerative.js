import {
	CompleteLinkageAgglomerativeClustering,
	SingleLinkageAgglomerativeClustering,
	GroupAverageAgglomerativeClustering,
	WardsAgglomerativeClustering,
	CentroidAgglomerativeClustering,
	WeightedAverageAgglomerativeClustering,
	MedianAgglomerativeClustering,
} from '../../lib/model/agglomerative.js'
import Controller from '../controller.js'
import { getCategoryColor, DataConvexHull } from '../utils.js'

const argmin = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.min(...arr))
}

const argmax = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.max(...arr))
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, select distance type and click "Initialize". Finally, select cluster number.'
	platform.setting.terminate = () => {
		document.querySelector('svg .grouping').remove()
	}
	const svg = d3.select(platform.svg)
	const line = p => {
		let s = ''
		for (let i = 0; i < p.length; i++) {
			s += `${i === 0 ? 'M' : 'L'}${p[i][0]},${p[i][1]}`
		}
		return s
	}
	const controller = new Controller(platform)

	let clusterClass = null
	let clusterInstance = null
	let clusterPlot = null
	svg.insert('g', ':first-child').attr('class', 'grouping')

	const plotLink = getLinks => {
		let lines = []
		const clusters = clusternumber.value
		let category = 1
		const preds = []
		clusterInstance.getClusters(clusters).forEach(h => {
			if (h.size > 1) {
				let lin = []
				const nodes = [h]
				while (nodes.length > 0) {
					const node = nodes.pop()
					if (node.size > 1) {
						if (!node.line) {
							node.line = getLinks(node.children[0], node.children[1])
						}
						lin = lin.concat(node.line)
					} else if (!node.children) {
						preds[node.index] = category
					}
					if (node.children) {
						nodes.push(...node.children)
					}
				}
				lin = lin.map(l => ({
					path: l.map(p => platform._renderer[0].toPoint(p)),
					color: getCategoryColor(category),
				}))
				lines = lines.concat(lin)
			} else {
				preds[h.index] = category
			}
			category += h.size
		})
		platform.trainResult = preds
		svg.selectAll('.grouping path').remove()
		svg.select('.grouping')
			.selectAll('path')
			.data(lines)
			.enter()
			.append('path')
			.attr('d', d => line(d.path))
			.attr('stroke', d => d.color)
	}
	const plotConvex = function () {
		svg.selectAll('.grouping polygon').remove()
		const clusters = clusternumber.value
		let category = 1
		const preds = []
		clusterInstance.getClusters(clusters).forEach(h => {
			if (h.size > 1) {
				const nodes = [h]
				while (nodes.length > 0) {
					const node = nodes.pop()
					if (node.poly) {
						node.poly.remove()
					} else if (!node.children) {
						preds[node.index] = category
					}
					if (node.children) {
						nodes.push(...node.children)
					}
				}
				h.poly = new DataConvexHull(
					svg.select('.grouping'),
					h.leafs.map(v => platform._renderer[0].points[v.index])
				)
				h.poly.color = getCategoryColor(category)
			} else {
				preds[h.index] = category
			}
			category += h.size
		})
		platform.trainResult = preds
	}

	const methods = {
		'Complete Linkage': {
			class: CompleteLinkageAgglomerativeClustering,
			plot: () => {
				plotLink((h1, h2) => {
					const f1 = h1.leafs
					const f2 = h2.leafs
					let f1BaseDistance = f1.map(v1 => {
						return [v1, f2[argmax(f2, v2 => v1.distances[v2.index])]]
					})
					let target = f1BaseDistance[argmax(f1BaseDistance, v => v[0].distances[v[1].index])]
					return [[target[0].point, target[1].point]]
				})
			},
		},
		'Single Linkage': {
			class: SingleLinkageAgglomerativeClustering,
			plot: () => {
				plotLink((h1, h2) => {
					const f1 = h1.leafs
					const f2 = h2.leafs
					let f1BaseDistance = f1.map(v1 => {
						return [v1, f2[argmin(f2, v2 => v1.distances[v2.index])]]
					})
					let target = f1BaseDistance[argmin(f1BaseDistance, v => v[0].distances[v[1].index])]
					return [[target[0].point, target[1].point]]
				})
			},
		},
		'Group Average': {
			class: GroupAverageAgglomerativeClustering,
			plot: () => plotConvex(),
		},
		"Ward's": {
			class: WardsAgglomerativeClustering,
			plot: () => plotConvex(),
		},
		Centroid: {
			class: CentroidAgglomerativeClustering,
			plot: () => plotConvex(),
		},
		'Weighted Average': {
			class: WeightedAverageAgglomerativeClustering,
			plot: () => plotConvex(),
		},
		Median: {
			class: MedianAgglomerativeClustering,
			plot: () => plotConvex(),
		},
	}
	const method = controller
		.select([
			'Complete Linkage',
			'Single Linkage',
			'Group Average',
			"Ward's",
			'Centroid',
			'Weighted Average',
			'Median',
		])
		.on('change', () => {
			clusterClass = methods[method.value].class
			clusterPlot = methods[method.value].plot
		})
	clusterClass = methods['Complete Linkage'].class
	clusterPlot = methods['Complete Linkage'].plot
	const metric = controller.select(['euclid', 'manhattan', 'chebyshev'])
	controller.input.button('Initialize').on('click', () => {
		if (clusterClass) {
			clusterInstance = new clusterClass(metric.value)
			clusterInstance.fit(platform.trainInput)
			clusternumbeript.element.max = platform.datas.length
			clusternumbeript.element.value = 10
			clusternumbeript.element.disabled = false
			clusternumber.element.max = platform.datas.length
			clusternumber.element.value = 10
			clusternumber.element.disabled = false
			svg.selectAll('path').remove()
			svg.selectAll('.grouping *').remove()
			clusterPlot()
		}
	})

	const clusternumbeript = controller.input
		.number({ label: 'Cluster #', min: 1, max: 1, value: 1, disabled: 'disabled' })
		.on('change', () => {
			clusternumber.value = clusternumbeript.value
			clusterPlot()
		})
	const clusternumber = controller.input
		.range({ min: 1, disabled: 'disabled' })
		.on('change', () => {
			clusternumbeript.value = clusternumber.value
			clusterPlot()
		})
		.on('input', () => {
			clusternumbeript.value = clusternumber.value
		})
}

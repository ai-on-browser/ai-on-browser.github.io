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

var dispAgglomerative = function (elm, platform) {
	const svg = platform.svg
	const line = d3
		.line()
		.x(d => d[0])
		.y(d => d[1])
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
					path: l.map(p => platform._renderer.toPoint(p)),
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
					clusterInstance._leafs(h).map(v => platform.datas.points[v.index])
				)
				h.poly.color = getCategoryColor(category)
			} else {
				preds[h.index] = category
			}
			category += h.size
		})
		platform.trainResult = preds
	}
	elm.append('select')
		.on('change', function () {
			var slct = d3.select(this)
			slct.selectAll('option')
				.filter(d => d.value === slct.property('value'))
				.each(d => (clusterClass = d.class))
				.each(d => (clusterPlot = d.plot))
		})
		.selectAll('option')
		.data([
			{
				value: 'Complete Linkage',
				class: CompleteLinkageAgglomerativeClustering,
				plot: () => {
					plotLink((h1, h2) => {
						const f1 = clusterInstance._leafs(h1)
						const f2 = clusterInstance._leafs(h2)
						let f1BaseDistance = f1.map(v1 => {
							return [v1, f2[argmax(f2, v2 => v1.distances[v2.index])]]
						})
						let target = f1BaseDistance[argmax(f1BaseDistance, v => v[0].distances[v[1].index])]
						return [[target[0].point, target[1].point]]
					})
				},
			},
			{
				value: 'Single Linkage',
				class: SingleLinkageAgglomerativeClustering,
				plot: () => {
					plotLink((h1, h2) => {
						const f1 = clusterInstance._leafs(h1)
						const f2 = clusterInstance._leafs(h2)
						let f1BaseDistance = f1.map(v1 => {
							return [v1, f2[argmin(f2, v2 => v1.distances[v2.index])]]
						})
						let target = f1BaseDistance[argmin(f1BaseDistance, v => v[0].distances[v[1].index])]
						return [[target[0].point, target[1].point]]
					})
				},
			},
			{
				value: 'Group Average',
				class: GroupAverageAgglomerativeClustering,
				plot: () => plotConvex(),
			},
			{
				value: "Ward's",
				class: WardsAgglomerativeClustering,
				plot: () => plotConvex(),
			},
			{
				value: 'Centroid',
				class: CentroidAgglomerativeClustering,
				plot: () => plotConvex(),
			},
			{
				value: 'Weighted Average',
				class: WeightedAverageAgglomerativeClustering,
				plot: () => plotConvex(),
			},
			{
				value: 'Median',
				class: MedianAgglomerativeClustering,
				plot: () => plotConvex(),
			},
		])
		.enter()
		.append('option')
		.attr('value', d => d.value)
		.text(d => d.value)
		.each((d, i) => i === 0 && (clusterClass = d.class))
		.each((d, i) => i === 0 && (clusterPlot = d.plot))
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

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, select distance type and click "Initialize". Finally, select cluster number.'
	dispAgglomerative(platform.setting.ml.configElement, platform)
	platform.setting.terminate = () => {
		d3.selectAll('svg .grouping').remove()
	}
}

import DBSCAN from '../../lib/model/dbscan.js'

var dispDBSCAN = function (elm, platform) {
	const svg = platform.svg
	svg.insert('g', ':first-child').attr('class', 'range').attr('opacity', 0.4)

	const fitModel = cb => {
		svg.selectAll('.range *').remove()
		platform.fit((tx, ty, pred_cb) => {
			const metric = elm.select('[name=metric]').property('value')
			const eps = +elm.select('[name=eps]').property('value')
			const minpts = +elm.select('[name=minpts]').property('value')
			const model = new DBSCAN(eps, minpts, metric)
			const pred = model.predict(tx)
			pred_cb(pred.map(v => v + 1))
			elm.select('[name=clusters]').text(new Set(pred).size)
			const scale = 1000

			if (metric === 'euclid') {
				svg.select('.range')
					.selectAll('circle')
					.data(tx)
					.enter()
					.append('circle')
					.attr('cx', c => c[0] * scale)
					.attr('cy', c => c[1] * scale)
					.attr('r', eps * scale)
					.attr('fill-opacity', 0)
					.attr('stroke', (c, i) => getCategoryColor(pred[i] + 1))
			} else if (metric === 'manhattan') {
				svg.select('.range')
					.selectAll('polygon')
					.data(tx)
					.enter()
					.append('polygon')
					.attr('points', c => {
						const x0 = c[0] * scale
						const y0 = c[1] * scale
						const d = eps * scale
						return `${x0 - d},${y0} ${x0},${y0 - d} ${x0 + d},${y0} ${x0},${y0 + d}`
					})
					.attr('fill-opacity', 0)
					.attr('stroke', (c, i) => getCategoryColor(pred[i] + 1))
			} else if (metric === 'chebyshev') {
				svg.select('.range')
					.selectAll('rect')
					.data(tx)
					.enter()
					.append('rect')
					.attr('x', c => (c[0] - eps) * scale)
					.attr('y', c => (c[1] - eps) * scale)
					.attr('width', eps * 2 * scale)
					.attr('height', eps * 2 * scale)
					.attr('fill-opacity', 0)
					.attr('stroke', (c, i) => getCategoryColor(pred[i] + 1))
			}
			cb && cb()
		})
	}

	elm.append('select')
		.attr('name', 'metric')
		.on('change', fitModel)
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('eps')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'eps')
		.attr('min', 0.01)
		.attr('max', 10)
		.attr('step', 0.01)
		.attr('value', 0.05)
		.on('change', fitModel)
	elm.append('span').text('min pts')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'minpts')
		.attr('min', 2)
		.attr('max', 1000)
		.attr('value', 5)
		.on('change', fitModel)
	const stepButton = elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
	return () => {
		svg.select('.range').remove()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispDBSCAN(platform.setting.ml.configElement, platform)
}

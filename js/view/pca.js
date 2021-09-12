import { PCA, AnomalyPCA } from '../../lib/model/pca.js'

var dispPCA = function (elm, platform) {
	let kernel = null
	let poly_dimension = 2

	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			if (platform.task === 'DR') {
				const dim = platform.dimension
				const model = new PCA(kernel)
				model.fit(tx)
				let y = model.predict(tx, dim)
				pred_cb(y.toArray())
			} else {
				const model = new AnomalyPCA()
				model.fit(tx)
				const th = +elm.select('[name=threshold]').property('value')
				const y = model.predict(tx)
				pred_cb(y.map(v => v > th))
				platform.predict((px, cb) => {
					const p = model.predict(px)
					cb(p.map(v => v > th))
				}, 10)
			}
		})
	}

	if (platform.task !== 'AD') {
		elm.append('select')
			.on('change', function () {
				const slct = d3.select(this)
				slct.selectAll('option')
					.filter(d => d['value'] === slct.property('value'))
					.each(d => {
						kernel = d.kernel
						if (d.value === 'polynomial') {
							elm.select('[name=poly_dimension]').style('display', 'inline-block')
						} else {
							elm.select('[name=poly_dimension]').style('display', 'none')
						}
					})
			})
			.selectAll('option')
			.data([
				{
					value: 'no kernel',
					kernel: null,
				},
				{
					value: 'gaussian',
					kernel: (x, y, sigma = 1.0) => {
						const s = x.copySub(y).reduce((acc, v) => acc + v * v, 0)
						return Math.exp(-s / sigma ** 2)
					},
				},
				{
					value: 'polynomial',
					kernel: (x, y) => {
						return x.tDot(y).value[0] ** poly_dimension
					},
				},
			])
			.enter()
			.append('option')
			.attr('value', d => d['value'])
			.text(d => d['value'])
	}
	elm.append('span')
		.attr('name', 'poly_dimension')
		.style('display', 'none')
		.each(function () {
			d3.select(this)
				.append('span')
				.text(' d = ')
				.append('input')
				.attr('type', 'number')
				.attr('value', 2)
				.attr('min', 1)
				.attr('max', 10)
				.on('change', function () {
					poly_dimension = d3.select(this).property('value')
				})
		})
	if (platform.task === 'AD') {
		elm.append('span').text(' threshold = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'threshold')
			.attr('value', 0.1)
			.attr('min', 0)
			.attr('max', 10)
			.attr('step', 0.01)
			.on('change', fitModel)
	}
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPCA(platform.setting.ml.configElement, platform)
}

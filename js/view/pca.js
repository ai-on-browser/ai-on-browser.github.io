import { PCA, AnomalyPCA } from '../../lib/model/pca.js'

var dispPCA = function (elm, platform) {
	let poly_dimension = 2

	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			if (platform.task === 'DR') {
				const dim = platform.dimension
				const kernel = elm.select('[name=kernel]').property('value')
				const model = new PCA(kernel, [poly_dimension])
				model.fit(tx)
				const y = model.predict(tx, dim)
				pred_cb(y)
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
			.attr('name', 'kernel')
			.on('change', function () {
				const slct = d3.select(this)
				if (slct.property('value') === 'polynomial') {
					elm.select('[name=poly_dimension]').style('display', 'inline-block')
				} else {
					elm.select('[name=poly_dimension]').style('display', 'none')
				}
			})
			.selectAll('option')
			.data(['no kernel', 'gaussian', 'polynomial'])
			.enter()
			.append('option')
			.attr('value', d => d)
			.text(d => d)
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

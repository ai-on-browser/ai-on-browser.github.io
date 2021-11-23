import { PCA, DualPCA, KernelPCA, AnomalyPCA } from '../../lib/model/pca.js'

var dispPCA = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			if (platform.task === 'DR') {
				const dim = platform.dimension
				const kernel = elm.select('[name=kernel]').property('value')
				const type = elm.select('[name=type]').property('value')
				let model
				if (type === '') {
					model = new PCA()
				} else if (type === 'dual') {
					model = new DualPCA()
				} else {
					const args = []
					if (kernel === 'polynomial') {
						args.push(+elm.select('[name=poly_d]').property('value'))
					} else if (kernel === 'gaussian') {
						args.push(+elm.select('[name=sigma]').property('value'))
					}
					model = new KernelPCA(kernel, args)
				}
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
			.attr('name', 'type')
			.on('change', function () {
				const slct = d3.select(this)
				if (slct.property('value') === 'kernel') {
					kernelElm.style('display', 'inline-block')
				} else {
					kernelElm.style('display', 'none')
				}
			})
			.selectAll('option')
			.data(['', 'dual', 'kernel'])
			.enter()
			.append('option')
			.attr('value', d => d)
			.text(d => d)
	}
	const kernelElm = elm.append('span').style('display', 'none')
	kernelElm
		.append('select')
		.attr('name', 'kernel')
		.on('change', function () {
			const slct = d3.select(this)
			poly_dimension.style('display', 'none')
			gauss_sigma.style('display', 'none')
			if (slct.property('value') === 'polynomial') {
				poly_dimension.style('display', 'inline-block')
			} else if (slct.property('value') === 'gaussian') {
				gauss_sigma.style('display', 'inline-block')
			}
		})
		.selectAll('option')
		.data(['gaussian', 'polynomial'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	const poly_dimension = kernelElm.append('span').style('display', 'none')
	poly_dimension
		.append('span')
		.text(' d = ')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'poly_d')
		.attr('value', 2)
		.attr('min', 1)
		.attr('max', 10)
	const gauss_sigma = kernelElm.append('span')
	gauss_sigma
		.append('span')
		.text(' sigma = ')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
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

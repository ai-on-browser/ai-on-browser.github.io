import AdaptiveThresholding from '../../lib/model/adaptive_thresholding.js'

var dispAdaptiveThresholding = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const method = elm.select('[name=method]').property('value')
		const k = +elm.select('[name=k]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new AdaptiveThresholding(method, k, c)
			const y = []
			for (let i = 0; i < tx.length * tx[0].length; i++) {
				y[i] = []
			}
			for (let d = 0; d < tx[0][0].length; d++) {
				const x = []
				for (let i = 0; i < tx.length; i++) {
					x[i] = tx[i].map(v => v[d])
				}
				const p = model.predict(x)
				for (let i = 0, k = 0; i < p.length; i++) {
					for (let j = 0; j < p[i].length; j++, k++) {
						y[k].push(p[i][j])
					}
				}
			}
			pred_cb(y)
		}, 1)
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['mean', 'gaussian', 'median', 'midgray'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' k ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('value', 3)
		.attr('min', 3)
		.attr('max', 99)
		.attr('step', 2)
		.on('change', fitModel)
	elm.append('span').text(' c ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 100)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispAdaptiveThresholding(platform.setting.ml.configElement, platform)
}

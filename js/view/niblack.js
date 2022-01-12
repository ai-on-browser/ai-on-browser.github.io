import NiblackThresholding from '../../lib/model/niblack.js'

var dispNiblackThresholding = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select('[name=n]').property('value')
		const k = +elm.select('[name=k]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new NiblackThresholding(n, k)
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

	elm.append('span').text(' n ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'n')
		.attr('value', 3)
		.attr('min', 3)
		.attr('max', 99)
		.attr('step', 2)
		.on('change', fitModel)
	elm.append('span').text(' k ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('value', 0.1)
		.attr('min', -100)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispNiblackThresholding(platform.setting.ml.configElement, platform)
}

import BernsenThresholding from '../../lib/model/bernsen.js'

var dispBernsenThresholding = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select('[name=n]').property('value')
		const ct = +elm.select('[name=ct]').property('value')
		const orgStep = platform._step
		platform._step = 1
		const tx = platform.trainInput
		const model = new BernsenThresholding(n, ct)
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
					y[k].push(p[i][j] * 255)
				}
			}
		}
		platform.trainResult = y
		platform._step = orgStep
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
	elm.append('span').text(' contrast threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'ct')
		.attr('value', 50)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispBernsenThresholding(platform.setting.ml.configElement, platform)
}

import PhansalkarThresholding from '../lib/model/phansalkar.js'

var dispPhansalkarThresholding = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select('[name=n]').property('value')
		const k = +elm.select('[name=k]').property('value')
		const r = +elm.select('[name=r]').property('value')
		const p = +elm.select('[name=p]').property('value')
		const q = +elm.select('[name=q]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new PhansalkarThresholding(n, k, r, p, q)
			const y = model.predict(tx)
			pred_cb(y.flat())
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
		.attr('value', 0.25)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.01)
		.on('change', fitModel)
	elm.append('span').text(' r ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'r')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('span').text(' p ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'p')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('span').text(' q ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'q')
		.attr('value', 10)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispPhansalkarThresholding(platform.setting.ml.configElement, platform)
}

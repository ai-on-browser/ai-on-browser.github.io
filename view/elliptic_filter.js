import EllipticFilter from '../lib/model/elliptic_filter.js'

var dispElliptic = function (elm, platform) {
	const fitModel = () => {
		const n = +elm.select('[name=n]').property('value')
		const xi = +elm.select('[name=xi]').property('value')
		const ripple = +elm.select('[name=ripple]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new EllipticFilter(ripple, n, xi, c)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append('span').text('n')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'n')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 2)
		.on('change', fitModel)
	elm.append('span').text('ripple')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'ripple')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 1)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('span').text('xi')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'xi')
		.attr('min', 1)
		.attr('max', 10)
		.attr('value', 1.1)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('span').text('cutoff rate')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.9)
		.attr('step', 0.01)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispElliptic(platform.setting.ml.configElement, platform)
}

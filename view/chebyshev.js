import ChebyshevFilter from '../model/chebyshev.js'

var dispChebyshev = function (elm, platform) {
	const fitModel = () => {
		const type = elm.select('[name=type]').property('value') === 'first' ? 1 : 2
		const n = +elm.select('[name=n]').property('value')
		const ripple = +elm.select('[name=ripple]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new ChebyshevFilter(type, ripple, n, c)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append('span').text('type')
	elm.append('select')
		.attr('name', 'type')
		.on('change', fitModel)
		.selectAll('option')
		.data(['first', 'second'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
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
	dispChebyshev(platform.setting.ml.configElement, platform)
}

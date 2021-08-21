import { HoltWinters } from '../model/holt_winters.js'

var dispHoltWinters = function (elm, platform) {
	const fitModel = () => {
		const a = +elm.select('[name=a]').property('value')
		const b = +elm.select('[name=b]').property('value')
		const g = +elm.select('[name=g]').property('value')
		const s = +elm.select('[name=s]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new HoltWinters(a, b, g, s)
			model.fit(tx)
			const pred = model.predict(c)
			pred_cb(pred)
		})
	}

	elm.append('span').text('a')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'a')
		.attr('min', 0)
		.attr('step', 0.1)
		.attr('max', 1)
		.attr('value', 0.1)
	elm.append('span').text('b')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'b')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
		.attr('value', 0)
	elm.append('span').text('g')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'g')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
		.attr('value', 0)
	elm.append('span').text('s')
	elm.append('input').attr('type', 'number').attr('name', 's').attr('min', 0).attr('max', 1000).attr('value', 0)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text('predict count')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 100)
		.on('change', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispHoltWinters(platform.setting.ml.configElement, platform)
}
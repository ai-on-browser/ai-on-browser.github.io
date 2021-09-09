import { Matrix } from '../js/math.js'

import averageShiftedHistogram from '../model/average_shifted_histogram.js'

var dispAverageShiftedHistogram = function (elm, platform) {
	const fitModel = cb => {
		const bin = +elm.select('[name=bin]').property('value')
		const agg = +elm.select('[name=aggregate]').property('value')
		platform.fit((tx, ty) => {
			const d = averageShiftedHistogram(
				tx,
				{
					domain: platform.datas.domain,
					size: bin * platform.datas.scale,
				},
				agg
			)

			let pred = Matrix.fromArray(d).value
			const m = Math.max(...pred)
			pred = pred.map(v => specialCategory.density(v / m))
			platform.predict((px, pred_cb) => {
				pred_cb(pred)
			}, bin)
		})
	}

	elm.append('span').text('bin size ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'bin')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 10)
		.on('change', fitModel)
	elm.append('span').text('aggregate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'aggregate')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 10)
		.on('change', fitModel)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispAverageShiftedHistogram(platform.setting.ml.configElement, platform)
}

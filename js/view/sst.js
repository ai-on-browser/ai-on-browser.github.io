import SST from '../../lib/model/sst.js'

var dispSST = function (elm, platform) {
	const calcSST = function () {
		const d = +elm.select('[name=window]').property('value')
		let model = new SST(d)
		const data = platform.trainInput.map(v => v[0])
		const threshold = +elm.select('[name=threshold]').property('value')
		const pred = model.predict(data)
		for (let i = 0; i < (d * 3) / 4; i++) {
			pred.unshift(0)
		}
		platform.trainResult = pred
		platform._plotter.threshold = threshold
	}

	elm.append('span').text(' window = ')
	elm.append('input').attr('type', 'number').attr('name', 'window').attr('value', 10).attr('min', 1).attr('max', 100)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.01)
		.on('change', () => {
			const threshold = +elm.select('[name=threshold]').property('value')
			platform._plotter.threshold = threshold
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSST)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSST(platform.setting.ml.configElement, platform)
}

import { LSDDCPD } from '../../lib/model/lsdd.js'

var dispLSDD = function (elm, platform) {
	let thupdater = null
	const calcLSDD = function () {
		platform.fit((tx, ty, cb, thup) => {
			const d = +elm.select('[name=window]').property('value')
			let model = new LSDDCPD(d)
			const threshold = +elm.select('[name=threshold]').property('value')
			const pred = model.predict(tx)
			for (let i = 0; i < (d * 3) / 4; i++) {
				pred.unshift(0)
			}
			thupdater = thup
			cb(pred, threshold)
		})
	}

	elm.append('span').text(' window = ')
	elm.append('input').attr('type', 'number').attr('name', 'window').attr('value', 10).attr('min', 1).attr('max', 100)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 300)
		.attr('min', 0)
		.attr('max', 10000)
		.attr('step', 0.1)
		.on('change', () => {
			const threshold = +elm.select('[name=threshold]').property('value')
			if (thupdater) {
				thupdater(threshold)
			}
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLSDD)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLSDD(platform.setting.ml.configElement, platform)
}

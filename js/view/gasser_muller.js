import GasserMuller from '../../lib/model/gasser_muller.js'

var dispGasserMuller = function (elm, platform) {
	const fitModel = () => {
		const s = +sgm.property('value')
		platform.fit((tx, ty) => {
			const model = new GasserMuller(s)
			model.fit(tx, ty)

			platform.predict(
				(px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred)
				},
				platform.datas.dimension === 1 ? 1 : 4
			)
		})
	}

	const sgm = elm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.attr('min', 0)
		.attr('value', 1)
		.attr('step', 0.01)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispGasserMuller(platform.setting.ml.configElement, platform)
}

import PCR from '../lib/model/pcr.js'

var dispPCR = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const model = new PCR()
			model.fit(tx, ty)

			platform.predict(
				(px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred)
				},
				dim === 1 ? 100 : 4
			)
		})
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPCR(platform.setting.ml.configElement, platform)
}

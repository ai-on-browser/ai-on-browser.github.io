import ICA from '../../lib/model/ica.js'

var dispICA = function (elm, platform) {
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			platform.fit((tx, ty, pred_cb) => {
				const dim = platform.dimension
				const model = new ICA()
				model.fit(tx)
				let y = model.predict(tx, dim)
				pred_cb(y.toArray())
			})
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispICA(platform.setting.ml.configElement, platform)
}

import CumSum from '../../lib/model/cumulative_sum.js'

var dispCumSum = function (elm, platform) {
	let model = null

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Step')
		.on('click', () => {
			platform.fit((tx, ty, pred_cb) => {
				if (!model) {
					model = new CumSum()
					model.init(tx.map(v => v[0]))
				}
				model.fit()
				pred_cb(model.predict())
			})
		})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Clear')
		.on('click', () => {
			model = null
			platform.init()
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispCumSum(platform.setting.ml.configElement, platform)
}

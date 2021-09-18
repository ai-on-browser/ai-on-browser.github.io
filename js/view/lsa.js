import LSA from '../../lib/model/lsa.js'

var dispLSA = function (elm, platform) {
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			platform.fit((tx, ty, pred_cb) => {
				const dim = platform.dimension
				const y = LSA(tx, dim)
				pred_cb(y)
			})
		})
}

var lsa_init = function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLSA(platform.setting.ml.configElement, platform)
}

export default lsa_init
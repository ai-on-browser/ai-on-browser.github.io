import LSA from '../../lib/model/lsa.js'

var dispLSA = function (elm, platform) {
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			const dim = platform.dimension
			const y = new LSA().predict(platform.trainInput, dim)
			platform.trainResult = y
		})
}

var lsa_init = function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLSA(platform.setting.ml.configElement, platform)
}

export default lsa_init

import IncrementalPCA from '../../lib/model/incremental_pca.js'

var dispIPCA = function (elm, platform) {
	platform.setting.ml.reference = {
		author: 'T. Oyama, S. G. Karungaru, S. Tsuge, Y. Mitsukura, M. Fukumi',
		title: 'Fast Incremental Algorithm of Simple Principal Component Analysis',
		year: 2009,
	}
	const fitModel = () => {
		const dim = platform.dimension
		const model = new IncrementalPCA()
		model.fit(platform.trainInput)
		const y = model.predict(platform.trainInput, dim)
		platform.trainResult = y
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispIPCA(platform.setting.ml.configElement, platform)
}

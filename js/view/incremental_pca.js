import IncrementalPCA from '../../lib/model/incremental_pca.js'

var dispIPCA = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const dim = platform.dimension
			const model = new IncrementalPCA()
			model.fit(tx)
			const y = model.predict(tx, dim)
			pred_cb(y)
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispIPCA(platform.setting.ml.configElement, platform)
}

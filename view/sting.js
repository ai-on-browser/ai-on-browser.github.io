import STING from '../model/sting.js'

var dispSTING = function (elm, platform) {
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			const model = new STING()
			model.fit(tx)
			//const pred = model.predict(tx);
			//pred_cb(pred.map(v => v + 1))
			//elm.select("[name=clusters]").text(new Set(pred).size);
			cb && cb()
		})
	}

	const stepButton = elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
	return () => {}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispSTING(platform.setting.ml.configElement, platform)
}
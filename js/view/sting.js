import STING from '../../lib/model/sting.js'

var dispSTING = function (elm, platform) {
	platform.setting.ml.reference = {
		author: 'W. Wang, J. Yang, R. R. Muntz',
		title: 'STING : A Statistical Information Grid Approach to Spatial Data Mining',
		year: 1997,
	}
	const fitModel = () => {
		const model = new STING()
		model.fit(platform.trainInput)
		//const pred = model.predict(platform.trainInput);
		//platform.trainResult = pred.map(v => v + 1)
		//elm.select("[name=clusters]").text(new Set(pred).size);
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

import GasserMuller from '../../lib/model/gasser_muller.js'

var dispGasserMuller = function (elm, platform) {
	platform.setting.ml.reference = {
		author: 'W. R. Schucany',
		title: 'Kernel Smoothers: An Overview of Curve Estimators for the First Graduate Course in Nonparametric Statistics',
		year: 2004,
	}
	const fitModel = () => {
		const s = +sgm.property('value')
		const model = new GasserMuller(s)
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(platform.datas.dimension === 1 ? 1 : 4))
		platform.testResult(pred)
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
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispGasserMuller(platform.setting.ml.configElement, platform)
}

import STING from '../../lib/model/sting.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'W. Wang, J. Yang, R. R. Muntz',
		title: 'STING : A Statistical Information Grid Approach to Spatial Data Mining',
		year: 1997,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new STING()
		model.fit(platform.trainInput)
		//const pred = model.predict(platform.trainInput);
		//platform.trainResult = pred.map(v => v + 1)
		//clusters.value = new Set(pred).size
	}

	const stepButton = controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}

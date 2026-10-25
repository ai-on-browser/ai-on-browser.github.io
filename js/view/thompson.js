import Thompson from '../../lib/model/thompson.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: '外れ値 (Wikipedia)',
		url: 'https://ja.wikipedia.org/wiki/%E5%A4%96%E3%82%8C%E5%80%A4#%E3%83%88%E3%83%B3%E3%83%97%E3%82%BD%E3%83%B3%E6%A4%9C%E5%AE%9A',
	}
	platform.setting.ml.require = { dimension: 1 }
	const controller = new Controller(platform)
	const calcThompson = () => {
		const model = new Thompson(alpha.value)
		const outliers = model.predict(platform.trainInput.map(v => v[0]))
		platform.trainResult = outliers
	}

	const alpha = controller.input.number({ label: ' alpha = ', min: 0, max: 50, value: 1 }).on('change', calcThompson)
	controller.input.button('Calculate').on('click', calcThompson)
}

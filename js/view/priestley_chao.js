import PriestleyChao from '../../lib/model/priestley_chao.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = { dimension: 1 }
	platform.setting.ml.reference = {
		title: 'Kernel regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Kernel_regression#Priestley%E2%80%93Chao_kernel_estimator',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const auto = autoCheck.element.checked
		const model = new PriestleyChao(auto ? null : sgm.value)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		if (auto) {
			sgm.value = model._h
		}

		const pred = model.predict(platform.testInput(platform.datas.dimension === 1 ? 1 : 4).map(v => v[0]))
		platform.testResult(pred)
	}

	const autoCheck = controller.input({ type: 'checkbox', label: 'auto' }).on('change', () => {
		sgm.element.disabled = autoCheck.element.checked
	})
	autoCheck.element.checked = true
	const sgm = controller.input.number({ min: 0, value: 0.1, step: 0.01 })
	sgm.element.disabled = true
	controller.input.button('Fit').on('click', () => fitModel())
}

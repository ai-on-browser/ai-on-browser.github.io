import SpectralClustering from '../../lib/model/spectral.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Then, click "Add cluster". Finally, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Spectral clustering (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Spectral_clustering',
	}
	const controller = new Controller(platform)
	let model = null

	const method = controller.select(['rbf', 'knn']).on('change', () => {
		const value = method.value
		rbfSpan.element.style.display = 'none'
		knnSpan.element.style.display = 'none'
		if (value === 'rbf') {
			rbfSpan.element.style.display = 'inline'
		}
		if (value === 'knn') {
			knnSpan.element.style.display = 'inline'
		}
	})
	const rbfSpan = controller.span()
	const sigma = rbfSpan.input.number({ label: 's =', min: 0.01, max: 100, step: 0.01, value: 1 })
	const knnSpan = controller.span()
	const k = knnSpan.input.number({ label: 'k =', min: 1, max: 100, value: 10 })
	knnSpan.element.style.display = 'none'

	const slbConf = controller.stepLoopButtons().init(() => {
		const param = { sigma: sigma.value, k: k.value }
		model = new SpectralClustering(method.value, param)
		model.init(platform.trainInput)
		clusters.value = model.size
		runSpan.element.querySelectorAll('input').forEach(elm => (elm.disabled = null))
	})
	const runSpan = controller.span()
	runSpan.input.button('Add cluster').on('click', () => {
		model.add()
		let pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
	})
	const clusters = runSpan.text('0')
	runSpan.text(' clusters')
	runSpan.input.button('Clear cluster').on('click', () => {
		model.clear()
		clusters.value = '0'
	})
	slbConf
		.step(() => {
			if (model.size === 0) {
				return
			}
			model.fit()
			let pred = model.predict()
			platform.trainResult = pred.map(v => v + 1)
		})
		.epoch(() => model.epoch)
	runSpan.element.querySelectorAll('input').forEach(elm => (elm.disabled = true))
}

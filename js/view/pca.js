import { AnomalyPCA, DualPCA, KernelPCA, PCA } from '../../lib/model/pca.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		if (platform.task === 'DR') {
			const dim = platform.dimension
			let model
			if (type.value === '') {
				model = new PCA(dim)
			} else if (type.value === 'dual') {
				model = new DualPCA(dim)
			} else {
				model = new KernelPCA({ name: kernel.value, sigma: sigma.value, n: poly_d.value }, dim)
			}
			model.fit(platform.trainInput)
			const y = model.predict(platform.trainInput)
			platform.trainResult = y
		} else {
			const model = new AnomalyPCA()
			model.fit(platform.trainInput)
			const th = threshold.value
			const y = model.predict(platform.trainInput)
			platform.trainResult = y.map(v => v > th)
			const p = model.predict(platform.testInput(10))
			platform.testResult(p.map(v => v > th))
		}
	}

	let type = null
	if (platform.task !== 'AD') {
		type = controller.select(['', 'dual', 'kernel']).on('change', () => {
			if (type.value === 'kernel') {
				kernelElm.element.style.display = 'inline-block'
			} else {
				kernelElm.element.style.display = 'none'
			}
		})
	}
	const kernelElm = controller.span()
	kernelElm.element.style.display = 'none'
	const kernel = kernelElm.select(['gaussian', 'polynomial']).on('change', () => {
		poly_dimension.element.style.display = 'none'
		gauss_sigma.element.style.display = 'none'
		if (kernel.value === 'polynomial') {
			poly_dimension.element.style.display = 'inline-block'
		} else if (kernel.value === 'gaussian') {
			gauss_sigma.element.style.display = 'inline-block'
		}
	})
	const poly_dimension = kernelElm.span()
	poly_dimension.element.style.display = 'none'
	const poly_d = poly_dimension.input.number({ label: ' d = ', value: 2, min: 1, max: 10 })
	const gauss_sigma = kernelElm.span()
	const sigma = gauss_sigma.input.number({ label: ' sigma = ', value: 1, min: 0, max: 10, step: 0.1 })
	let threshold = null
	if (platform.task === 'AD') {
		threshold = controller.input
			.number({ label: ' threshold = ', value: 0.1, min: 0, max: 10, step: 0.01 })
			.on('change', fitModel)
	}
	controller.input.button('Fit').on('click', fitModel)
}

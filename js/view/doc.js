import { DOC, FastDOC } from '../../lib/model/doc.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'C. M. Procopiuc, M. Jones, P. K. Agarwal, T. M. Murali',
		title: 'A monte carlo algorithm for fast projective clustering',
		year: 2002,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		let model = null
		if (type.value === 'DOC') {
			model = new DOC(alpha.value, beta.value, w.value)
		} else {
			model = new FastDOC(alpha.value, beta.value, w.value, maxiter.value, d0.value)
		}

		model.fit(platform.trainInput)
		const pred = model.predict().map(v => v + 1)
		platform.trainResult = pred
	}

	const type = controller.select(['DOC', 'FastDOC']).on('change', () => {
		felm.element.style.display = type.value === 'DOC' ? 'none' : null
	})
	const alpha = controller.input.number({ label: ' alpha ', min: 0, max: 1, step: 0.01, value: 0.1 })
	const beta = controller.input.number({ label: ' beta ', min: 0, max: 0.5, step: 0.01, value: 0.25 })
	const w = controller.input.number({ label: ' width ', min: 0, max: 1000, step: 0.1, value: 0.1 })

	const felm = controller.span()
	felm.element.style.display = 'none'
	const maxiter = felm.input.number({ label: ' maxiter ', min: 1, max: 1000000, value: 100 })
	const d0 = felm.input.number({ label: ' d0 ', min: 1, max: 100, value: 2 })

	controller.input.button('Fit').on('click', fitModel)
}

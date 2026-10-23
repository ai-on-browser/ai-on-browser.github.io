import HopfieldNetwork from '../../lib/model/hopfield.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button. Then, click "estimate" button.'
	platform.colorSpace = '8 colors'
	const controller = new Controller(platform)
	let model = null
	let y = null

	const binalize = x => {
		let max = -Infinity
		let min = Infinity
		for (let k = 0; k < x.length; k++) {
			max = Math.max(max, x[k])
			min = Math.min(min, x[k])
		}
		return x.map(v => (v < (max + min) / 2 ? -1 : 1))
	}

	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 8
		const x = binalize(platform.trainInput.flat(2))

		model = new HopfieldNetwork()
		model.fit([x])

		y = binalize(platform.testInput(8).flat(2))
		platform.testResult(y.map(v => (v === -1 ? 0 : 255)))
		platform._step = orgStep
	}

	controller.input.button('Fit').on('click', fitModel)
	controller.input.button('Estimate').on('click', () => {
		if (!model) return
		y = model.predict(y)
		platform.testResult(y.map(v => (v === -1 ? 0 : 255)))
	})
}

import HopfieldNetwork from '../../lib/model/hopfield.js'

var dispHopfield = (elm, platform) => {
	platform.colorSpace = '8 colors'
	let model = null
	let y = null
	let pcb = null
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 8
		const x = platform.trainInput.flat(2)
		model = new HopfieldNetwork()
		model.fit([x])

		y = platform.testInput(8).flat(2)
		model._normalize([y])
		pcb = p => platform.testResult(p.map(v => (v === -1 ? 0 : 255)))
		pcb(y)
		platform._step = orgStep
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Estimate')
		.on('click', () => {
			if (!model) return
			y = model.predict(y)
			pcb(y)
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button. Then, click "estimate" button.'
	dispHopfield(platform.setting.ml.configElement, platform)
}

import HopfieldNetwork from '../../lib/model/hopfield.js'

var dispHopfield = function (elm, platform) {
	platform.colorSpace = '8 colors'
	let model = null
	let y = null
	let pcb = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const x = tx.flat(2)
			model = new HopfieldNetwork()
			model.fit([x])

			platform.predict((px, pred_cb) => {
				y = px.flat(2)
				model._normalize([y])
				pcb = p => pred_cb(p.map(v => (v === -1 ? 0 : 255)))
				pcb(y)
			}, 8)
		}, 8)
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
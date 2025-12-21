import BoxCox from '../../lib/model/box_cox.js'
import MaxAbsScaler from '../../lib/model/maxabs.js'
import MinmaxNormalization from '../../lib/model/minmax.js'
import RobustScaler from '../../lib/model/robust_scaler.js'
import Standardization from '../../lib/model/standardization.js'
import YeoJohnson from '../../lib/model/yeo_johnson.js'

const transformers = {
	minmax: MinmaxNormalization,
	standard: Standardization,
	maxabs: MaxAbsScaler,
	robust: RobustScaler,
	'Box-Cox': BoxCox,
	'Yeo-Johnson': YeoJohnson,
}

export default class TransformPreprocessor {
	constructor(manager) {
		this._manager = manager
		this._method = 'standard'

		this.init()
	}

	init() {
		if (!this._r) {
			const elm = this._manager.setting.preprocess.configElement
			this._r = document.createElement('div')
			elm.append(this._r)
		} else {
			this._r.replaceChildren()
		}
		const methodElm = document.createElement('div')
		const method = document.createElement('select')
		for (const key of Object.keys(transformers)) {
			const opt = method.appendChild(document.createElement('option'))
			opt.value = opt.innerText = key
		}
		method.onchange = () => {
			this._method = method.value
			this._manager.setting.ml.refresh()
		}
		method.value = this._method
		methodElm.append('Method ', method)
		this._r.append(methodElm)
	}

	apply(x, { dofit = true }) {
		if (dofit) {
			this._model = new transformers[this._method]()
			this._model.fit(x)
		}
		return this._model.predict(x)
	}

	inverse(z) {
		return this._model.inverse(z)
	}

	terminate() {
		this._r?.remove()
	}
}

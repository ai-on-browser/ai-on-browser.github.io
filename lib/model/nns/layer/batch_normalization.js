import Matrix from '../../../util/matrix.js'
import Layer from './base.js'

/**
 * Batch normalization layer
 */
export default class BatchNormalizationLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.scale=1] Scale
	 * @param {number} [config.offset=0] Offset
	 */
	constructor({ scale = 1, offset = 0, ...rest }) {
		super(rest)
		this._init_scale = scale
		this._init_offset = offset
		this._scale = null
		this._offset = null
	}

	calc(x) {
		if (!this._scale) {
			this._scale = new Matrix(1, x.cols, this._init_scale)
			this._offset = new Matrix(1, x.cols, this._init_offset)
		}
		this._s = x.std(0)
		this._s.map(v => v + 1.0e-12)
		this._xc = Matrix.sub(x, x.mean(0))
		this._xh = Matrix.div(this._xc, this._s)
		const o = Matrix.mult(this._xh, this._scale)
		o.add(this._offset)
		return o
	}

	grad(bo) {
		this._bo = bo

		const bs = Matrix.mult(this._bo, this._scale)
		const bi = Matrix.div(
			this._xc,
			Matrix.map(this._s, v => v ** 2)
		)
		bi.mult(Matrix.mult(this._xc, bs).mean(0))
		bi.isub(bs)
		bi.div(this._s)
		bi.sub(bi.mean(0))
		return bi
	}

	update(optimizer) {
		this._offset.sub(optimizer.delta('offset', this._bo.mean(0)))
		this._scale.sub(optimizer.delta('scale', Matrix.mult(this._bo, this._xh).mean(0)))
	}

	toObject() {
		return {
			type: 'batch_normalization',
			scale: this._scale?.toArray() || this._init_scale,
			offset: this._offset?.toArray() || this._init_offset,
		}
	}
}

BatchNormalizationLayer.registLayer()

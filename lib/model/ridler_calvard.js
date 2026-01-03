/**
 * Ridler and calvard thresholding
 */
export default class RidlerCalvardThresholding {
	// Survey over image thresholding techniques and quantitative performance evaluation
	// Segmentation Methods and Image Reconstruction
	// https://share.google/UOJr9PMgtQWq4ieT0
	// https://jp.mathworks.com/matlabcentral/fileexchange/44255-ridler-calvard-image-thresholding
	// Comments on "Picture thresholding Using an Iterative Selection Method"
	// https://www.researchgate.net/profile/Henry-Trussell/publication/3116609_Picture_Thresholding_Using_an_Iterative_Selection_Method_-_Comments/links/5f68c64b299bf1b53ee861f6/Picture-Thresholding-Using-an-Iterative-Selection-Method-Comments.pdf
	/**
	 * Initialize model.
	 * @param {number[]} x Training data
	 */
	init(x) {
		this._x = x
		this._counts = {}
		this._t = 0
		for (const v of this._x) {
			this._counts[v] = (this._counts[v] || 0) + 1
			this._t += v
		}
		this._t /= this._x.length
	}

	/**
	 * Fit model.
	 */
	fit() {
		let lown = 0
		let highn = 0
		let lowe = 0
		let highe = 0
		for (const v of Object.keys(this._counts)) {
			if (v < this._t) {
				lown += this._counts[v]
				lowe += v * this._counts[v]
			} else {
				highn += this._counts[v]
				highe += v * this._counts[v]
			}
		}
		this._t = (lowe / (lown || 1) + highe / (highn || 1)) / 2
	}

	/**
	 * Returns thresholded values.
	 * @returns {(0 | 1)[]} Predicted values
	 */
	predict() {
		return this._x.map(v => (v < this._t ? 0 : 1))
	}
}

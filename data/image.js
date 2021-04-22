import { BaseData } from './base.js'

export default class ImageData extends BaseData {
	constructor(manager) {
		super(manager)
	}

	get availTask() {
		return ["SG", "DN", "ED"]
	}

	readImage(data, cb) {
		if (data instanceof Blob) {
			const reader = new FileReader()
			reader.readAsDataURL(data)
			reader.onload = () => {
				const image = new Image()
				image.src = reader.result
				image.onload = () => {
					const canvas = document.createElement("canvas")
					canvas.width = image.width
					canvas.height = image.height
					const context = canvas.getContext('2d')
					context.drawImage(image, 0, 0)
					const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
					const data = []
					for (let i = 0, c = 0; i < canvas.height; i++) {
						data[i] = []
						for (let j = 0; j < canvas.width; j++, c += 4) {
							data[i][j] = [imageData.data[c], imageData.data[c + 1], imageData.data[c + 2], imageData.data[c + 3]]
						}
					}
					cb(data)
				}
			}
		} else if (data instanceof HTMLImageElement || data instanceof HTMLVideoElement) {
			const canvas = document.createElement("canvas")
			canvas.width = this._video.videoWidth
			canvas.height = this._video.videoHeight
			const context = canvas.getContext('2d')
			context.drawImage(this._video, 0, 0, canvas.width, canvas.height)
			const data = context.getImageData(0, 0, canvas.width, canvas.height)
			const image = []
			for (let i = 0, c = 0; i < canvas.height; i++) {
				image[i] = []
				for (let j = 0; j < canvas.width; j++, c += 4) {
					image[i][j] = Array.from(data.data.slice(c, c + 4))
				}
			}
			cb(image)
		}
	}

	_reduce(im, step, algorithm = "mean") {
		const x = []
		const d = im[0][0].length
		let f = null
		if (algorithm === "max") {
			f = Math.max
		} else if (algorithm === "mean") {
			f = (a, b) => a + b
		}
		for (let i = 0, p = 0; i < im.length; i += step, p++) {
			x[p] = []
			for (let j = 0, q = 0; j < im[i].length; j += step, q++) {
				const m = Array(d).fill(0)
				for (let s = 0; s < step; s++) {
					if (im.length <= i + s) {
						continue
					}
					for (let t = 0; t < step; t++) {
						if (im[i].length <= j + t) {
							continue
						}
						for (let r = 0; r < d; r++) {
							m[r] = f(m[r], im[i + s][j + t][r])
						}
					}
				}
				x[p][q] = m
				if (algorithm === "mean") {
					x[p][q] = m.map(v => v / (step * step))
				}
			}
		}
		return x
	}

	_convertSpace(data, space, normalize = false, binary_threshold = 180) {
		const [r, g, b, a] = data
		if (space === "rgb") {
			if (normalize) {
				return [r / 255, g / 255, b / 255]
			} else {
				return [r, g, b]
			}
		} else if (space === "8 colors") {
			const br = r >> 7 ? 255 : 0
			const bg = g >> 7 ? 255 : 0
			const bb = b >> 7 ? 255 : 0
			if (normalize) {
				return [br / 255, bg / 255, bb / 255]
			} else {
				return [br, bg, bb]
			}
		} else if (space === "gray") {
			const v = 0.2126 * r + 0.7152 * g + 0.0722 * b
			if (normalize) {
				return [v / 255]
			} else {
				return [v]
			}
		} else if (space === "binary") {
			let v = 0.2126 * r + 0.7152 * g + 0.0722 * b
			v = v < binary_threshold ? 0 : 255
			if (normalize) {
				return [v / 255]
			} else {
				return [v]
			}
		} else if (space === "hls") {
			const max = Math.max(r, g, b)
			const min = Math.min(r, g, b)
			let h = null
			if (max !== min) {
				if (min === b) {
					h = 60 * (g - r) / (max - min) + 60
				} else if (min === r) {
					h = 60 * (b - g) / (max - min) + 180
				} else if (min === g) {
					h = 60 * (r - b) / (max - min) + 300
				}
			}
			const l = (max + min) / 2
			const s = max - min
			if (normalize) {
				return [h / 360, l / 255, s / 255]
			} else {
				return [h, l, s]
			}
		} else if (space === "hsv") {
			const max = Math.max(r, g, b)
			const min = Math.min(r, g, b)
			let h = null
			if (max !== min) {
				if (min === b) {
					h = 60 * (g - r) / (max - min) + 60
				} else if (min === r) {
					h = 60 * (b - g) / (max - min) + 180
				} else if (min === g) {
					h = 60 * (r - b) / (max - min) + 300
				}
			}
			const l = max
			const s = max - min
			if (normalize) {
				return [h / 360, l / 255, s / 255]
			} else {
				return [h, l, s]
			}
		}
	}

	_applySpace(data, space, normalize = false, binary_threshold = 180) {
		const cp = []
		for (let i = 0; i < data.length; i++) {
			cp[i] = []
			for (let j = 0; j < data[i].length; j++) {
				cp[i][j] = this._convertSpace(data[i][j], space, normalize, binary_threshold)
			}
		}
		return cp
	}
}


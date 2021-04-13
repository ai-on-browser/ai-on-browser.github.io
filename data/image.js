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
							data[i][j] = Array.from(imageData.data.slice(c, c + 4))
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
}


import { BaseData } from './base.js'

export default class CameraData extends BaseData {
	constructor(manager) {
		super(manager)

		this._size = [240, 360]

		const elm = this.setting.data.configElement
		this._mngelm = elm.append("div")
		this._mngelm.append("input")
			.attr("type", "button")
			.attr("value", "Add data")
			.on("click", () => this.startVideo())
		this._slctImg = this._mngelm.append("select")
			.on("change", () => {
				if (this._manager.platform.render) {
					this._manager.platform.render()
				}
			})
		this._videoElm = elm.append("div")
		this.startVideo()

		this._x = []
		this._y = []
	}

	get availTask() {
		return ["SG", "DN", "ED"]
	}

	get x() {
		const idx = +this._slctImg.property("value") - 1
		if (this._x.length === 0 || !this._x[idx]) {
			return []
		}
		return [this._x[idx]]
	}

	startVideo() {
		this._mngelm.style("display", "none")
		this._videoElm.append("div").text("Click video to use as data.")
		this._video = this._videoElm.append("video")
			.attr("width", this._size[1])
			.attr("height", this._size[0])
			.property("autoplay", true)
			.on("click", () => {
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
				this._x.push(image)
				this._y.push(0)
				this._slctImg.append("option").attr("value", this._x.length).text(this._x.length)
				this._slctImg.property("value", this._x.length)

				this.stopVideo()
				this._mngelm.style("display", null)
				if (this._manager.platform.render) {
					setTimeout(() => {
						this._manager.platform.render()
					}, 0)
				}
			}).node()

		navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
			this._video.srcObject = stream
		}).catch((e) => {
			console.error(e)
			this.stopVideo()
		})
	}

	stopVideo() {
		if (this._video) {
			const stream = this._video.srcObject
			if (stream) {
				stream.getTracks().forEach(track => {
					track.stop()
				})
				this._video.srcObject = null
			}
			this._video = null
		}
		this._videoElm.selectAll("*").remove()
	}

	terminate() {
		super.terminate()
		this.stopVideo()
	}
}


import { BaseData } from './base.js'

export default class CameraData extends BaseData {
	constructor(manager) {
		super(manager)

		this._r = this.setting.svg.insert("g", ":first-child")
			.style("transform", `scale(1, -1) translate(0, -100%)`)
		this._size = [240, 360]

		this._org_width = null
		this._org_height = null

		const elm = this.setting.data.configElement
		this._recreateBtn = elm.append("input")
			.attr("type", "button")
			.attr("value", "Recreate data")
			.on("click", () => this.startVideo())
		this._videoElm = elm.append("div")
		this.startVideo()

		this._x = []
		this._y = []
	}

	get availTask() {
		return ["SG"]
	}

	startVideo() {
		this._recreateBtn.style("display", "none")
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
				this._x = [image]
				this._y = [0]

				if (!this._org_width) {
					this._org_width = this._manager.platform.width
					this._org_height = this._manager.platform.height
				}

				this._manager.platform.width = canvas.width
				this._manager.platform.height = canvas.height
				this._r.selectAll("*").remove()
				this._r.append("image")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", canvas.width)
					.attr("height", canvas.height)
					.attr("xlink:href", canvas.toDataURL())
				this.stopVideo()
				this._recreateBtn.style("display", null)
			}).node()

		navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
			this._video.srcObject = stream
		}).catch(() => {
			this._video.remove()
			this._video = null
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
			this._videoElm.selectAll("*").remove()
			this._video = null
		}
	}

	terminate() {
		super.terminate()
		this.stopVideo()
		this._r.remove()
		if (this._org_width) {
			this._manager.platform.width = this._org_width
			this._manager.platform.height = this._org_height
		}
	}
}


import ImageData from './image.js'

export default class CameraData extends ImageData {
	constructor(manager) {
		super(manager)

		this._size = [240, 360]

		const elm = this.setting.data.configElement
		this._mngelm = document.createElement('div')
		elm.appendChild(this._mngelm)
		const addButton = document.createElement('input')
		addButton.type = 'button'
		addButton.value = 'Add data'
		addButton.onclick = () => this.startVideo()
		this._mngelm.appendChild(addButton)

		this._slctImg = document.createElement('select')
		this._slctImg.onchange = () => {
			this._manager.platform.render()
			this._thumbnail.replaceChildren()
			this._thumbnail.appendChild(this._createCanvas(this.x[0]))
		}
		this._mngelm.appendChild(this._slctImg)

		this._thumbnail = document.createElement('span')
		this._mngelm.appendChild(this._thumbnail)
		this._videoElm = document.createElement('div')
		elm.appendChild(this._videoElm)
		this.startVideo()

		this._x = []
		this._y = []
	}

	get availTask() {
		return ['SG', 'DN', 'ED']
	}

	get x() {
		const idx = +this._slctImg.value - 1
		if (this._x.length === 0 || !this._x[idx]) {
			return []
		}
		return [this._x[idx]]
	}

	startVideo(deviceId) {
		this._mngelm.style.display = 'none'
		this._videoElm.appendChild(document.createTextNode('Click video to use as data.'))
		const deviceDiv = document.createElement('div')
		this._videoElm.appendChild(deviceDiv)
		const deviceSlct = document.createElement('select')
		deviceSlct.onchange = () => {
			this.stopVideo()
			this.startVideo(deviceSlct.value)
		}
		deviceDiv.appendChild(deviceSlct)

		this._video = document.createElement('video')
		this._videoElm.appendChild(this._video)
		this._video.width = this._size[1]
		this._video.height = this._size[0]
		this._video.autoplay = true
		this._video.onclick = () => {
			this.readImage(this._video, image => {
				this._x.push(image)
				this._y.push(0)
				const opt = document.createElement('option')
				opt.value = this._x.length
				opt.innerText = this._x.length
				this._slctImg.appendChild(opt)
				this._slctImg.value = this._x.length
				this._thumbnail.replaceChildren()
				this._thumbnail.appendChild(this._createCanvas(image))

				this.stopVideo()
				this._mngelm.style.display = null
				if (this._manager.platform.render) {
					setTimeout(() => {
						this._manager.platform.render()
					}, 0)
				}
			})
		}

		navigator.mediaDevices
			.getUserMedia({ video: { deviceId } })
			.then(stream => {
				this._video.srcObject = stream
				navigator.mediaDevices.enumerateDevices().then(devices => {
					for (const device of devices.filter(d => d.kind === 'videoinput')) {
						const opt = document.createElement('option')
						opt.value = device.deviceId
						opt.innerText = device.label
						deviceSlct.appendChild(opt)
					}
					stream.getTracks().forEach(track => {
						deviceSlct.value = track.getSettings().deviceId
					})
				})
			})
			.catch(e => {
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
		this._videoElm.replaceChildren()
	}

	terminate() {
		super.terminate()
		this.stopVideo()
	}
}

import { BaseData } from './base.js'
import ImageLoader from './loader/image.js'
import ImageRenderer from '../renderer/image.js'

export default class CaptureData extends BaseData {
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
			this._thumbnail.appendChild(ImageLoader.createCanvas(this.x[0]))
		}
		this._mngelm.appendChild(this._slctImg)

		this._thumbnail = document.createElement('span')
		this._mngelm.appendChild(this._thumbnail)
		this._videoElm = document.createElement('div')
		elm.appendChild(this._videoElm)
		this.startVideo()

		this._x = []
		this._y = []

		this._manager.platform._renderer.push(new ImageRenderer(manager))
		this._manager.setting.render.selectItem('image')
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

	startVideo() {
		this._mngelm.style.display = 'none'
		const lbl = document.createElement('div')
		lbl.innerText = 'Click video to use as data.'
		this._videoElm.appendChild(lbl)

		this._video = document.createElement('video')
		this._videoElm.appendChild(this._video)
		this._video.width = this._size[1]
		this._video.height = this._size[0]
		this._video.autoplay = true
		this._video.onclick = () => {
			ImageLoader.load(this._video).then(image => {
				this._x.push(image)
				this._y.push(0)
				const opt = document.createElement('option')
				opt.value = opt.innerText = this._x.length
				this._slctImg.appendChild(opt)
				this._slctImg.value = this._x.length
				this._thumbnail.replaceChildren()
				this._thumbnail.appendChild(ImageLoader.createCanvas(image))

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
			.getDisplayMedia({ video: true })
			.then(stream => {
				this._video.srcObject = stream
			})
			.catch(e => {
				console.error(e)
				this.stopVideo()
				this._mngelm.style.display = null
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

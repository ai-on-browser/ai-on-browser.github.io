import AudioData from './audio.js'

export default class MicrophoneData extends AudioData {
	constructor(manager) {
		super(manager)

		this._size = [120, 360]

		const elm = this.setting.data.configElement
		this._mngelm = elm.append('div')
		this._mngelm
			.append('input')
			.attr('type', 'button')
			.attr('value', 'Add data')
			.on('click', () => this.startAudio())
		this._slctImg = this._mngelm.append('select').on('change', () => {
			this.selectAudio()
		})
		this._audio = this._mngelm.append('audio').property('controls', true).node()
		this._mngelm.append('span').text('Sampling Rate: ')
		this._slctRate = this._mngelm.append('select').on('change', () => {
			this._manager.platform.render()
		})
		this._audioElm = elm.append('div')
		this.startAudio()

		this._x = []
		this._y = []
		this._audioDatas = []
	}

	get availTask() {
		return ['SM']
	}

	get domain() {
		return [[-1, 1]]
	}

	get x() {
		const idx = this.selectedIndex
		if (this._x.length === 0 || !this._x[idx]) {
			return []
		}
		const scale = +this._slctRate.property('value')
		const x = []
		for (let i = 0; i < this._x[idx].length; i += scale) {
			x.push([this._x[idx][i]])
		}
		return x
	}

	get selectedIndex() {
		return +this._slctImg.property('value') - 1
	}

	selectAudio() {
		const data = this._audioDatas[this.selectedIndex]
		this._audio.src = URL.createObjectURL(data.blob)
		this._audio.title = `data_${this.selectedIndex + 1}.webm`
		this._slctRate.selectAll('*').remove()
		let scale = 1
		while (Number.isInteger(data.buff.sampleRate / scale)) {
			this._slctRate
				.append('option')
				.attr('value', scale)
				.text(data.buff.sampleRate / scale)
			scale *= 2
		}
		this._manager.platform.render()
	}

	startAudio(deviceId) {
		this._mngelm.style('display', 'none')
		this._audioElm.append('div').text('Click stop to use as data.')
		const audioCtx = new AudioContext()

		let mediaRecorder = null
		const chunks = []
		const deviceSlct = this._audioElm
			.append('div')
			.append('select')
			.attr('name', 'devices')
			.on('change', () => {
				const deviceId = deviceSlct.property('value')
				this.stopAudio()
				this.startAudio(deviceId)
			})
		this._audioElm
			.append('input')
			.attr('type', 'button')
			.attr('value', 'Record')
			.on('click', () => {
				if (mediaRecorder) {
					mediaRecorder.stop()
					mediaRecorder = null
					return
				}
				if (this._audioStream) {
					this._audioElm.select('[type=button]').attr('value', 'Stop')
					mediaRecorder = new MediaRecorder(this._audioStream, {
						mimeType: 'audio/webm',
					})
					mediaRecorder.addEventListener('dataavailable', e => {
						if (e.data.size > 0) {
							chunks.push(e.data)
						}
					})
					mediaRecorder.addEventListener('stop', e => {
						const blob = new Blob(chunks)
						this.readAudio(blob, (data, buf) => {
							this._x.push(data)
							this._y.push(0)
							this._audioDatas.push({ blob, buff: buf })
							this._slctImg.append('option').attr('value', this._x.length).text(this._x.length)
							this._slctImg.property('value', this._x.length)
							this.selectAudio()
						})

						this.stopAudio()
						this._mngelm.style('display', null)
					})
					mediaRecorder.start()
				}
			})

		navigator.mediaDevices
			.getUserMedia({ audio: { deviceId } })
			.then(stream => {
				this._audioStream = stream
				navigator.mediaDevices.enumerateDevices().then(devices => {
					deviceSlct
						.selectAll('option')
						.data(devices.filter(d => d.kind === 'audioinput'))
						.enter()
						.append('option')
						.property('value', d => d.deviceId)
						.text(d => d.label)
					stream.getTracks().forEach(track => {
						deviceSlct.property('value', track.getSettings().deviceId)
					})
				})
				const analyser = audioCtx.createAnalyser()

				const source = audioCtx.createMediaStreamSource(stream)
				source.connect(analyser)

				analyser.fftSize = 2048

				if (this._audioElm.select('canvas').size() === 0) {
					this._audioElm.append('canvas').style('border', '1px solid black')
				}
				const canvas = this._audioElm.select('canvas').node()
				canvas.width = this._size[1]
				canvas.height = this._size[0]

				const loop = () => {
					if (!this._audioStream) {
						return
					}
					this.drawFreq(analyser, canvas)
					setTimeout(loop, 10)
				}
				loop()
			})
			.catch(e => {
				console.error(e)
				this.stopAudio()
			})
	}

	drawWave(analyser, canvas) {
		const bufferLength = analyser.frequencyBinCount
		const dataArray = new Uint8Array(bufferLength)
		analyser.getByteTimeDomainData(dataArray)

		const context = canvas.getContext('2d')

		context.clearRect(0, 0, canvas.width, canvas.height)
		context.lineWidth = 2
		context.strokeStyle = 'rgb(0, 0, 0)'
		context.beginPath()
		const sliceWidth = (canvas.width * 1.0) / bufferLength
		let x = 0
		for (let i = 0; i < bufferLength; i++) {
			const v = dataArray[i] / 128.0
			const y = (v * canvas.height) / 2

			if (i === 0) {
				context.moveTo(x, y)
			} else {
				context.lineTo(x, y)
			}

			x += sliceWidth
		}
		context.lineTo(canvas.width, canvas.height / 2)
		context.stroke()
	}

	drawFreq(analyser, canvas) {
		const bufferLength = analyser.frequencyBinCount
		const dataArray = new Uint8Array(bufferLength)
		analyser.getByteFrequencyData(dataArray)

		const context = canvas.getContext('2d')

		context.clearRect(0, 0, canvas.width, canvas.height)
		context.fillStyle = 'rgb(0, 0, 0)'
		const barWidth = (canvas.width / bufferLength) * 2.5
		let x = 0
		for (let i = 0; i < bufferLength; i++) {
			const barHeight = dataArray[i] / 2
			context.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
			context.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight)
			x += barWidth + 1
		}
	}

	stopAudio() {
		if (this._audioStream) {
			const stream = this._audioStream
			if (stream) {
				stream.getTracks().forEach(track => {
					track.stop()
				})
			}
			this._audioStream = null
		}
		this._audioElm.selectAll('*').remove()
	}

	terminate() {
		super.terminate()
		this.stopAudio()
	}
}

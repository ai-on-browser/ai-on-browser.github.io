import { BaseData } from './base.js'

export default class AudioData extends BaseData {
	constructor(manager) {
		super(manager)
	}

	get availTask() {
		return ['SM']
	}

	get domain() {
		return [[-1, 1]]
	}

	async readAudio(data) {
		return new Promise(resolve => {
			const reader = new FileReader()
			reader.readAsArrayBuffer(data)
			reader.onload = () => {
				const audioCtx = new AudioContext()
				audioCtx.decodeAudioData(reader.result).then(resolve)
			}
		})
	}
}

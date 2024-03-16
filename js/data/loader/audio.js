export default class AudioLoader {
	static load(data) {
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

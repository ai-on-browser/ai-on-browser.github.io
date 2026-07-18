const AudioLoader = {
	/**
	 * Load audio data
	 * @param {Blob} data Audio data
	 * @returns {Promise<AudioBuffer>} Loaded AudioBuffer
	 */
	load(data) {
		return new Promise(resolve => {
			const reader = new FileReader()
			reader.readAsArrayBuffer(data)
			reader.onload = () => {
				const audioCtx = new AudioContext()
				audioCtx.decodeAudioData(reader.result).then(resolve)
			}
		})
	},
}

export default AudioLoader

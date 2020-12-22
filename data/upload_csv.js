import CSVData from './csv.js'

export default class IrisData extends CSVData {
	constructor(manager) {
		super(manager)
		const elm = this.setting.data.configElement
		const fileInput = elm.append("input")
			.attr("type", "file")
			.on("change", e => {
				if (!fileInput.node().files || fileInput.node().files.length <= 0) return
				this.setCSV(fileInput.node().files[0], null, true)
			})
	}

	get availTask() {
		return ['CF', 'RG', 'AD', 'DR', 'FS']
	}
}


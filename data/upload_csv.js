import CSVData from './csv.js'

export default class UploadData extends CSVData {
	constructor(manager) {
		super(manager)
		const elm = this.setting.data.configElement
		const fileInput = elm.append("input")
			.attr("type", "file")
			.on("change", e => {
				if (!fileInput.node().files || fileInput.node().files.length <= 0) return
				this.setCSV(fileInput.node().files[0], null, true)
			})
		elm.append("div")
			.text("You can only upload files in CSV format that have a header in the first line and a target variable in the last column.")
	}

	get availTask() {
		return ['CF', 'RG', 'AD', 'DR', 'FS']
	}
}


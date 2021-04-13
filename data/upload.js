import { BaseData } from './base.js'
import CSVData from './csv.js'
import ImageData from './image.js'

export default class UploadData extends BaseData {
	constructor(manager) {
		super(manager)
		const elm = this.setting.data.configElement
		const fileInput = elm.append("input")
			.attr("type", "file")
			.classed("data-upload", true)
			.on("change", e => {
				if (!fileInput.node().files || fileInput.node().files.length <= 0) return
				this.loadFile(fileInput.node().files[0])
			})
		elm.append("div")
			.text("You can upload Image/CSV files.")
			.classed("data-upload", true)
		elm.append("div")
			.text("CSV: A header in the first line and a target variable in the last column.")
			.classed("data-upload", true)
			.classed("sub-menu", true)
		elm.append("div")
			.text("Image: JPEG, PNG, BMP, GIF etc.")
			.classed("data-upload", true)
			.classed("sub-menu", true)
	}

	get availTask() {
		if (this._filetype === "image") {
			return ['SG', 'DN', 'ED']
		} else {
			return ['CF', 'RG', 'AD', 'DR', 'FS']
		}
	}

	loadFile(file) {
		this._file = file
		this._filetype = null
		if (file.type.startsWith("image/")) {
			this._filetype = "image"
		} else if (file.type === "") {
			this._filetype = "csv"
		} else {
			throw "Unknown file type: " + file.type
		}
		this.setting.data.configElement.selectAll(":not(.data-upload)").remove()
		this._renderer.terminate()

		if (this._filetype === "image") {
			UploadData.prototype.__proto__ = ImageData.prototype
			UploadData.__proto__ = ImageData
			this.readImage(file, data => {
				this._x = [data]
				this._y = [0]
				this._manager.platform.render && this._manager.platform.render()
			})
		} else {
			UploadData.prototype.__proto__ = CSVData.prototype
			UploadData.__proto__ = CSVData
			this._input_category_names = []
			this._output_category_names = []
			this.setCSV(file, null, true)
		}
		this.setting.ml.refresh()
		this.setting.vue.mlTask = ""
		this.setting.vue.$forceUpdate()
	}
}


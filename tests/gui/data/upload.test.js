import fs from 'fs'
import path from 'path'

import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()

		const dataURL = await page.evaluate(() => {
			const canvas = document.createElement('canvas')
			canvas.width = 100
			canvas.height = 100
			const context = canvas.getContext('2d')
			const imdata = context.createImageData(canvas.width, canvas.height)
			for (let i = 0, c = 0; i < canvas.height; i++) {
				for (let j = 0; j < canvas.width; j++, c += 4) {
					imdata.data[c] = Math.floor(Math.random() * 256)
					imdata.data[c + 1] = Math.floor(Math.random() * 256)
					imdata.data[c + 2] = Math.floor(Math.random() * 256)
					imdata.data[c + 3] = Math.random()
				}
			}
			context.putImageData(imdata, 0, 0)
			return canvas.toDataURL()
		})
		const data = dataURL.replace(/^data:image\/\w+;base64,/, '')
		const buf = Buffer.from(data, 'base64')
		await fs.promises.writeFile('image_upload.png', buf)
	})

	afterEach(async () => {
		await fs.promises.unlink('image_upload.png')
		await page?.close()
	})

	test('initialize', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('upload')

		const uploadFileInput = await page.waitForSelector('#ml_selector #data_menu input[type=file]')
		await uploadFileInput.setInputFiles(path.resolve('image_upload.png'))

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.points .datas circle')
		expect((await svg.$$('.points .datas circle')).length).toBe(1)
	})
})

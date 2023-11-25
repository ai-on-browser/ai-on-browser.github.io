import fs from 'fs'
import path from 'path'

import { getPage } from '../helper/browser'

describe('segmentation', () => {
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
		await fs.promises.writeFile('image_split_merge.png', buf)
	})

	afterEach(async () => {
		await fs.promises.unlink('image_split_merge.png')
		await page?.close()
	})

	test('initialize', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('upload')

		const uploadFileInput = await page.waitForSelector('#ml_selector #data_menu input[type=file]')
		await uploadFileInput.setInputFiles(path.resolve('image_split_merge.png'))

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('SG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('split_merge')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const method = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await method.getProperty('value')).jsonValue()).resolves.toBe('uniformity')
		const threshold = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await threshold.getProperty('value')).jsonValue()).resolves.toBe('10')
	})

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('upload')

		const uploadFileInput = await page.waitForSelector('#ml_selector #data_menu input[type=file]')
		await uploadFileInput.setInputFiles(path.resolve('image_split_merge.png'))

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('SG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('split_merge')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		await expect(page.$$('#image-area canvas')).resolves.toHaveLength(1)

		const fitButton = await buttons.waitForSelector('input[value=Fit]')
		await fitButton.evaluate(el => el.click())

		await expect(page.$$('#image-area canvas')).resolves.toHaveLength(2)
	})
})

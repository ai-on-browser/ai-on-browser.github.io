import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

/** @type {puppeteer.Browser} */
let browser
beforeAll(async () => {
	browser = await puppeteer.launch({ args: ['--no-sandbox'] })
})

afterAll(async () => {
	await browser.close()
})

describe('segmentation', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await browser.newPage()
		await page.goto(`http://${process.env.SERVER_HOST}/`)
		page.on('console', message => console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
			.on('pageerror', ({ message }) => console.log(message))
			.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
		await page.waitForSelector('#data_menu > *')

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
		await fs.promises.writeFile('image_sezan.png', buf)
	}, 10000)

	afterEach(async () => {
		await fs.promises.unlink('image_sezan.png')
	})

	test('initialize', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		dataSelectBox.select('upload')

		const uploadFileInput = await page.waitForSelector('#ml_selector #data_menu input[type=file]')
		await uploadFileInput.uploadFile(path.resolve('image_sezan.png'))

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('SG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('sezan')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const gamma = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await gamma.getProperty('value')).jsonValue()).resolves.toBe('0.5')
		const sigma = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await sigma.getProperty('value')).jsonValue()).resolves.toBe('5')
		const threshold = await buttons.waitForSelector('span:last-child')
		await expect(threshold.evaluate(el => el.textContent)).resolves.toBe('')
	}, 10000)

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		dataSelectBox.select('upload')

		const uploadFileInput = await page.waitForSelector('#ml_selector #data_menu input[type=file]')
		await uploadFileInput.uploadFile(path.resolve('image_sezan.png'))

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('SG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('sezan')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		await expect(page.$$('#image-area canvas')).resolves.toHaveLength(1)
		const threshold = await buttons.waitForSelector('span:last-child')
		await expect(threshold.evaluate(el => el.textContent)).resolves.toBe('')

		const fitButton = await buttons.waitForSelector('input[value=Fit]')
		await fitButton.evaluate(el => el.click())

		await expect(threshold.evaluate(el => el.textContent)).resolves.toMatch(/^[0-9.]+$/)
		await expect(page.$$('#image-area canvas')).resolves.toHaveLength(2)
	}, 10000)
})
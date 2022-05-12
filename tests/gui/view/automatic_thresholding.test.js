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
		await fs.promises.writeFile('image_automatic_thresholding.png', buf)
	}, 10000)

	afterEach(async () => {
		await fs.promises.unlink('image_automatic_thresholding.png')
	})

	test('initialize', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		dataSelectBox.select('upload')

		const uploadFileInput = await page.waitForSelector('#ml_selector #data_menu input[type=file]')
		await uploadFileInput.uploadFile(path.resolve('image_automatic_thresholding.png'))

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('SG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('automatic_thresholding')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
	}, 10000)

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		dataSelectBox.select('upload')

		const uploadFileInput = await page.waitForSelector('#ml_selector #data_menu input[type=file]')
		await uploadFileInput.uploadFile(path.resolve('image_automatic_thresholding.png'))

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('SG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('automatic_thresholding')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		await expect(page.$$('svg .predict-img *')).resolves.toHaveLength(0)

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const threshold = await buttons.waitForSelector('[name=threshold]')
		await expect(threshold.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
		await expect(threshold.evaluate(el => el.textContent)).resolves.toMatch(/^[0-9.]+$/)

		await expect(page.$$('svg .predict-img *')).resolves.toHaveLength(1)
	}, 10000)
})

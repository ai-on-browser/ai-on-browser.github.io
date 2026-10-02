import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	})

	afterEach(async () => {
		await page?.close()
	})

	describe('csv', () => {
		let buf
		beforeEach(async () => {
			let data = 'col1,col2,col3'
			for (let i = 0; i < 100; i++) {
				data += `\n${Math.random()},${Math.random()},${Math.random()}`
			}
			buf = Buffer.from(data)
		})

		test('initialize', async () => {
			const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
			await dataSelectBox.selectOption('upload')

			const uploadFileInput = page.locator('#ml_selector #data_menu input[type=file]')
			await uploadFileInput.setInputFiles({ name: 'csv_upload.csv', mimeType: 'text/csv', buffer: buf })

			const svg = page.locator('#plot-area svg')
			const circle = svg.locator('.points .datas circle')
			for (let i = 0; i < 10; i++) {
				const c = await circle.count()
				if (c > 0) {
					break
				}
			}
			await expect(circle.count()).resolves.toBe(100)
		})
	})

	describe('json', () => {
		let buf
		beforeEach(async () => {
			const data = []
			for (let i = 0; i < 100; i++) {
				data.push({ col1: Math.random(), col2: Math.random(), col3: Math.random() })
			}
			buf = Buffer.from(JSON.stringify(data))
		})

		test('initialize', async () => {
			const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
			await dataSelectBox.selectOption('upload')

			const uploadFileInput = page.locator('#ml_selector #data_menu input[type=file]')
			await uploadFileInput.setInputFiles({ name: 'json_upload.json', mimeType: 'application/json', buffer: buf })

			const svg = page.locator('#plot-area svg')
			const circle = svg.locator('.points .datas circle')
			for (let i = 0; i < 10; i++) {
				const c = await circle.count()
				if (c > 0) {
					break
				}
			}
			await expect(circle.count()).resolves.toBe(100)
		})
	})

	describe('image', () => {
		let buf
		beforeEach(async () => {
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
			buf = Buffer.from(data, 'base64')
		})

		test('initialize', async () => {
			const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
			await dataSelectBox.selectOption('upload')

			const uploadFileInput = page.locator('#ml_selector #data_menu input[type=file]')
			await uploadFileInput.setInputFiles({ name: 'image_upload.png', mimeType: 'image/png', buffer: buf })

			const svg = page.locator('#plot-area svg')
			await svg.locator('.points .datas circle').waitFor()
			await expect(svg.locator('.points .datas circle').count()).resolves.toBe(1)
		})
	})
})

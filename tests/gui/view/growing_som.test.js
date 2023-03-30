import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('growing_som')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const sf = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await sf.getProperty('value')).jsonValue()).resolves.toBe('0.1')
		const lr = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await lr.getProperty('value')).jsonValue()).resolves.toBe('0.1')

		const clusters = await buttons.waitForSelector('span')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('growing_som')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.datas circle')
		const circles = await svg.$$('.datas circle')
		const colors = new Set()
		for (const circle of circles) {
			const fill = await circle.evaluate(el => el.getAttribute('fill'))
			colors.add(fill)
		}
		expect(colors.size).toBeGreaterThanOrEqual(4)

		const centroids = await svg.$$('.centroids polygon')
		expect(centroids.length).toBeGreaterThanOrEqual(4)
		await expect(clusters.evaluate(el => +el.textContent[0])).resolves.toBeLessThanOrEqual(centroids.length)
	}, 10000)
})

import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('monothetic')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		expect.assertions(0)
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		await buttons.waitForSelector('input[value=Initialize]')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.textContent()).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())

		await expect(clusters.textContent()).resolves.toBe('0')

		const stepButton = await buttons.waitForSelector('input[value=Step]')
		await stepButton.evaluate(el => el.click())

		await expect(clusters.textContent()).resolves.toBe('2')

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.datas circle')
		const circles = await svg.$$('.datas circle')
		const colors = new Set()
		for (const circle of circles) {
			const fill = await circle.evaluate(el => el.getAttribute('fill'))
			colors.add(fill)
		}
		expect(colors.size).toBe(2)
	})
})

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
		await modelSelectBox.selectOption('diana')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('diana')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())

		const clusters = await buttons.waitForSelector('span:last-child')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0')

		const stepButton = await buttons.waitForSelector('input[value=Step]')
		await stepButton.evaluate(el => el.click())

		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('2')

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.datas circle')
		const circles = await svg.$$('.datas circle')
		const colors = new Set()
		for (const circle of circles) {
			const fill = await circle.evaluate(el => el.getAttribute('fill'))
			colors.add(fill)
		}
		expect(colors.size).toBe(2)
	}, 10000)
})

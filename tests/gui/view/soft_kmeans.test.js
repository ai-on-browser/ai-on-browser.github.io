import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('soft_kmeans')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const beta = buttons.locator('input:nth-of-type(1)')
		await expect(beta.inputValue()).resolves.toBe('10')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')

		const addClusterButton = buttons.locator('input[value="Add centroid"]')
		for (let i = 0; i < 2; i++) {
			await addClusterButton.dispatchEvent('click')
		}

		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(epoch.textContent()).resolves.toBe('1')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.datas circle')
		const colors = new Set()
		for (const circle of await circles.all()) {
			const fill = await circle.getAttribute('fill')
			colors.add(fill)
		}
		expect(colors.size).toBe(3)
	})
})

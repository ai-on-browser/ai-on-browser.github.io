import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const clusters = page.locator('#data_menu input[name=n]')
		await clusters.fill('1')
		const resetDataButton = page.locator('#data_menu input[value=Reset]')
		await resetDataButton.dispatchEvent('click')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('spectral')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const method = buttons.locator('select:nth-of-type(1)')
		await expect(method.inputValue()).resolves.toBe('rbf')
		const sigma = buttons.locator('input:nth-of-type(1)').first()
		await expect(sigma.inputValue()).resolves.toBe('1')
		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')

		const addClusterButton = buttons.locator('input[value="Add cluster"]')
		for (let i = 0; i < 3; i++) {
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

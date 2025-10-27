import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('gmm')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')

		const addButton = buttons.locator('input[value=Add\\ cluster]')
		await addButton.dispatchEvent('click')
		await expect(clusters.textContent()).resolves.toBe('1 clusters')

		const stepButton = buttons.locator('input[value=Step]')
		await stepButton.dispatchEvent('click')
		await expect(clusters.textContent()).resolves.toBe('1 clusters')

		const clearButton = buttons.locator('input[value=Clear]')
		await clearButton.dispatchEvent('click')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')
	})
})

import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('gmm')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')

		const addButton = await buttons.waitForSelector('input[value=Add\\ cluster]')
		await addButton.evaluate(el => el.click())
		await expect(clusters.textContent()).resolves.toBe('1 clusters')

		const stepButton = await buttons.waitForSelector('input[value=Step]')
		await stepButton.evaluate(el => el.click())
		await expect(clusters.textContent()).resolves.toBe('1 clusters')

		const clearButton = await buttons.waitForSelector('input[value=Clear]')
		await clearButton.evaluate(el => el.click())
		await expect(clusters.textContent()).resolves.toBe('0 clusters')
	})
})

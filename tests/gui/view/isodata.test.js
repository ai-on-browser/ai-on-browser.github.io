import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('isodata')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const init_k = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(init_k.getAttribute('value')).resolves.toBe('20')
		const max_k = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(max_k.getAttribute('value')).resolves.toBe('100')
		const min_k = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(min_k.getAttribute('value')).resolves.toBe('2')
		const min_n = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect(min_n.getAttribute('value')).resolves.toBe('2')
		const spl_std = await buttons.waitForSelector('input:nth-of-type(5)')
		await expect(spl_std.getAttribute('value')).resolves.toBe('1')
		const merge_dist = await buttons.waitForSelector('input:nth-of-type(6)')
		await expect(merge_dist.getAttribute('value')).resolves.toBe('0.1')
		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.textContent()).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(epoch.textContent()).resolves.toBe('1')
		expect(+(await clusters.textContent())).toBeGreaterThan(0)
	})
})

import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('vbgmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const alpha = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await alpha.getProperty('value')).jsonValue()).resolves.toBe('0.001')
		const beta = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await beta.getProperty('value')).jsonValue()).resolves.toBe('0.001')
		const k = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await k.getProperty('value')).jsonValue()).resolves.toBe('10')
		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('')
	})

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('vbgmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(clusters.evaluate(el => el.textContent)).resolves.toMatch(/^[0-9]+$/)
		await new Promise(resolve => setTimeout(resolve, 1000))
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
	})
})

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
		await modelSelectBox.selectOption('autoencoder')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const size = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await size.getProperty('value')).jsonValue()).resolves.toBe('10')
		const iteration = await buttons.waitForSelector(':scope > select:nth-of-type(2)')
		await expect((await iteration.getProperty('value')).jsonValue()).resolves.toBe('1')
		const rate = await buttons.waitForSelector(':scope > input:nth-of-type(3)')
		await expect((await rate.getProperty('value')).jsonValue()).resolves.toBe('0.001')
		const batch = await buttons.waitForSelector(':scope > input:nth-of-type(4)')
		await expect((await batch.getProperty('value')).jsonValue()).resolves.toBe('10')
		const rho = await buttons.waitForSelector(':scope > input:nth-of-type(5)')
		await expect((await rho.getProperty('value')).jsonValue()).resolves.toBe('0.02')
	})

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('autoencoder')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const methodFooter = await page.waitForSelector('#method_footer', { state: 'attached' })
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())
		await buttons.waitForSelector('input[value=Step]:enabled')

		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^loss/)
	})
})

import puppeteer from 'puppeteer'

import { getPage } from '../helper/browser'

describe('generate', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('GR')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('gan')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const type = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await type.getProperty('value')).jsonValue()).resolves.toBe('default')
		const noise = await buttons.waitForSelector(':scope > input:nth-of-type(1)')
		await expect((await noise.getProperty('value')).jsonValue()).resolves.toBe('5')
		const iteration = await buttons.waitForSelector(':scope > select:nth-of-type(2)')
		await expect((await iteration.getProperty('value')).jsonValue()).resolves.toBe('1')
		const grate = await buttons.waitForSelector(':scope > div:nth-of-type(2) div:nth-child(1) input')
		await expect((await grate.getProperty('value')).jsonValue()).resolves.toBe('0.01')
		const drate = await buttons.waitForSelector(':scope > div:nth-of-type(2) div:nth-child(2) input')
		await expect((await drate.getProperty('value')).jsonValue()).resolves.toBe('0.5')
		const batch = await buttons.waitForSelector(':scope > input:nth-of-type(3)')
		await expect((await batch.getProperty('value')).jsonValue()).resolves.toBe('10')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('GR')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('gan')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const methodFooter = await page.waitForSelector('#method_footer')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		await new Promise(resolve => setTimeout(resolve, 1000))
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())
		await buttons.waitForSelector('input[value=Step]:enabled')

		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^generator/)
	}, 10000)
})

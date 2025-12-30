import { rmse } from '../../../lib/evaluate/regression.js'
import MARS from '../../../lib/model/mars.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', { timeout: 30000 }, () => {
	const model = new MARS(20)
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 2 + 5]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test('fit update best lof', () => {
	const model = new MARS(20)
	const x = [
		[0.4946112861933446, -0.24979407544789328],
		[0.6710977380517686, 2.760557507387143],
		[-0.5451316855831966, -1.7861984864750804],
		[1.5413600325044114, 0.6113068721545195],
		[-0.15915692646845286, 0.36163408767347377],
		[-4.456221847339759, 2.6448274560926066],
		[0.9859756767948494, -0.7623872449215827],
		[1.6964768061759719, 4.561617731454047],
		[-3.0039970134614746, 3.7582323314173856],
	]
	const t = [
		[5.0135998349450785],
		[8.344300706946722],
		[2.8613517704846276],
		[6.965641204443869],
		[5.4431303914749085],
		[3.072585145244251],
		[5.404783275862362],
		[11.42125315864682],
		[5.875750792935508],
	]
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

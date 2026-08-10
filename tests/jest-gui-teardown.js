import server from './gui/helper/server.js'

export default async () => {
	await server.close()
}

class HTTPResponse {
	constructor(status, body) {
		this.status = status
		this.body = body
	}
}

class ErrorResponse extends HTTPResponse {
	constructor(message) {
		super('error', { message })
	}
}

class Response extends HTTPResponse {
	constructor(res) {
		super('ok', res)
	}
}

module.exports = {
	ErrorResponse,
	Response
}

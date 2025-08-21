export interface ApiErrors {
  BadRequest: {
    type: 'badRequest'
    message: string
  }
  NotFound: {
    type: 'notFound'
    message: string
  }
  NetworkError: {
    type: 'network'
    message: string
  }
}

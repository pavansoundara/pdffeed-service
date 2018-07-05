let baseUrl
if (process.env.NODE_ENV === 'development') {
  baseUrl = 'http://localhost:3000/api'
} else if (process.env.NODE_ENV === 'production') {
  baseUrl = 'https://pdffeed.com/api'
}

export const CHECKER_API = baseUrl + '/Checker'
export const GETLINKS_API = CHECKER_API + '/getLinks'
export const CHECKLINKS_API = CHECKER_API + '/checkLinks'

export const CONTAINER_API = baseUrl + '/Container'
export const UPLOAD_API = CONTAINER_API + '/files/upload'

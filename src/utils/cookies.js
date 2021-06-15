export const tokenKey = 'paw_token'

export const cookieParser = () => {
  const { cookie } = document
  const parsed = {}
  cookie.split('; ').forEach((c) => {
    const spc = c.split('=')
    const key = spc[0]
    const val = spc[1]
    parsed[key] = val
  })

  return parsed
}

export const getTokenFromCookie = () => {
  // Get cookies as an object;
  const parsed = cookieParser()
  // If cookies innclude token
  if (Object.keys(parsed).includes(tokenKey)) {
    return parsed[tokenKey]
  }
}

export const setTokenFromCookie = () => {
  // Get cookies as an object;
  const parsed = cookieParser()
  // If cookies innclude token
  if (Object.keys(parsed).includes(tokenKey)) {
    // Get token value and set to localStorage
    localStorage.setItem(tokenKey, parsed[tokenKey])
  } else {
    localStorage.removeItem(tokenKey)
  }
}

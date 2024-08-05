const crypto = require('crypto')

const generateSessionSecret = () => {
  return crypto.randomBytes(64).toString('hex')
}

const sessionSecret = generateSessionSecret()
console.log('Your Express session secret is:', sessionSecret)

import { api } from './http.js'

/** POST /api/v1/auth/change-password { oldPassword, newPassword } */
export function changePassword(body) {
  return api('/api/v1/auth/change-password', {
    method: 'POST',
    body: {
      oldPassword: body.oldPassword,
      newPassword: body.newPassword
    }
  })
}

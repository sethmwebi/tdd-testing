export const fetchResponseOk = (status = 500, body = {}) => ({ok: false, status, json: () => Promise.resolve(body)})

export const fetchResponseError = (status = 500, body = {}) => ({ok: false, status, json: () => Promise.resolve(body)})
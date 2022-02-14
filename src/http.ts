import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import Swal from 'sweetalert2'
import { AxiosRequest } from './types/axios'

export function createHttp(options: AxiosRequestConfig) {
  const instance = axios.create({
    timeout: 10000,
    responseType: 'json',
    ...options,
  })

  instance.interceptors.response.use(
    function transformResponseHook(res) {
      const resData = res.data
      const { action } = res.config

      const { code, data, msg } = resData

      if (code === 0) {
        return data
      }
      let message = `[${code}] ${msg}`
      if (action) message += `(${action})`
      Swal.fire({
        text: message,
        icon: 'warning',
        confirmButtonText: '关闭',
      })
      return Promise.reject(new Error(message))
    },
    function tranformResponseError(error: AxiosError) {
      const config = error.config
      const action = config && config.action
      let message = '网络请求错误'
      if (action) message += `(${action})`
      error.message = message
      Swal.fire({
        text: message,
        icon: 'warning',
        confirmButtonText: '关闭',
      })
      return Promise.reject(error)
    }
  )

  return instance.request.bind(instance) as AxiosRequest
}

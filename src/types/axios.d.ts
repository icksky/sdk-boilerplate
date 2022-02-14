declare module 'axios' {
  export interface AxiosRequestConfig {
    action?: string // 接口说明, 报错时显示
  }
}

export interface ResponseResult<T = any> {
  code: number
  msg?: string
  data: T
}

export type AxiosRequest = <T = any>(...args: Parameters<AxiosInstance['request']>) => Promise<T>

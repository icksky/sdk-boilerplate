declare global {
  interface Window {
    //
  }

  declare type Recordable<T = any> = Record<string | number, T>

  declare type Nullable<T> = T | null

  declare type Undefinable<T> = T | undefined

  declare type ValueOf<T> = T[keyof T]

  declare type Functional<T, K = any[]> = T | ((...args: K) => T)

  declare namespace NodeJS {
    interface ProcessEnv {
      PUBLIC_PATH: string
    }
  }
}

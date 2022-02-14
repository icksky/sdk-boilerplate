export type MySDK = (options: any) => Promise<SDKReturnTypes>

interface SDKReturnTypes {
  log: () => void
}

declare global {
  const mySDK: MySDK
}

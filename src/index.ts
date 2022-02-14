import { name, version } from 'package.json'

export default async function mySDK(opt: any) {
  console.log(name, version)

  function log() {
    console.log(opt)
  }

  return {
    log,
  }
}

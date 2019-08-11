import request, { RequestCallback } from 'request'
import { Stream } from 'stream'

type VoidFn = (...args: any[]) => void

export interface LanguageInfo {
  text: string
  language: {
    language: number
    languages: string[]
    languageName: string
    languageCode: string
    reliable: boolean
    languageCodeISO639_3: string
    languageCodes: string[]
  }
  meta: { [key: string]: string }
}

export interface ClientOptions {
  protocol: 'http' | 'https'
  host: string
  port: number
}

export const DefautlOptions: ClientOptions = {
  protocol: 'http',
  host: 'localhost',
  port: 5656,
}

const settings = (): ClientOptions => {
  const { LS_PROTOCOL, LS_HOST, LS_PORT } = process.env
  if (!LS_HOST || !LS_PORT || !LS_PROTOCOL) {
    console.warn('Missing environment variable(s)')
    return DefautlOptions
  }
  return {
    protocol: LS_PROTOCOL === 'https' ? 'https' : 'http',
    host: LS_HOST,
    port: +LS_PORT,
  }
}

export class Client {
  private readonly service: string

  public constructor(options: ClientOptions = settings()) {
    const { protocol, host, port } = options
    this.service = `${protocol}://${host}:${port}`
  }

  // POST /?url
  public readonly url = async (url: string): Promise<LanguageInfo> => {
    return new Promise((resolve, reject) => {
      const cb = this.callback(resolve, reject)
      const endpoint = `${this.path()}?url=${url}`
      request.post(endpoint, cb)
    })
  }

  // POST /stream
  public readonly stream = async (stream: Stream): Promise<LanguageInfo> => {
    return new Promise((resolve, reject) => {
      const cb = this.callback(resolve, reject)
      const endpoint = this.path('stream')
      stream.pipe(request.post(endpoint, cb))
    })
  }

  private callback = (resolve: VoidFn, reject: VoidFn): RequestCallback => {
    return (error, { statusCode }, body) => {
      const ok = statusCode === 200 && !error
      if (ok) {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      } else {
        reject(!!error ? error : new Error(body))
      }
    }
  }

  private readonly path = (...segments: string[]) => [this.service, ...segments].join('/')
}

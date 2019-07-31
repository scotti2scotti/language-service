# Docker Microservice for Language Detection and Text Extraction

## The service

The service is based on [CLD2Owners's Compact Language Detector 2](https://github.com/CLD2Owners/cld2),
using [commoncrawl's java wrapper](https://github.com/commoncrawl/language-detection-cld2),
for language detection,
and on [Apache Tika](https://tika.apache.org/)
for text extraction.

It's a docker container hosted at [scotti2scotti/language-service](https://hub.docker.com/r/scotti2scotti/language-service),
to pull:

```bash
docker pull scotti2scotti/language-service
```

It's a web service listening on `0.0.0.0:5656` by default, you may configure the host and port via two `ENV` variables:
`LS_HOST` and `LS_PORT`:

```bash
docker run -d -e LS_HOST=${LS_HOST} -e LS_PORT=${LS_PORT} -p 5656:${LS_PORT} --rm --name language-service language-service
```

The web service has two `POST` endpoints:

```http
POST /?url=
POST /stream
```

The first accepts the url of the resource you want to analyze as the value of the query string key url.

The second accepts the content of the resource as the body of the request.

Both endpoints return a json object of the following form, with some [...] of truncated values for brevity:

```http
POST /?url=https://scotti2scotti.com/about
```

```json
{
  "text": " scotti&scotti home notes Web Applications NLP DevOps Web Applications are at the core of scotti&scotti [...] ",
  "language": {
    "language": 0,
    "languages": ["ENGLISH"],
    "reliable": true,
    "languageName": "ENGLISH",
    "languageCode": "en",
    "languageCodeISO639_3": "eng",
    "languageCodes": ["en"]
  },
  "meta": {
    "og:image": "https://scotti2scotti.com/images/s2s-logo-300.png",
    "X-Parsed-By": "org.apache.tika.parser.DefaultParser",
    "og:type": "website",
    "keywords": "web applications, natural language processing, software, database",
    "og:title": "scotti&scotti software house: the craft of knowledge",
    "description": "scotti&scotti llc is the software house of web applications [...] ",
    "title": "scotti&scotti software house: the craft of knowledge",
    "og:description": "scotti&scotti llc is the software house of web [...]",
    "X-UA-Compatible": "ie=edge",
    "viewport": "width=device-width, initial-scale=1.0",
    "dc:title": "scotti&scotti software house: the craft of knowledge",
    "Content-Encoding": "UTF-8",
    "og:url": "https://scotti2scotti.com",
    "Content-Language": "en",
    "Content-Type": "text/html; charset=UTF-8",
    "format-detection": "telephone=no"
  }
}
```

where:

- `text` is the extracted text
- `language` is an object whose keys are defined by [CLD2Owners](https://github.com/CLD2Owners/cld2/blob/master/internal/lang_script.h)
- `meta` are the meta tags extracted by tika

## The client

A very simple javascript client written in typescript is available as an npm package:

```bash
npm i -S @s2s/language-service-client
```

It defines a few interfaces and a class:

```typescript
export interface LanguageInfo {
  text: string;
  language: {
    language: number;
    languages: string[];
    languageName: string;
    languageCode: string;
    reliable: boolean;
    languageCodeISO639_3: string;
    languageCodes: string[];
  };
  meta: {
    [key: string]: string;
  };
}
export interface ClientOptions {
  protocol: "http" | "https";
  host: string;
  port: number;
}
export declare const DefautlOptions: ClientOptions;
export declare class Client {
  private readonly service;
  constructor(options?: ClientOptions);
  readonly url: (url: string) => Promise<LanguageInfo>;
  readonly stream: (stream: Stream) => Promise<LanguageInfo>;
  private callback;
  private readonly path;
}
```

## License

Source code and docker image are [Apache 2.0 licensed](./LICENSE).
Also [CLD2](https://github.com/CLD2Owners/cld2/blob/master/LICENSE),
[weslang](https://github.com/deezer/weslang/blob/master/LICENSE),
[commoncrawl](https://github.com/commoncrawl/language-detection-cld2/blob/master/LICENSE)
and all dependencies use the Apache 2.0 license.

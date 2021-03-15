# Changelog

## [0.3.1](https://github.com/adobe/aio-lib-cloudmanager/compare/0.3.0...0.3.1) (2021-03-15)


### Bug Fixes

* **deps:** allow renovate to automerge all dev dependencies except husky ([a2ce038](https://github.com/adobe/aio-lib-cloudmanager/commit/a2ce0383fb2886cbd3f0600418ae289806fe945a))

# [0.3.0](https://github.com/adobe/aio-lib-cloudmanager/compare/0.2.1...0.3.0) (2021-02-07)


### Features

* add listExecutions() method. fixes [#60](https://github.com/adobe/aio-lib-cloudmanager/issues/60) ([#61](https://github.com/adobe/aio-lib-cloudmanager/issues/61)) ([5e6e9b9](https://github.com/adobe/aio-lib-cloudmanager/commit/5e6e9b958db2940743a96938d02bfef73ac6bd66))

## [0.2.1](https://github.com/adobe/aio-lib-cloudmanager/compare/0.2.0...0.2.1) (2021-01-20)


### Bug Fixes

* **auth:** some response bodies were not correctly handled. fixes [#53](https://github.com/adobe/aio-lib-cloudmanager/issues/53) ([#54](https://github.com/adobe/aio-lib-cloudmanager/issues/54)) ([5ee68ee](https://github.com/adobe/aio-lib-cloudmanager/commit/5ee68ee0dd8b2294dae877d9ef3a50eec459d0f0))

# [0.2.0](https://github.com/adobe/aio-lib-cloudmanager/compare/0.1.6...0.2.0) (2021-01-12)


### Features

* **ip-allowlists:** implement IP allow list in SDK. fixes [#45](https://github.com/adobe/aio-lib-cloudmanager/issues/45) ([#46](https://github.com/adobe/aio-lib-cloudmanager/issues/46)) ([6f95342](https://github.com/adobe/aio-lib-cloudmanager/commit/6f95342e6694023e8a648f2b7181fb6eb11f55c5))

## [0.1.6](https://github.com/adobe/aio-lib-cloudmanager/compare/0.1.5...0.1.6) (2021-01-12)


### Bug Fixes

* **build:** correct jsdoc generation to work with js-yaml v4 ([#44](https://github.com/adobe/aio-lib-cloudmanager/issues/44)) ([e2b57ab](https://github.com/adobe/aio-lib-cloudmanager/commit/e2b57ab15c88908ff001406c813955ec9d75e705))

## [0.1.5](https://github.com/adobe/aio-lib-cloudmanager/compare/0.1.4...0.1.5) (2020-11-16)


### Bug Fixes

* **build:** testing semantic release ([390e33b](https://github.com/adobe/aio-lib-cloudmanager/commit/390e33b02518655173bdaeeb7b0c2e0611675188))

## 0.1.4 (16/11/2020)
- [**bug**] Some unnecessary code duplication around finding entities [#19](https://github.com/adobe/aio-lib-cloudmanager/issues/19)
- [**bug**] Not all problem types are handled [#17](https://github.com/adobe/aio-lib-cloudmanager/issues/17)

---

## 0.1.3 (11/11/2020)

- No functional changes. Purely to test releasing via GitHub Actions

---

## 0.1.1 (11/11/2020)
-  Add environmentId to generated pipeline step state type [#15](https://github.com/adobe/aio-lib-cloudmanager/issues/15)
-  Error code ERROR_RETRIEVE_ENVIRONMENTS is misworded [#12](https://github.com/adobe/aio-lib-cloudmanager/issues/12)

---

## 0.1.0 (26/10/2020)
-  Create a new method which returns a new execution object upon creation [#10](https://github.com/adobe/aio-lib-cloudmanager/issues/10)
-  Inconsistent error handling in updatePipeline [#8](https://github.com/adobe/aio-lib-cloudmanager/issues/8)
-  ListProgramOptions should be named ListPipelineOptions [#6](https://github.com/adobe/aio-lib-cloudmanager/issues/6)

---

## 0.0.2 (29/09/2020)
- [**enhancement**] getCurrentStep should be exported [#3](https://github.com/adobe/aio-lib-cloudmanager/issues/3)

## 0.0.1 (28/02/2020)
- Initial release

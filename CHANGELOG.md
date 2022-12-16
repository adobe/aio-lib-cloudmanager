# Changelog

# [3.0.0](https://github.com/adobe/aio-lib-cloudmanager/compare/2.0.0...3.0.0) (2022-12-16)


### Bug Fixes

* **deps:** update dependencies to incorporate http proxy bugfix. fixes [#374](https://github.com/adobe/aio-lib-cloudmanager/issues/374) ([32c1d39](https://github.com/adobe/aio-lib-cloudmanager/commit/32c1d3958dc3b26aa9b34616ea5423d588bfaa8b))
* **deps:** update dependencies to incorporate http proxy bugfix. fixes [#374](https://github.com/adobe/aio-lib-cloudmanager/issues/374) ([5651847](https://github.com/adobe/aio-lib-cloudmanager/commit/5651847db096a985d04a21184fdf7e5eebc9427d))


### chore

* reverted version change and will let the bot do this ([2ba0305](https://github.com/adobe/aio-lib-cloudmanager/commit/2ba03057351b08efe64bd06c3139a1db0194365b))


### BREAKING CHANGES

* **deps:** dependent library reference has been updated to a new major version
* dependent library reference has been updated to a new major version

# [2.0.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.14.1...2.0.0) (2022-03-01)


### Features

* **commerce:** remove commerce support. fixes [#358](https://github.com/adobe/aio-lib-cloudmanager/issues/358) ([#359](https://github.com/adobe/aio-lib-cloudmanager/issues/359)) ([1559cc3](https://github.com/adobe/aio-lib-cloudmanager/commit/1559cc3306f07514ede629b15650e3a7803e52b5))


### BREAKING CHANGES

* **commerce:** methods have been removed

## [1.14.1](https://github.com/adobe/aio-lib-cloudmanager/compare/1.14.0...1.14.1) (2022-01-31)


### Bug Fixes

* **environment-tail:** improve debug output for environment log tailing. fixes [#341](https://github.com/adobe/aio-lib-cloudmanager/issues/341) ([#342](https://github.com/adobe/aio-lib-cloudmanager/issues/342)) ([9288290](https://github.com/adobe/aio-lib-cloudmanager/commit/9288290f7a7b438e7e4ab96ff27444979a910484))

# [1.14.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.13.0...1.14.0) (2021-11-23)


### Features

* **updatePipeline:** add support for changing environment id. fixes [#305](https://github.com/adobe/aio-lib-cloudmanager/issues/305) ([#306](https://github.com/adobe/aio-lib-cloudmanager/issues/306)) ([5871972](https://github.com/adobe/aio-lib-cloudmanager/commit/58719724d91a3ee8b98d3103df6c9b88669bea4a))

# [1.13.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.12.1...1.13.0) (2021-11-17)


### Features

* **commerce:** update HAL link relationship for creating a commerce command execution. fixes [#302](https://github.com/adobe/aio-lib-cloudmanager/issues/302) ([83e4f84](https://github.com/adobe/aio-lib-cloudmanager/commit/83e4f84d3c8f241ae0e851173356e434a9705f47))

## [1.12.1](https://github.com/adobe/aio-lib-cloudmanager/compare/1.12.0...1.12.1) (2021-11-09)


### Bug Fixes

* **deps:** replace lodash with individual modules. fixes [#299](https://github.com/adobe/aio-lib-cloudmanager/issues/299) ([#300](https://github.com/adobe/aio-lib-cloudmanager/issues/300)) ([3ab14c4](https://github.com/adobe/aio-lib-cloudmanager/commit/3ab14c473812a06efc498d84cfaca97d50a2c2f4))

# [1.12.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.11.0...1.12.0) (2021-10-26)


### Features

* **commerce:** enable downloading of commerce command logs for completed commands. fixes [#274](https://github.com/adobe/aio-lib-cloudmanager/issues/274) ([cb7ca13](https://github.com/adobe/aio-lib-cloudmanager/commit/cb7ca13ac3041318039a749ab99c254556f2a4c3))

# [1.11.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.10.1...1.11.0) (2021-10-25)


### Features

* **error:** add the requestId to the error object. fixes [#281](https://github.com/adobe/aio-lib-cloudmanager/issues/281) ([#282](https://github.com/adobe/aio-lib-cloudmanager/issues/282)) ([69fb9c5](https://github.com/adobe/aio-lib-cloudmanager/commit/69fb9c5eaf20cf5746bca30f37c6d3644dd29c52))

## [1.10.1](https://github.com/adobe/aio-lib-cloudmanager/compare/1.10.0...1.10.1) (2021-10-25)


### Bug Fixes

* **docs:** sort member functions in alphabetical order. fixes [#279](https://github.com/adobe/aio-lib-cloudmanager/issues/279) ([#280](https://github.com/adobe/aio-lib-cloudmanager/issues/280)) ([2b58da8](https://github.com/adobe/aio-lib-cloudmanager/commit/2b58da86830eae9cf27c534bdc8f24714040ebee))

# [1.10.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.9.0...1.10.0) (2021-10-14)


### Features

* **createExecution:** support pipeline execution mode. fixes [#266](https://github.com/adobe/aio-lib-cloudmanager/issues/266) ([#267](https://github.com/adobe/aio-lib-cloudmanager/issues/267)) ([c3e5459](https://github.com/adobe/aio-lib-cloudmanager/commit/c3e5459aade5d38c2fd00549719c6ec5c288a3eb))

# [1.9.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.8.1...1.9.0) (2021-10-06)


### Features

* switch from cross-fetch to @adobe/aio-lib-core-networking to support proxy usage. fixes [#250](https://github.com/adobe/aio-lib-cloudmanager/issues/250) ([#251](https://github.com/adobe/aio-lib-cloudmanager/issues/251)) ([2376ddc](https://github.com/adobe/aio-lib-cloudmanager/commit/2376ddc96c9b9c5dcf29939cf2bc1436dacbf4d4))

## [1.8.1](https://github.com/adobe/aio-lib-cloudmanager/compare/1.8.0...1.8.1) (2021-09-23)


### Bug Fixes

* **commerce-tail-log:** continue to poll commerce execution log until ready. fixes [#239](https://github.com/adobe/aio-lib-cloudmanager/issues/239) ([5a78ef2](https://github.com/adobe/aio-lib-cloudmanager/commit/5a78ef2fbb4844505d903a34a3872fe6ad227c73))

# [1.8.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.7.0...1.8.0) (2021-09-13)


### Features

* **commerce:** improve log format for commerce command executions [#227](https://github.com/adobe/aio-lib-cloudmanager/issues/227) ([d91fd1a](https://github.com/adobe/aio-lib-cloudmanager/commit/d91fd1ae70cee8129491bda09cae221c21404b44))

# [1.7.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.6.0...1.7.0) (2021-09-07)


### Features

* **commerce:** add getCommerceCommandExecutions. fixes [#220](https://github.com/adobe/aio-lib-cloudmanager/issues/220) ([13ceb32](https://github.com/adobe/aio-lib-cloudmanager/commit/13ceb329e4aa9316aa2c502378c7a87007688194))

# [1.6.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.5.0...1.6.0) (2021-08-30)


### Features

* **commerce:** enable tailing a commerce execution command. fixes [#206](https://github.com/adobe/aio-lib-cloudmanager/issues/206) ([4d75b3e](https://github.com/adobe/aio-lib-cloudmanager/commit/4d75b3e6769cd0fe4d4dfae0363f9e84d813eb88))

# [1.5.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.4.0...1.5.0) (2021-08-19)


### Features

* **commerce:** update getCommerceCLICommand. fixes [#208](https://github.com/adobe/aio-lib-cloudmanager/issues/208) ([#209](https://github.com/adobe/aio-lib-cloudmanager/issues/209)) ([2864afa](https://github.com/adobe/aio-lib-cloudmanager/commit/2864afa1772271963a499b0fdfa0bac7efc26437))

# [1.4.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.3.0...1.4.0) (2021-08-12)


### Features

* **pipeline:** add invalidatePipelineCache support. fixes [#204](https://github.com/adobe/aio-lib-cloudmanager/issues/204) ([#205](https://github.com/adobe/aio-lib-cloudmanager/issues/205)) ([1795fed](https://github.com/adobe/aio-lib-cloudmanager/commit/1795fedef0458a9f1e171ba5349eeec5e146e3d5))

# [1.3.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.2.0...1.3.0) (2021-07-27)


### Features

* **commerce:** add getCommerceCLICommand. fixes [#178](https://github.com/adobe/aio-lib-cloudmanager/issues/178) ([#196](https://github.com/adobe/aio-lib-cloudmanager/issues/196)) ([a0c9b61](https://github.com/adobe/aio-lib-cloudmanager/commit/a0c9b61c58ab8302974f15e7177b40974ade50c3))

# [1.2.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.1.1...1.2.0) (2021-07-27)


### Features

* **commerce:** added postCommerceCLICommand. fixes [#177](https://github.com/adobe/aio-lib-cloudmanager/issues/177) ([#184](https://github.com/adobe/aio-lib-cloudmanager/issues/184)) ([26e8c91](https://github.com/adobe/aio-lib-cloudmanager/commit/26e8c9196572cacd578980a1def02a6926f7bb3e))

## [1.1.1](https://github.com/adobe/aio-lib-cloudmanager/compare/1.1.0...1.1.1) (2021-06-30)


### Bug Fixes

* remove console.log statement from tailExecutionStepLog. fixes [#172](https://github.com/adobe/aio-lib-cloudmanager/issues/172) ([#173](https://github.com/adobe/aio-lib-cloudmanager/issues/173)) ([87f3692](https://github.com/adobe/aio-lib-cloudmanager/commit/87f3692fe66c7df6c3657e088e48d764976540fd))

# [1.1.0](https://github.com/adobe/aio-lib-cloudmanager/compare/1.0.1...1.1.0) (2021-06-30)


### Features

* **execution:** add tailExecutionStepLog method. fixes [#170](https://github.com/adobe/aio-lib-cloudmanager/issues/170) ([#171](https://github.com/adobe/aio-lib-cloudmanager/issues/171)) ([36dbcb0](https://github.com/adobe/aio-lib-cloudmanager/commit/36dbcb05fea4bf9ca40cdcd35d6ebe3185e250fc))

## [1.0.1](https://github.com/adobe/aio-lib-cloudmanager/compare/1.0.0...1.0.1) (2021-06-30)


### Bug Fixes

* **debt:** reduce complexity in createIpAllowList. fixes [#168](https://github.com/adobe/aio-lib-cloudmanager/issues/168) ([#169](https://github.com/adobe/aio-lib-cloudmanager/issues/169)) ([c63b982](https://github.com/adobe/aio-lib-cloudmanager/commit/c63b98243f187ae3c90e30ccf4bad9e3cd98ea46))

# [1.0.0](https://github.com/adobe/aio-lib-cloudmanager/compare/0.3.5...1.0.0) (2021-06-25)


### Features

* require node 12 as minimum version. fixes [#163](https://github.com/adobe/aio-lib-cloudmanager/issues/163) ([#164](https://github.com/adobe/aio-lib-cloudmanager/issues/164)) ([7a7aa46](https://github.com/adobe/aio-lib-cloudmanager/commit/7a7aa46de54a67d06b79fff031551795bdbc8adc))


### BREAKING CHANGES

* Support for TLS 1.0 and 1.1 is being retired by Adobe in mid-July.

## [0.3.5](https://github.com/adobe/aio-lib-cloudmanager/compare/0.3.4...0.3.5) (2021-04-30)


### Bug Fixes

* **advance:** fix error code usage in advance for unsupported step. fixes [#117](https://github.com/adobe/aio-lib-cloudmanager/issues/117) ([#119](https://github.com/adobe/aio-lib-cloudmanager/issues/119)) ([9ea7662](https://github.com/adobe/aio-lib-cloudmanager/commit/9ea7662e572fd4ac5194ceb8737cfb7ace438772))

## [0.3.4](https://github.com/adobe/aio-lib-cloudmanager/compare/0.3.3...0.3.4) (2021-04-30)


### Bug Fixes

* **logs:** correct usage of error codes in _download. fixes [#116](https://github.com/adobe/aio-lib-cloudmanager/issues/116) ([#118](https://github.com/adobe/aio-lib-cloudmanager/issues/118)) ([06a5fbd](https://github.com/adobe/aio-lib-cloudmanager/commit/06a5fbd1b24870d556c8a09cc0a5cb4ef6d1c59f))

## [0.3.3](https://github.com/adobe/aio-lib-cloudmanager/compare/0.3.2...0.3.3) (2021-04-30)


### Bug Fixes

* **logs:** correct error handling in _getLogs. fixes [#114](https://github.com/adobe/aio-lib-cloudmanager/issues/114) ([#115](https://github.com/adobe/aio-lib-cloudmanager/issues/115)) ([5ad7712](https://github.com/adobe/aio-lib-cloudmanager/commit/5ad77127de0d2c457f8b7e3eaa8cfcb286c52cce))

## [0.3.2](https://github.com/adobe/aio-lib-cloudmanager/compare/0.3.1...0.3.2) (2021-04-01)


### Bug Fixes

* **variables:** output variables validation issues in error message. fixes [#96](https://github.com/adobe/aio-lib-cloudmanager/issues/96) ([#97](https://github.com/adobe/aio-lib-cloudmanager/issues/97)) ([26c363d](https://github.com/adobe/aio-lib-cloudmanager/commit/26c363d496b9affe0863d26379fb2406d9981c02))

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

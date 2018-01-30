'use strict'

const config = {
  roots: ['<rootDir>/src'],
  setupFiles: [
    /**
     * В версии jsdom, используемой jest не polifill для requestAnimationFrame,
     * который нужен для работы React 16. Поэтому добавим его сами.
     *
     * TODO: Удалить этот файл (вместе с ним пакет raf), когда jest зарелизит версию 21.3.0,
     * в которой будет это: https://github.com/facebook/jest/pull/4568
     **/
    'raf/polyfill',

    '<rootDir>/configs/jest/enzyme',
  ],
  snapshotSerializers: ['enzyme-to-json/serializer'],
}

module.exports = config

## RocksBot

### Dependency injection

Manual injections (if any) should be first in the constructor, then the auto deducted ones. The manual injections are provided in second parameter of `resolve()`

### Run in development mode

`npm run start:dev`
_(production mode soon)_

### Run in production mode

`npm run build && npm run start:prod`

# React Act

A way to avoid calling `act()` when testing React hooks.

## Installation

```
npm i react-act
```

## Usage

```js
import 'react-act'

// write your tests without having to call `act()`
```

**Important note**

This library is a temporary workaround while waiting for `atc()` to support async actions. Its implementation forces changes to be synchronous, which is not how React behave on browser.

## How? and Why?

Check [this article](https://github.com/webNeat/react-act/blob/master/story.md) to know why and how did I create this.

## Contributing

Feel free to open issues or submit Pull requests :D

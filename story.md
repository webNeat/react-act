React hooks are awesome, but testing them is not easy. Let's take a simple custom hook that stores and validates an input value.

```js
const useInput = (validate, value) => {
  const [state, setState] = React.useState({
    value: value || '',
    error: null,
    isValidating: false
  })
  const setValue = async value => {
    setState({value, error: null, isValidating: true})
    const error = await validate(value)
    setState(state => ({value, error, isValidating: false}))
  }
  return {...state, setValue}
}
```

The **validate** argument is an async function that will take the value and return a validation error or `null`.

> Wait, why is the validate function asynchronous?

Because for example, to check if a username is available, we need to send a request to the server and wait for the response.

Now let's write the most trivial test using [Jest](https://jestjs.io).

```js
test('it validates value', async () => {
  const notEmpty = async value => {
    if (value.trim().length == 0) {
      return 'This input is required'
    }
    return null
  }
  const input = useInput(notEmpty)
  await input.setValue('  ')
  expect(input.error).toBe('This input is required')
})
```

This test will fail with the following message

```
Invariant Violation: Hooks can only be called inside the body of a function component. (https://fb.me/react-invalid-hook-call)
```

This means that we need to:

- Create a React component.
- Call our hook inside the component.
- Render the component.

Ok, let's use [react-testing-library](https://github.com/kentcdodds/react-testing-library) to render the component. Our test becomes:

```js
import React from 'react'
import {render} from 'react-testing-library'

test('it validates value', async () => {
  const notEmpty = async value => {
    if (value.trim().length == 0) {
      return 'This input is required'
    }
    return null
  }
  let input
  const Wrapper = ({validate, value}) => {
    input = useInput(validate, value)
    return null
  }
  render(<Wrapper validate={notEmpty} />)
  await input.setValue('  ')
  expect(input.error).toBe('This input is required')
})
```

Yey! it passes. But we have a warning two times:

```
Warning: An update to Wrapper inside a test was not wrapped in act(...).
```

This warning is saying that, since `input.setValue` will cause a state change, it should be wrapped in `act`.

Ok, let's do

```js
act(async () => {
  await input.setValue('  ')
})
expect(input.error).toBe('This input is required')
```

Oh no, the test fails and I have an other warning

```
Warning: The callback passed to ReactTestUtils.act(...) function must not return anything.
```

Ok, let's just call `input.setValue` without `await` and then use `wait` from `react-testing-library` to wait for the error to change.

```js
act(() => {
  input.setValue('  ')
})
wait(() => expect(input.error).toBe('This input is required'))
```

Now the test passes but I still have this warning

```
Warning: An update to Wrapper inside a test was not wrapped in act(...).
```

> But why? we used act to wrap the call changing the state, so what's the problem?

The problem is that the `input.setValue` action is asynchronous and it does the following:

- changes the state.
- waits for the validation.
- changes the state again.

While `act` runs its callback synchronously, meaning that it only takes the first state change into account. So the second state change runs outside the `act` call!

The easiest workaround I found for this problem is to override `React.useState` so that the setter it returns is always wrapped with `act`. So I created a file `use-act.js`:

```js
import React from 'react'
import {act} from 'react-dom/test-utils'

const useState = React.useState

React.useState = (initial, ...others) => {
  const [value, setValue] = useState(initial, ...others)
  const set = (...args) => {
    let result
    act(() => {
      result = setValue(...args)
    })
    return result
  }
  return [value, set]
}
```

Then I included it at the top of my test file. This solved the issue and no need to write `act` again on my tests!

Later I did the same for `useReducer` and published the [`react-act`](https://github.com/webNeat/react-act) tool.

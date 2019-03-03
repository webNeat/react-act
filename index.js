const React = require('react')
const {act} = require('react-dom/test-utils')

const wrap = fn => (...args) => {
  let result
  act(() => {
    result = fn(...args)
  })
  return result
}

const useState = React.useState
const useReducer = React.useReducer

React.useState = (...params) => {
  const result = useState(...params)
  result[1] = wrap(result[1])
  return result
}

React.useReducer = (...params) => {
  const result = useReducer(...params)
  result[1] = wrap(result[1])
  return result
}
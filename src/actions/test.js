export const START_TEST = 'START_TEST'
export const END_TEST = 'END_TEST'

export const startTest = omAccessMode => ({
  type: START_TEST,
  payload: {
    omAccessMode
  }
})

export const endTest = () => ({
  type: END_TEST
})

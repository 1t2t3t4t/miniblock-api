let date!: number

before(() => {
    date = Date.now()
})

after(() => {
    const finishedDate = Date.now()
    console.log('Test total time', (finishedDate - date), 'ms.')
})
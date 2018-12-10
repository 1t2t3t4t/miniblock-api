const asFunc = () => {
    return new Promise(r => setTimeout(() => {
        r('DONE')
    }, 1000))
}

const call = () => {
    return asFunc()
}

call().then((r) => {
    console.log(r)
})


console.log('HERE')
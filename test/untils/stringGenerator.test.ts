import stringGenerator from "../../src/utils/stringGenerator";
import assert from 'assert'

describe('String Generator', () => {
    it('Should return correct length', () => {
        const str = stringGenerator(69)
        assert.deepEqual(str.length, 69)
    })
})
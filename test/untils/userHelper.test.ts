import assert from 'assert'
import {anonymousDisplayName} from "../../src/utils/userHelper";

describe('Generate anonymous name', () => {
    it('Length of 1 get xxxxx', () => {
        assert.deepEqual(anonymousDisplayName('a'), 'xxxxx')
    })

    it('ab get axxxb', () => {
        assert.deepEqual(anonymousDisplayName('ab'), 'axxxb')
    })

    it('BosS get bxxxs', () => {
        assert.deepEqual(anonymousDisplayName('BosS'), 'bxxxs')
    })
})
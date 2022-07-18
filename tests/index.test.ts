import { prepareApi, runTestFile } from '../src/test-helpers';

describe('testing index file', () => {
  test('empty string should result in zero', (done) => {
    expect.assertions(1);
    prepareApi(done).then((api) => {
      api.on('stats_changed', (text) => {
        expect(text).toBe('works');
        done();
      });
      runTestFile(
        api,
        `#start
---
#test
p 'works'
---`
      );
    });
  });
});

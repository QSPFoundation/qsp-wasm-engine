import { init } from "../src/lib/qsp-engine";

 
describe('testing index file', () => {
  test('empty string should result in zero', async () => {
    init(new ArrayBuffer(0));
  });
});
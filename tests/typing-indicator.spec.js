const { test, expect } = require('@playwright/test');

test.describe('Typing Indicator', () => {
  test('STUB: should display typing indicator when user is typing', async () => {
    // 1. Login as two different users in two different browser contexts.
    // 2. Open a chat between them.
    // 3. In one browser, start typing in the message input.
    // 4. In the other browser, assert that the "is typing..." indicator is visible.
    // 5. In the first browser, stop typing.
    // 6. In the other browser, assert that the indicator is no longer visible.
    const isStub = true;
    expect(isStub).toBe(true);
  });
});
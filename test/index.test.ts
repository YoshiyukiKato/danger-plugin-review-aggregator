import { aggregate } from "../src"
import {parseMock, parseMockAsync} from "./fixture/mock-parser";

declare const global: any
beforeEach(() => {
  global.warn = jest.fn()
  global.message = jest.fn()
  global.fail = jest.fn()
  global.markdown = jest.fn()
  global.danger = { utils: { sentence: jest.fn() } }
})

afterEach(() => {
  global.warn = undefined
  global.message = undefined
  global.fail = undefined
  global.markdown = undefined
})

const mockFilePath = __dirname + "/fixture/mock-review.json";

describe("aggregate", () => {
  it("use sync parser", async () => {
    await aggregate({ 
      reviewFiles: [
        {
          parser: parseMock,
          paths: [mockFilePath]
        }
      ]
    });
    expect(global.warn).toHaveBeenCalledWith("this is mock message", "mock/file/path", 1);
  });

  it("use async parser", async () => {
    await aggregate({ 
      reviewFiles: [
        {
          parser: parseMockAsync,
          paths: [mockFilePath]
        }
      ]
    });
    expect(global.warn).toHaveBeenCalledWith("this is mock message", "mock/file/path", 1);
  });

  it("skips because paths is empty", async () => {
    await aggregate({ 
      reviewFiles: [
        {
          parser: parseMock,
          paths: []
        }
      ]
    });
    expect(global.warn).not.toBeCalled();
  });
})
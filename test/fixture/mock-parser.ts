import {EAction, IReviewComment} from "../../src"


export function parseMock(str): IReviewComment[]{
  const mocks = JSON.parse(str);
  return mocks.map((mock) => { 
    return {
      action: { 1 : EAction.warn }[mock.severity],
      message: mock.message,
      file: mock.file,
      line: mock.line
    }
  });
}

export async function parseMockAsync(str): Promise<IReviewComment[]>{
  const mocks = JSON.parse(str);
  return mocks.map((mock) => { 
    return {
      action: { 1 : EAction.warn }[mock.severity],
      message: mock.message,
      file: mock.file,
      line: mock.line
    }
  });
}
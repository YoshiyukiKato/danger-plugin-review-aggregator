import * as danger from "danger";
import {readFile} from "fs-extra"
import * as glob from "fast-glob";

export interface IAggregateConfig {
  reviewFiles: IReviewFile[];
}

export interface IReviewFile {
  paths: string[];
  parser: (string) => IReviewComment[];
}

export interface IReviewComment {
  action: EAction;
  message: string;
  file?: string;
  line?: number;
  metadata?: any;
}

export enum EAction {
  message,
  warn,
  fail,
  markdown
}

type TDangerReviewMethod = (message: string, file?: string|undefined, line?: number|undefined) => void;
const reviewCommand:Map<EAction, TDangerReviewMethod> = new Map();
reviewCommand.set(EAction.message, danger.message);
reviewCommand.set(EAction.warn, danger.warn);
reviewCommand.set(EAction.fail, danger.fail);
reviewCommand.set(EAction.markdown, danger.markdown);
function unexpectedActionHandler (action, metadata, message, file, line) {
  console.error(`[Error] Unexpected action error. Action '${action}' is not defined. It may be caused by parser problems.`);
  console.info(`[INFO] A failed review message info:`);
  console.info(`  metadata: ${JSON.stringify(metadata)}`);
  console.info(`  file: ${file}`);
  console.info(`  line: ${line}`);
  console.info(`  message: ${message}`);
}

export async function aggregate({reviewFiles}: IAggregateConfig){
  const reviewComments = await readReviewComments(reviewFiles);
  reviewComments.forEach(({action, message, file, line, metadata}) => {
    (reviewCommand.get(action) || unexpectedActionHandler.bind(null, action, metadata))(message, file, line);
  });
}

async function readReviewComments(reviewFiles:IReviewFile[]){
  return (await Promise.all(reviewFiles.map(async ({paths, parser}) => {
    const entries:string[] = await glob.async(paths);
    const rawReviews:string[] = await readRawReviewFiles(entries);
    return rawReviews.reduce((acc, rawComment) => [...acc, ...parser(rawComment)], []);
  }))).reduce((acc, reviewComments) => [...acc, ...reviewComments]);
}

async function readRawReviewFiles(entries:string[]){
  return (await Promise.all(entries.map(readFile))).map(buf => buf.toString());
}
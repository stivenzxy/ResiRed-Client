import { choiceInfoResponse } from "./choiceInfoResponse";

export interface updateQuestionRequest {
    description: string;
    choices: choiceInfoResponse[];
}
export type Coding = {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export type QuestionnaireItemAnswerOption = {
  valueCoding?: Coding;
  valueInteger?: number;
  valueDate?: string;
  valueTime?: string;
  valueString?: string;
  initialSelected?: boolean;
}

export type QuestionnaireItem = {
  linkId: string;
  definition?: string;
  code?: Coding[];
  prefix?: string;
  text?: string;
  type: 'group' | 'display' | 'boolean' | 'decimal' | 'integer' | 'date' | 'dateTime' | 'time' | 'string' | 'text' | 'url' | 'choice' | 'open-choice' | 'attachment' | 'reference' | 'quantity';
  enableWhen?: Array<{
    question: string;
    operator: string;
    answerBoolean?: boolean;
    answerDecimal?: number;
    answerInteger?: number;
    answerDate?: string;
    answerDateTime?: string;
    answerTime?: string;
    answerString?: string;
    answerCoding?: Coding;
  }>;
  enableBehavior?: string;
  required?: boolean;
  repeats?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  answerValueSet?: string;
  answerOption?: QuestionnaireItemAnswerOption[];
  initial?: Array<{
    valueBoolean?: boolean;
    valueDecimal?: number;
    valueInteger?: number;
    valueDate?: string;
    valueDateTime?: string;
    valueTime?: string;
    valueString?: string;
    valueCoding?: Coding;
  }>;
  item?: QuestionnaireItem[];
}

export type Questionnaire = {
  resourceType: 'Questionnaire';
  id: string;
  url?: string;
  version?: string;
  name?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  subjectType?: string[];
  date?: string;
  publisher?: string;
  description?: string;
  item?: QuestionnaireItem[];
}

export type QuestionnaireResponseAnswer = {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueString?: string;
  valueUri?: string;
  valueCoding?: Coding;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  item?: QuestionnaireResponseItem[];
}

export type QuestionnaireResponseItem = {
  linkId: string;
  definition?: string;
  text?: string;
  answer?: QuestionnaireResponseAnswer[];
  item?: QuestionnaireResponseItem[];
}

export type QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse';
  id?: string;
  questionnaire?: string;
  status: 'in-progress' | 'completed' | 'amended' | 'entered-in-error' | 'stopped';
  authored?: string;
  item?: QuestionnaireResponseItem[];
}

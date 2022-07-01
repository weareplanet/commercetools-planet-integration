export enum DatatransEnvironment {
  PROD = 'prod',
  TEST = 'test'
}

export {
  type RequestBodySchemaType as IWebhookRequestBody
} from '../domain/environment-agnostic-handlers/per-operation-handlers/webhook-notification/request-schema';

export enum DatatransPaymentMethod {
  ACC = 'ACC',
  ALP = 'ALP',
  APL = 'APL',
  AMX = 'AMX',
  AZP = 'AZP',
  BAC = 'BAC',
  BON = 'BON',
  CFY = 'CFY',
  CSY = 'CSY',
  CUP = 'CUP',
  DEA = 'DEA',
  DIN = 'DIN',
  DII = 'DII',
  DIB = 'DIB',
  DIS = 'DIS',
  DNK = 'DNK',
  ECA = 'ECA',
  ELV = 'ELV',
  EPS = 'EPS',
  ESY = 'ESY',
  GPA = 'GPA',
  INT = 'INT',
  JCB = 'JCB',
  JEL = 'JEL',
  KLN = 'KLN',
  MAU = 'MAU',
  MDP = 'MDP',
  MFA = 'MFA',
  MFX = 'MFX',
  MPX = 'MPX',
  MYO = 'MYO',
  PAP = 'PAP',
  PAY = 'PAY',
  PEF = 'PEF',
  PFC = 'PFC',
  PSC = 'PSC',
  REK = 'REK',
  SAM = 'SAM',
  SWB = 'SWB',
  SCX = 'SCX',
  SWP = 'SWP',
  TWI = 'TWI',
  UAP = 'UAP',
  VIS = 'VIS',
  WEC = 'WEC'
}

export enum DatatransTransactionStatus {
  initialized = 'initialized',
  challenge_required = 'challenge_required',
  challenge_ongoing = 'challenge_ongoing',
  authenticated = 'authenticated',
  authorized = 'authorized',
  settled = 'settled',
  canceled = 'canceled',
  transmitted = 'transmitted',
  failed = 'failed'
}

export interface IDatatransInitializeTransaction {
  currency: string; // 3 letter ISO-4217
  refno: string; // [1...20]
  amount?: number;
  paymentMethods?: DatatransPaymentMethod[];
  language?: string;
  option?: {
    createAlias?: boolean;
    [key: string]: unknown;
  };
  redirect?: {
    successUrl: string;
    cancelUrl: string;
    errorUrl: string;
  };
  webhook: {
    url: string;
  }
  [key: string]: unknown;
}

class PaymentApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;

  constructor(resultStub: jest.SpyInstance) {
    this.result = resultStub || jest.fn();
  }

  withKey() {
    return this;
  }

  get() {
    return this;
  }

  post() {
    return this;
  }

  async execute() {
    return this.result();
  }
}

class CustomObjectsApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;

  constructor(resultStub: jest.SpyInstance) {
    this.result = resultStub || jest.fn();
  }

  withKey() {
    return this;
  }

  withContainerAndKey() {
    return this;
  }

  get() {
    return this;
  }

  async execute() {
    return this.result();
  }
}

interface ApiRootStubArgs {
  payment?: jest.SpyInstance;
  customObject?: jest.SpyInstance;
}

class ApiRoot {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private paymentResult: jest.SpyInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private customObjectResult: jest.SpyInstance;

  constructor(stub: ApiRootStubArgs) {
    if (stub.customObject) {
      this.customObjectResult = stub.customObject;
    }
    if (stub.payment) {
      this.paymentResult = stub.payment;
    }
  }

  withProjectKey() {
    return this;
  }

  payments() {
    return new PaymentApi(this.paymentResult);
  }

  customObjects() {
    return new CustomObjectsApi(this.customObjectResult);
  }
}

export const commerceToolsClientFactory = (apiRootStubArgs: ApiRootStubArgs) => {
  return new ApiRoot(apiRootStubArgs);
};

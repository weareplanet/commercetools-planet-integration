class PaymentApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;

  withKey() {
    return this;
  }

  get() {
    this.result = []; // TODO: insert payment data

    return this;
  }

  post() {
    this.result = {}; // TODO: insert payment data

    return this;
  }

  async execute() {
    return this.result;
  }
}

class CustomObjectsApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;

  withKey() {
    return this;
  }

  withContainerAndKey() {
    return this;
  }

  get() {
    this.result = {
      value: [{
        paymentMethod: 'VIS',
        card: {
          alias: 'savedPaymentMethodAlias value'
        }
      }]
    }; // TODO: fill CustomObject data

    return this;
  }

  async execute() {
    return ({ body: this.result });
  }
}

class ApiRoot {
  withProjectKey() {
    console.info('--- withProjectKey ', this);
    return this;
  }

  payments() {
    return new PaymentApi();
  }

  customObjects() {
    return new CustomObjectsApi();
  }
}

export const commerceToolsClientFactory = () => {
  return new ApiRoot();
};

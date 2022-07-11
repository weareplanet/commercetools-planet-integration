import { detectUsecase, UseCase, PaymentInterface } from './usecase-detector';

describe('Operation mapping', () => {
  it('should return "Redirect And Lightbox Init"', () => {
    const req = {
      body: {
        action: 'Create',
        resource: {
          obj: {
            paymentMethodInfo: {
              paymentInterface: PaymentInterface.DataTransRedirectIntegration,
            },
            custom: {
              fields: {}
            },
            paymentStatus: {}
          }
        }
      }
    };

    const result = detectUsecase(req);

    expect(result).toEqual(UseCase.RedirectAndLightboxInit);
  });

  it('should return empty string', () => {
    const result = detectUsecase({
      body: {
        resource: {
          obj: {}
        }
      }
    });

    expect(result).toEqual('');
  });
});

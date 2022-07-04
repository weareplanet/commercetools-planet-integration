import { ExtentionAction, IExtensionRequestBody } from '../../../interfaces';
import { getOperation, PaymentCreateOperation, PaymentInterface } from './operations-mapper';

describe('Operation mapping', () => {
  it('should return "Redirect And Lightbox Init"', () => {
    const body: IExtensionRequestBody = {
      action: ExtentionAction.Create,
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
    };

    const result = getOperation(body);

    expect(result).toEqual(PaymentCreateOperation.RedirectAndLightboxInit);
  });

  it('should return empty string', () => {
    const body = {
      resource: {
        obj: {}
      }
    } as IExtensionRequestBody;

    const result = getOperation(body);

    expect(result).toEqual('');
  });
});

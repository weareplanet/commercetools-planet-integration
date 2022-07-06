import { ExtensionAction, ICommerceToolsExtensionRequestBoby } from '../../../interfaces';
import { detectOperation, PaymentCreateOperation, PaymentInterface } from './operation-detector';

describe('Operation mapping', () => {
  it('should return "Redirect And Lightbox Init"', () => {
    const body: ICommerceToolsExtensionRequestBoby = {
      action: ExtensionAction.Create,
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

    const result = detectOperation(body);

    expect(result).toEqual(PaymentCreateOperation.RedirectAndLightboxInit);
  });

  it('should return empty string', () => {
    const body = {
      resource: {
        obj: {}
      }
    } as ICommerceToolsExtensionRequestBoby;

    const result = detectOperation(body);

    expect(result).toEqual('');
  });
});

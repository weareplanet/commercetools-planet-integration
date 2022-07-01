import { ICommerceToolsExtensionRequestBoby } from '../../../interfaces';
import { detectOperation, PaymentCreateOperation, PaymentInterface } from './operation-detector';

describe('Operation mapping', () => {
  it('should return "Redirect And Lightbox Init"', () => {
    const body: ICommerceToolsExtensionRequestBoby = {
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
    } as ICommerceToolsExtensionRequestBoby; // TODO: Find a solution for optional fields in the Yup.TypeOf result...

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

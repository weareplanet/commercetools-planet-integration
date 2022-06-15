import * as yup from 'yup';

import { InputValidationService } from '.';

describe('InputValidationService', () => {
  let service: InputValidationService;
  beforeEach(() => {
    service = new InputValidationService();
  });

  describe('#transformAndValidate', () => {

    describe('success cases', () => {

      it('doesn\'t throw when the input passes the schema validation', () => {
        expect(() => {
          service.transformAndValidate({ a: 42 }, yup.object({ a: yup.number() }));
          service.transformAndValidate({ b: true }, yup.object({ b: yup.boolean() }));
        })
          .not.toThrowError();
      });

      it('transforms the value (coerses it to the appropriate type) as defined in schema', () => {
        expect(service.transformAndValidate('{ "a": "42" }', yup.object({ a: yup.number() })))
          .toStrictEqual({ a: 42 });

        expect(service.transformAndValidate('{ "b": true }', yup.object({ b: yup.boolean() })))
          .toStrictEqual({ b: true });
      });

      it('allows the input object to have unknown values by default', () => {
        expect(service.transformAndValidate({ a: 42, b: true }, yup.object({ a: yup.number() })))
          .toStrictEqual({ a: 42, b: true });
      });

    });

    describe('error cases', () => {

      it('throws an error when the input doesn\'t pass schema validation', () => {
        const fakeSchema = yup.object({ a: yup.string().required() });
        const emptyObject = {};
        expect(() => service.transformAndValidate(emptyObject, fakeSchema)).toThrowError();
      });

      it('throws an error when the input object has unknown properties and options contain { strict: true }', () => {
        expect(() => {
          service.transformAndValidate(
            { a: 42, b: true },
            yup.object({ a: yup.number() }),
            { strict: true }
          );
        })
          .toThrowError();
      });
    });

  });
});

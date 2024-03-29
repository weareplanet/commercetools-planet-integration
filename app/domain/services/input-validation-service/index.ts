import { ObjectSchema } from 'yup';
import { ObjectShape, AssertsShape, TypeOfShape } from 'yup/lib/object';
import { ValidateOptions } from 'yup/lib/types';

import { ServiceWithLogger } from '../log-service';

export class InputValidationService extends ServiceWithLogger {

  transformAndValidate<TShape extends ObjectShape>(
    value: unknown,
    schema: ObjectSchema<TShape>,
    opts?: ValidateOptions
  ): AssertsShape<TShape> | Extract<TypeOfShape<TShape>, null> {
    if (opts?.strict) schema = schema.noUnknown();

    const result = schema.validateSync(value, opts);

    return result;
  }

}

import type { InputProps } from "ra-core";
import { useInput, useResourceContext, FieldTitle } from "ra-core";
import { FormControl, FormError, FormField } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import {
  HatchField,
  HatchTextInput,
  HatchTextareaInput,
} from "@/components/hatch-crm/_primitives";

export type TextInputProps = InputProps & {
  multiline?: boolean;
  inputClassName?: string;
} & React.ComponentProps<"textarea"> &
  React.ComponentProps<"input">;

/**
 * Single-line or multiline text input for string values.
 *
 * Use `<TextInput>` for short text fields like titles or names. Set `multiline` to `true`
 * for longer content like descriptions or comments. Wraps shadcn's `<Input>` or `<Textarea>`
 * component depending on the `multiline` prop.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/textinput/ TextInput documentation}
 *
 * @example
 * import { Edit, SimpleForm, TextInput } from '@/components/admin';
 *
 * const PostEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <TextInput source="title" />
 *       <TextInput source="description" multiline rows={4} />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const TextInput = (props: TextInputProps) => {
  const resource = useResourceContext(props);
  const {
    label,
    source,
    multiline,
    className,
    inputClassName,
    helperText,
    validate: _validateProp,
    format: _formatProp,
    ...rest
  } = props;
  const { id, field, isRequired } = useInput(props);

  return (
    <FormField id={id} className={className} name={field.name}>
      <HatchField
        htmlFor={id}
        label={
          label !== false ? (
            <FieldTitle
              label={label}
              source={source}
              resource={resource}
              isRequired={isRequired}
            />
          ) : undefined
        }
      >
        <FormControl>
          {multiline ? (
            <HatchTextareaInput
              {...rest}
              {...field}
              className={inputClassName}
            />
          ) : (
            <HatchTextInput {...rest} {...field} className={inputClassName} />
          )}
        </FormControl>
      </HatchField>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

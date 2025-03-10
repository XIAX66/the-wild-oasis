import Input from "../../lib/ui/Input";
import Form from "../../lib/ui/Form";
import Button from "../../lib/ui/Button";
import FileInput from "../../lib/ui/FileInput";
import Textarea from "../../lib/ui/Textarea";
import { useForm } from "react-hook-form";
import FormRow from "../../lib/ui/FormRow";
import { useCreateCabin, useUpdateCabin } from "./useCabinMutation";

function CreateCabinForm({ cabinToEdit = {}, onCloseModal }) {
  const { _id: cabinID, ...editValues } = cabinToEdit;
  const isEditSession = Boolean(cabinID);

  const { register, handleSubmit, reset, getValues, formState } = useForm({
    defaultValues: isEditSession ? editValues : {},
  });
  const { errors } = formState;

  const { createCabinByMutate, isCreating } = useCreateCabin();

  const { updateCabinByMutate, isUpdating } = useUpdateCabin();

  const onSubmit = (data) => {
    const formData = new FormData();

    // 添加所有表单字段
    Object.keys(data).forEach((key) => {
      if (key !== "image") formData.append(key, data[key]);
    });

    // 添加图片文件
    if (typeof data.image === "string") formData.append("image", data.image);
    else formData.append("image", data.image[0]);

    if (isEditSession) {
      updateCabinByMutate(
        { id: cabinID, newCabinData: formData },
        {
          onSuccess: (data) => {
            reset();
            onCloseModal?.();
          },
        }
      );
    } else {
      createCabinByMutate(formData, {
        onSuccess: (data) => {
          reset();
          onCloseModal?.();
        },
      });
    }
  };

  const onError = (errors) => {
    console.error(errors);
  };

  const isWorking = isCreating || isUpdating;

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      type={onCloseModal ? "modal" : "regular"}
    >
      <FormRow label="Cabin name" error={errors?.name?.message}>
        <Input
          type="text"
          id="name"
          disabled={isWorking}
          {...register("name", {
            required: "Cabin name is required",
            min: {
              value: 1,
              message: "Cabin name must be at least 1 characters long",
            },
          })}
        />
      </FormRow>

      <FormRow label="Maximum capacity" error={errors?.maxCapacity?.message}>
        <Input
          type="number"
          id="maxCapacity"
          disabled={isWorking}
          {...register("maxCapacity", {
            required: "Maximum capacity is required",
            min: {
              value: 1,
              message: "Maximum capacity must be at least 1 person",
            },
          })}
        />
      </FormRow>

      <FormRow label="Regular price" error={errors?.regularPrice?.message}>
        <Input
          type="number"
          id="regularPrice"
          disabled={isWorking}
          {...register("regularPrice", {
            required: "Regular price is required",
            min: {
              value: 1,
              message: "Regular price must be at least 1 person",
            },
          })}
        />
      </FormRow>

      <FormRow label="Discount" error={errors?.discount?.message}>
        <Input
          type="number"
          id="discount"
          defaultValue={0}
          disabled={isWorking}
          {...register("discount", {
            required: "Discount is required",
            validate: (value) =>
              (Number(value) >= 0 &&
                Number(value) <= Number(getValues().regularPrice)) ||
              "Discount must be between 0 and regular price",
          })}
        />
      </FormRow>

      <FormRow
        label="Description for website"
        error={errors?.description?.message}
      >
        <Textarea
          type="number"
          id="description"
          defaultValue=""
          disabled={isWorking}
          {...register("description", {
            required: "Description is required",
          })}
        />
      </FormRow>

      <FormRow label="Cabin photo">
        <FileInput
          id="image"
          accept="image/*"
          {...register("image", {
            required: isEditSession ? false : "Image is required",
          })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>
        <Button disabled={isWorking}>
          {isEditSession ? "Edit cabin" : "Edit cabin"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreateCabinForm;

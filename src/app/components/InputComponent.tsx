import Image from "next/image";
import { useForm } from "react-hook-form";

type FormValue = {
  productQuestion: string;
};
export const InputComponent = ({
  onSubmit,
}: {
  onSubmit: (value: string, reset: () => void) => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValue>();

  const handleFormSubmit = ({ productQuestion }: FormValue) => {
    onSubmit(productQuestion, reset); // Call the onSubmit callback from props
  };

  return (
    <div className="space-y-4 w-full">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="relative">
          <input
            {...register("productQuestion", {
              required: "This field is required",
            })}
            placeholder="Enter Cisco PID or Product"
            type="text"
            className="mt-1 block w-full h-[45px] bg-[#FFE45A]/10 rounded-[10px] border border-[#A2A2A2] pl-4 py-3 pr-10 placeholder:text-black/70"
          />
          {errors.productQuestion && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productQuestion.message}
            </p>
          )}

          <div
            className="absolute top-3 right-3.5 cursor-pointer"
            onClick={handleSubmit(handleFormSubmit)}
          >
            <Image src="/images/arrow.svg" alt="arrow" width={20} height={20} />
          </div>
        </div>
      </form>
    </div>
  );
};

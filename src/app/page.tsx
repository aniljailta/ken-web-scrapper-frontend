"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const { data: sessionUser } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ productQuestion: string }>();

  const [messages, setMessages] = useState<{ type: string; content: string }[]>(
    []
  );
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const onSubmit = async (data: { productQuestion: string }) => {
    if (!data.productQuestion) return;

    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "question", content: data.productQuestion },
      ]);

      setIsTyping(true);

      const passwordHex = (process.env.NEXT_PUBLIC_QUERY_PASSWORD as string)
        .split("")
        .map((char) => char.charCodeAt(0).toString(16))
        .join("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/product-query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              sessionUser ? sessionUser.user.access_token : ""
            }`,
          },
          body: JSON.stringify({
            question: data.productQuestion,
            password: passwordHex,
          }),
        }
      );

      const responseData = await res.json();
      setIsTyping(false);
      reset(); // Reset form after submission

      if (responseData.data) {
        simulateTypingEffect(responseData.data);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "response",
            content: responseData.message || "No response received",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "response", content: "Something went wrong." },
      ]);
    }
  };

  // Simulate Typing Effect
  const simulateTypingEffect = (response: string) => {
    let index = 0;
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "response", content: "" },
    ]);

    const typingInterval = setInterval(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg, i) =>
          i === prevMessages.length - 1 && msg.type === "response"
            ? { ...msg, content: msg.content + response[index - 1] }
            : msg
        )
      );
      index++;

      if (index >= response.length) {
        clearInterval(typingInterval);
      }
    }, 20);
  };

  const InputComponent = () => {
    return (
      <div className="space-y-4 w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative max-w-lg mx-auto">
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
              onClick={handleSubmit(onSubmit)}
            >
              <Image
                src="/images/arrow.svg"
                alt="arrow"
                width={20}
                height={20}
              />
            </div>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="flex min-h-[78vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full h-full max-w-xl space-y-8">
        {messages.length === 0 && (
          <div className="space-y-9">
            <h1 className="text-center text-3xl text-[32px] font-medium tracking-tight text-gray-900">
              What PID do you have?
            </h1>

            <InputComponent />
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 max-w-3xl">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg break-words text-base font-light text-black/75`}
                >
                  {message.content}
                </div>
              ))}

              {isTyping && (
                <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg break-words">
                  <span className="animate-pulse">Retrieving PID...</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <InputComponent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

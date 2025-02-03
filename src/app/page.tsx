"use client";

// import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  // const router = useRouter();
  const [productQuestion, setProductQuestion] = useState("");
  const [messages, setMessages] = useState<{ type: string; content: string }[]>(
    []
  );
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productQuestion) {
      return;
    }
    try {
      // Add the user's question to the messages list
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "question", content: productQuestion },
      ]);

      setIsTyping(true); // Show "Typing..." while fetching

      const passwordHex = (process.env.NEXT_PUBLIC_QUERY_PASSWORD as string)
        .split("")
        .map((char) => char.charCodeAt(0).toString(16))
        .join("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/product-query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: productQuestion,
            password: passwordHex,
          }),
        }
      );

      const responseData = await res.json();

      setIsTyping(true);
      simulateTypingEffect(responseData.data);

      // if (responseData.isAIResponse) {
      // } else {
      //   console.log({ data: responseData.data });
      // }
    } catch (err) {
      console.log({ err });
    } finally {
      // Clear the input field after submission
      setProductQuestion("");
      setIsTyping(false);
    }
  };

  // Function to simulate typing effect
  const simulateTypingEffect = (response: string) => {
    let index = 0;
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "response", content: "" }, // Ensure response starts as empty
    ]);

    const typingInterval = setInterval(() => {
      setMessages((prevMessages) => {
        return prevMessages.map((msg, i) =>
          i === prevMessages.length - 1 && msg.type === "response"
            ? { ...msg, content: msg.content + response[index - 1] } // Append character
            : msg
        );
      });

      index++;

      if (index >= response.length) {
        clearInterval(typingInterval);
      }
    }, 20);
  };

  return (
    <div>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-9">
            <h1 className="text-center text-3xl text-[32px] font-medium tracking-tight text-gray-900">
              What PID do you have?
            </h1>
            <div className="space-y-4 w-full max-w-2xl mx-auto ">
              <form onSubmit={handleSubmit}>
                <input
                  placeholder="Enter Cisco PID or Product"
                  type="name"
                  required
                  value={productQuestion}
                  onChange={(e) => setProductQuestion(e.target.value)}
                  className="mt-1 block w-full h-[45px] bg-[#FFE45A]/10 rounded-[10px] border border-[#A2A2A2] px-4 py-3  placeholder:text-black/70"
                />
              </form>
            </div>

            {/* Display the conversation */}
            <div className="space-y-4 max-w-3xl">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg break-words text-base font-light text-black/75`}
                >
                  {message.content}
                </div>
              ))}

              {/* Show typing indicator when the bot is typing */}
              {isTyping && (
                <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg break-words">
                  <span className="animate-pulse">Retrieving PID...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

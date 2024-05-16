import { useState } from "react";
import { useTranslation } from "react-i18next";
import botImg from "../assets/rounded-bot.png";
import { SendHorizontal } from "lucide-react";
import { http } from "../http";
const SubmitForm = ({ setMessages, messages, setAmounts, setCategories }) => {
  const [inputValue, setInputValue] = useState("");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const fetchUserBalance = async () => {
    try {
      const res = await http.get("/userbalance");
      const data = res.data;
      if (res.status === 200) {
        const formattedBalance = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
        }).format(data.accountBalance);

        setMessages((messages) => [
          ...messages,
          {
            text: `${t("api-answers.balance")}${formattedBalance} ${t(
              "currency.SAR"
            )} `,
            sender: "bot",
            time: new Date().toLocaleString([], {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to fetch balance");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((messages) => [
        ...messages,
        {
          text: error.message,
          sender: "bot",
          time: new Date().toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };
  const fetch_recent_transactions = async () => {
    try {
      const res = await http.get("/recent_transactions");
      const data = res.data;

      if (res.status === 200) {
        if (data.transactions && data.transactions.length > 0) {
          const grouped = data.transactions.reduce((acc, transaction) => {
            const date = new Date(transaction.date).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(transaction);
            return acc;
          }, {});

          let transactionMessage = "";
          Object.keys(grouped)
            .sort((a, b) => new Date(b) - new Date(a))
            .forEach((date) => {
              transactionMessage += `------------------------------ ${date} ------------------------------\n`;
              grouped[date].forEach((tr) => {
                const amountFormatted = new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                }).format(tr.amount);

                transactionMessage += `${tr.description} ${amountFormatted} ${t(
                  "currency.SAR"
                )}\n`;
              });
              transactionMessage += "\n";
            });

          setMessages((messages) => [
            ...messages,
            {
              text: transactionMessage,
              sender: "bot",
              time: new Date().toLocaleString([], {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        } else {
          setMessages((messages) => [
            ...messages,
            {
              text: "No recent transactions found.",
              sender: "bot",
              time: new Date().toLocaleString([], {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      } else {
        throw new Error(data.error || "Failed to fetch recent transactions");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((messages) => [
        ...messages,
        {
          text: error.message,
          sender: "bot",
          time: new Date().toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };
  const fetch_Spendings = async () => {
    try {
      const response = await http.get("/user_spendings");
      const data = await response.data;
      if (response.status === 200) {
        if (data.spendings && data.spendings.length > 0) {
          const amountsObj = data.spendings.reduce((acc, spending) => {
            const date = new Date(spending.date).toLocaleDateString("en-US", {
              month: "long",
            });
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += spending.amount;
            return acc;
          }, {});

          const amounts = Object.values(amountsObj);

          const categoriesSet = new Set(
            data.spendings.map((spending) =>
              new Date(spending.date).toLocaleDateString("en-US", {
                month: "long",
              })
            )
          );
          const categories = Array.from(categoriesSet);

          setAmounts(amounts);
          setCategories(categories.reverse());
          localStorage.setItem("amounts", JSON.stringify(amounts));
          localStorage.setItem("categories", JSON.stringify(categories));

          const totalSpent = Object.values(amountsObj).reduce(
            (acc, amount) => acc + amount,
            0
          );
          const totalSpentMessage = `${t("totalSpent")} ${new Intl.NumberFormat(
            "en-US",
            {
              minimumFractionDigits: 2,
            }
          ).format(totalSpent)} ${t("currency.SAR")}`;

          setMessages((messages) => [
            ...messages,
            {
              text: totalSpentMessage,
              sender: "bot",
            },
            {
              text: `${t("api-answers.chooseMonth")}`,
              sender: "bot",
              choices: categories.map((category) => ({
                text: category,
                value: category,
              })),
              time: new Date().toLocaleString([], {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        } else {
          setMessages((messages) => [
            ...messages,
            {
              text: "No spendings found.",
              sender: "bot",
              time: new Date().toLocaleString([], {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      } else {
        throw new Error(data.error || "Failed to fetch user spendings");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((messages) => [
        ...messages,
        {
          text: error.message,
          sender: "bot",
          time: new Date().toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };
  const callAiApi = async (prompt) => {
    try {
      const res = await http.post("/api/general_query", { prompt });

      const data = res.data.data.result;
      if (data.includes("Alternative questions:")) {
        const resultParts = data.split("\n");

        const alternativeQuestions = resultParts
          .filter((part) => /^\d+\./.test(part))
          .map((question) => question.split(".").slice(1).join(".").trim());
        const rest = data
          .split("\n")
          .filter((line) => !/^\d+\./.test(line.trim()))
          .join("\n");

        setMessages([
          ...messages,
          {
            sender: "user",
            text: prompt,
            time: new Date().toLocaleString([], {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          {
            sender: "bot",
            text: rest,
            choices: alternativeQuestions.map((question) => ({
              text: question,
              value: "api-question",
            })),
            aiApiCall: true,
            time: new Date().toLocaleString([], {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        setMessages((messages) => [
          ...messages,
          {
            text: data,
            sender: "bot",
            time: new Date().toLocaleString([], {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((messages) => [
        ...messages,
        {
          text: error.message,
          sender: "bot",
          time: new Date().toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };
  const callCustomerService = (text) => {
    setMessages([
      ...messages,
      {
        text,
        sender: "user",
        time: new Date().toLocaleString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      {
        text: t("customerService.title"),
        aiApiCall: true,
        sender: "bot",
        time: new Date().toLocaleString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    console.log(inputValue);
    setMessages([
      ...messages,
      {
        text: inputValue,
        sender: "user",
        time: new Date().toLocaleString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    if (inputValue === t("basicQuestions.q1")) {
      fetchUserBalance();
    } else if (inputValue === t("basicQuestions.q2")) {
      fetch_Spendings();
    } else if (inputValue === t("basicQuestions.q4")) {
      fetch_recent_transactions();
    } else if (inputValue === t("basicQuestions.q3")) {
      setMessages((messages) => [
        ...messages,
        {
          text: `${t("api-answers.appointment")}`,
          sender: "bot",
          time: new Date().toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } else if (inputValue === "account balance") {
      fetchUserBalance();
    } else if (inputValue === "spend") {
      fetch_Spendings();
    } else if (inputValue === "recent transactions") {
      fetch_recent_transactions();
    } else if (inputValue === "appointment") {
      setMessages((messages) => [
        ...messages,
        {
          text: `${t("api-answers.appointment")}`,
          sender: "bot",
          time: new Date().toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } else if (inputValue === "customer service") {
      callCustomerService(inputValue);
    } else {
      callAiApi(inputValue);
    }

    setInputValue("");
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed flex items-center justify-center gap-2 bottom-0 right-40 w-[75%] bg-white p-4 ${
        isRTL ? "flex-row-reverse" : ""
      }`}
    >
      <div>
        <img src={botImg} alt="bot" className="max-w-14" />
      </div>
      <div className="relative w-full ">
        <input
          dir={isRTL ? "rtl" : "ltr"}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t("chatbot.placeholder")}
          className="w-full bg-[#F2F2F3] focus:border-[#505eff] focus:outline-none rounded-md px-3 py-4 "
        />
        <button
          type="submit"
          className={`absolute bg-[#024A52] hover:bg-[#32686e] ${
            isRTL ? "left-0" : "right-0"
          } top-[0] h-full rounded-md`}
        >
          <SendHorizontal
            size={20}
            fill="#fff"
            color="#fff"
            className={` ${isRTL ? "rotate-180" : ""} w-24`}
          />
        </button>
      </div>
    </form>
  );
};

export default SubmitForm;
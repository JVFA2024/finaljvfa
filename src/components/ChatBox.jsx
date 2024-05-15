import { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { http } from "../http";

import { BotMessages } from "./BotMessages";
import SubmitForm from "./SubmitForm";
import { UserMessages } from "./UserMessages";
const ChatBox = ({ messages, setMessages }) => {
  const { t, i18n } = useTranslation();
  const [amounts, setAmounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const messagesEndRef = useRef(null);

  const isRTL = i18n.dir() === "rtl";

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
            { minimumFractionDigits: 2 }
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

  const fetch_Month_Spendings = async (selectedMonth) => {
    try {
      const response = await http.get("/user_spendings");
      const data = await response.data;
      if (response.status === 200) {
        if (data.spendings && data.spendings.length > 0) {
          const filteredSpendings = data.spendings.filter((spending) => {
            const date = new Date(spending.date);
            const monthString = date.toLocaleString("default", {
              month: "long",
            });
            return monthString === selectedMonth;
          });

          if (filteredSpendings.length > 0) {
            const amountsObj = filteredSpendings.reduce((acc, spending) => {
              const category = spending.category;
              const date = new Date(spending.date).toLocaleDateString("en-US");
              if (!acc[category]) {
                acc[category] = {
                  amount: 0,
                  dates: [],
                };
              }
              acc[category].amount += spending.amount;
              acc[category].dates.push(date);
              return acc;
            }, {});

            const amounts = Object.values(amountsObj).map(
              (item) => item.amount
            );
            const categories = Object.keys(amountsObj);

            const datesObj = Object.fromEntries(
              Object.entries(amountsObj).map(([key, value]) => [
                key,
                value.dates,
              ])
            );

            const dates = Object.values(datesObj).flat();

            const totalSpent = Object.values(amountsObj).reduce(
              (acc, item) => acc + item.amount,
              0
            );
            const dateObjects = dates.map((dateString) => new Date(dateString));

            dateObjects.sort((a, b) => a - b);

            const sortedDates = dateObjects.map((date) => {
              const month = date.toLocaleString("default", {
                month: "2-digit",
              });
              const day = date.getDate();
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            });
            const totalSpentMessage = `${t(
              "totalSpentInMonth"
            )} ${new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
            }).format(totalSpent)} ${t("currency.SAR")}`;
            setMessages((messages) => [
              ...messages,
              {
                text: totalSpentMessage,
                sender: "bot",
                monthAmounts: amounts,
                monthDates: sortedDates,
              },
              {
                text: `${t("api-answers.categoriesSummary")}`,
                sender: "bot",
                monthCategories: categories,
                monthAmounts: amounts,
                time: new Date().toLocaleString([], {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
          } else {
            console.log("No spendings found for selected month.");
          }
        } else {
          console.log("No spendings found.");
        }
      } else {
        throw new Error(data.error || "Failed to fetch user spendings");
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
            text: data,
            choices: alternativeQuestions.map((question) => ({
              text: question,
              value: "api-question",
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

  const handleChoiceClick = (choice) => {
    setMessages([
      ...messages,
      {
        text: choice.text,
        sender: "user",
        time: new Date().toLocaleString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    switch (choice.value) {
      case "current_balance":
        fetchUserBalance();
        break;

      case "recent_transactions":
        fetch_recent_transactions();
        break;
      case "book_appointment":
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

        break;
      case "spent_with_account":
        fetch_Spendings();
        break;
      case "January":
        fetch_Month_Spendings(choice.value);
        break;
      case "February":
        fetch_Month_Spendings(choice.value);
        break;
      case "March":
        fetch_Month_Spendings(choice.value);
        break;
      case "April":
        fetch_Month_Spendings(choice.value);
        break;
      case "May":
        fetch_Month_Spendings(choice.value);
        break;
      case "June":
        fetch_Month_Spendings(choice.value);
        break;
      case "July":
        fetch_Month_Spendings(choice.value);
        break;
      case "August":
        fetch_Month_Spendings(choice.value);
        break;
      case "September":
        fetch_Month_Spendings(choice.value);
        break;
      case "October":
        fetch_Month_Spendings(choice.value);
        break;
      case "November":
        fetch_Month_Spendings(choice.value);
        break;
      case "December":
        fetch_Month_Spendings(choice.value);
        break;
      case "api-question":
        callAiApi(choice.text);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          choices: [
            {
              text: t("basicQuestions.q1"),
              value: "current_balance",
            },
            {
              text: t("basicQuestions.q2"),
              value: "spent_with_account",
            },
            {
              text: t("basicQuestions.q3"),
              value: "book_appointment",
            },
            {
              text: t("basicQuestions.q4"),
              value: "recent_transactions",
            },
            {
              text: t("basicQuestions.q5"),
              value: "fraudulent_activity",
            },
          ],
          time: new Date().toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [t, messages.length]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);
  // log last message

  return (
    <div className="w-[75%] p-4 m-auto h-[90%]">
      <div className="h-[90%] overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="mb-6 mr-4">
            <div
              className={`flex gap-4 ${
                message.sender === "user" && isRTL
                  ? "justify-start"
                  : message.sender === "user" && !isRTL
                  ? "justify-end"
                  : message.sender === "bot" && isRTL
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.sender === "user" ? (
                <UserMessages isRTL={isRTL} message={message} />
              ) : (
                <BotMessages
                  isRTL={isRTL}
                  message={message}
                  handleChoiceClick={handleChoiceClick}
                  amounts={amounts}
                  categories={categories}
                />
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>
      <SubmitForm
        setMessages={setMessages}
        messages={messages}
        setAmounts={setAmounts}
        setCategories={setCategories}
      />
    </div>
  );
};

export default ChatBox;
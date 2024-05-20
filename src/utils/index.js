import { http } from "../http";

export const fetch_recent_transactions = async (setMessages, setIsLoading) => {
  setIsLoading(true);
  try {
    const res = await http.get("/recent_transactions");
    const data = res.data;

    if (res.status === 200) {
      if (data.transactions && data.transactions.length > 0) {
        const grouped = data.transactions.reduce((acc, transaction) => {
          const date = new Date(transaction.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(transaction);
          return acc;
        }, {});
        const transactionArray = Object.entries(grouped)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .flatMap(([date, transactions]) =>
            transactions.map((tr) => ({
              tr,
              amountFormatted: new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
              }).format(tr.amount),
              date,
            }))
          );

        setMessages((messages) => [
          ...messages,
          {
            transactions: transactionArray,
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
  setIsLoading(false);
};

export const fetchUserBalance = async (t, setMessages, setIsLoading) => {
  setIsLoading(true);
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
  setIsLoading(false);
};

export const fetch_Spendings = async (
  t,
  setMessages,
  setAmounts,
  setCategories,
  setIsLoading
) => {
  setIsLoading(true);
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
  setIsLoading(false);
};

export const callAiApi = async (
  prompt,
  messages,
  setMessages,
  setIsLoading
) => {
  setIsLoading(true);
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
  setIsLoading(false);
};

export const callCustomerService = (text, messages, setMessages, t) => {
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
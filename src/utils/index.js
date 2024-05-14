// const fetch_Spendings = async () => {
//   try {
//     const response = await http.get("/user_spendings");
//     const data = await response.data;
//     if (response.status === 200) {
//       if (data.spendings && data.spendings.length > 0) {
//         const grouped = data.spendings.reduce((acc, spending) => {
//           const date = new Date(spending.date).toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           });
//           if (!acc[date]) {
//             acc[date] = [];
//           }
//           acc[date].push(spending);
//           return acc;
//         }, {});

//         let spendingMessage = "";
//         Object.keys(grouped)
//           .sort((a, b) => new Date(b) - new Date(a))
//           .forEach((date) => {
//             spendingMessage += `------------------------------ ${date} ------------------------------\n`;
//             grouped[date].forEach((spending) => {
//               spendingMessage += `${
//                 spending.description
//               }          ${new Intl.NumberFormat("en-US", {
//                 style: "currency",
//                 currency: "SAR",
//                 minimumFractionDigits: 2,
//               }).format(spending.amount)} SAR \n${spending.category}\n`;
//             });
//           });

//         setMessages((messages) => [
//           ...messages,
//           {
//             text: spendingMessage,
//             sender: "bot",
//             time: new Date().toLocaleString([], {
//               weekday: "short",
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//           },
//         ]);
//       } else {
//         setMessages((messages) => [
//           ...messages,
//           {
//             text: "No spendings found.",
//             sender: "bot",
//             time: new Date().toLocaleString([], {
//               weekday: "short",
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//           },
//         ]);
//       }
//     } else {
//       throw new Error(data.error || "Failed to fetch user spendings");
//     }
//   } catch (error) {
//     console.error("Fetch error:", error);
//     setMessages((messages) => [
//       ...messages,
//       {
//         text: error.message,
//         sender: "bot",
//         time: new Date().toLocaleString([], {
//           weekday: "short",
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       },
//     ]);
//   }
// };

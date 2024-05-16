import { useTranslation } from "react-i18next";
import botImg from "../assets/rounded-bot.png";
import { AppointmentModel } from "./AppointmentModel";
import { useState } from "react";
import LineChart from "./LineChart";
import DonutChart from "./DonutChart";
import { Link } from "react-router-dom";

export const BotMessages = ({
  isRTL,
  message,
  handleChoiceClick,
  amounts,
  categories,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const hasMonths =
    message.choices &&
    message.choices.some((choice) =>
      months.includes(choice.text.toLowerCase())
    );

  const hasAiApiCall = message.choices && message.aiApiCall;
  const hasCategories = message.monthDates && message.monthDates.length > 0;
  const hasCategoriesSummery =
    message.monthCategories && message.monthCategories.length > 0;

  let messgaesCategories = [];
  let messagesAmounts = [];

  let monthDates = [];
  if (hasCategories) {
    messagesAmounts = message.monthAmounts;
    monthDates = message.monthDates;
  }
  if (hasCategoriesSummery) {
    messgaesCategories = message.monthCategories;
    messagesAmounts = message.monthAmounts;
  }
  const handleAppointmentRedirect = () => {
    setOpen(true);
  };

  return (
    <div
      className={`flex flex-col ${
        message.choices ? "w-[100%]" : hasCategories ? "w-[70%]" : "w-[50%]"
      }`}
    >
      <AppointmentModel open={open} setOpen={setOpen} />
      {message.choices && !hasMonths && !hasAiApiCall && (
        <div className="flex flex-col mb-8" data-aos="zoom-in-down">
          <h1
            className={`text-2xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {isRTL
              ? JSON.parse(localStorage.getItem("user")).username +
                " " +
                t("chatbot.title")
              : t("chatbot.title") +
                JSON.parse(localStorage.getItem("user")).username}
          </h1>
          <h2
            className={`text-[#485677] text-2xl ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("chatbot.subtitle")}
          </h2>
        </div>
      )}

      <div
        className={`flex gap-2 ${
          hasCategories || hasCategoriesSummery
            ? "flex-col-reverse"
            : "flex-col"
        } ${hasMonths ? "flex-col" : ""} ${isRTL ? "items-end" : ""}`}
      >
        {message.choices && hasMonths ? (
          <div className="w-[70%]">
            <LineChart amounts={amounts} categories={categories} />
          </div>
        ) : null}
        {hasCategories ? (
          <div className="w-full">
            <LineChart amounts={messagesAmounts} categories={monthDates} />
          </div>
        ) : null}
        {hasCategoriesSummery ? (
          <>
            <DonutChart
              amounts={messagesAmounts}
              categories={messgaesCategories}
            />
          </>
        ) : null}
        {isRTL ? (
          <div className={`flex gap-2 ${hasAiApiCall ? "w-[60%]" : ""}`}>
            <div>
              {message.text && (
                <p
                  className="bg-[#F2F2F3] p-2 rounded text-center"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {message.text}
                </p>
              )}

              {message.choices && message.choices ? (
                <>
                  <div className={`p-4`}>
                    <div className="flex flex-wrap gap-4 mt-2 justify-center">
                      {message.choices.map((choice, idx) => (
                        <button
                          key={idx}
                          className={`border text-black py-4 px-8 rounded-lg text-center`}
                          onClick={() => handleChoiceClick(choice)}
                          // style={{ flexBasis: idx < 3 ? "30%" : "40%" }}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm mt-2 ml-3">
                  <div className="flex flex-col items-start gap-3">
                    {message.time}

                    {message.text === t("api-answers.appointment") && (
                      <>
                        <button
                          onClick={handleAppointmentRedirect}
                          className="bg-[#024A52] hover:bg-[#32686e] text-white capitalize border px-5 py-2.5  font-bold rounded-full"
                        >
                          {t("letsGo.title")}
                        </button>
                      </>
                    )}
                    {(message.text === t("customerService.title"))(
                      <div className="flex gap-4">
                        <Link
                          to={"https://wa.link/mu3jv1"}
                          target="_blank"
                          className="bg-[#024A52] hover:no-underline hover:text-white visited:text-white visited:no-underline hover:bg-[#32686e] text-white capitalize border px-5 py-2.5  font-bold rounded-full"
                        >
                          {t("customerService.whatsapp")}
                        </Link>
                        <Link
                          to={"https://twitter.com/BSF_help"}
                          target="_blank"
                          className="bg-[#024A52] hover:no-underline hover:text-white visited:text-white visited:no-underline hover:bg-[#32686e] text-white capitalize border px-5 py-2.5  font-bold rounded-full"
                        >
                          {t("customerService.x")}
                        </Link>
                      </div>
                    )}
                  </div>
                </p>
              )}
            </div>
            {message.choices ? null : (
              <img src={botImg} alt="bot" className="max-h-9" />
            )}
          </div>
        ) : (
          <div className={`flex gap-2 ${hasAiApiCall ? "w-[60%]" : ""}`}>
            {message.choices && !hasAiApiCall ? null : (
              <img src={botImg} alt="bot" className="max-h-9" />
            )}
            <div>
              {message.text && (
                <p
                  className="bg-[#F2F2F3] p-2 rounded text-center"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {message.text}
                </p>
              )}
              {message.choices && message.choices ? (
                <>
                  <div className={`p-4`}>
                    <div className="flex flex-wrap gap-4 mt-2 justify-center">
                      {message.choices.map((choice, idx) => (
                        <button
                          key={idx}
                          className="border text-center text-black py-4 px-8 rounded-lg "
                          onClick={() => handleChoiceClick(choice)}
                          // style={{ flexBasis: idx < 3 ? "30%" : "40%" }}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm mt-2 ml-3">
                  <div className="flex flex-col items-start gap-3">
                    {message.time}

                    {message.text === t("api-answers.appointment") && (
                      <>
                        <button
                          onClick={handleAppointmentRedirect}
                          className="bg-[#024A52] hover:bg-[#32686e] text-white capitalize border px-5 py-2.5  font-bold rounded-full"
                        >
                          {t("letsGo.title")}
                        </button>
                      </>
                    )}
                    {message.text === t("customerService.title") && (
                      <div className="flex gap-4">
                        <Link
                          to={"https://wa.link/mu3jv1"}
                          target="_blank"
                          className="bg-[#024A52] hover:no-underline hover:text-white visited:text-white visited:no-underline hover:bg-[#32686e] text-white capitalize border px-5 py-2.5  font-bold rounded-full"
                        >
                          {t("customerService.whatsapp")}
                        </Link>
                        <Link
                          to={"https://twitter.com/BSF_help"}
                          target="_blank"
                          className="bg-[#024A52] hover:no-underline hover:text-white visited:text-white visited:no-underline hover:bg-[#32686e] text-white capitalize border px-5 py-2.5  font-bold rounded-full"
                        >
                          {t("customerService.x")}
                        </Link>
                      </div>
                    )}
                  </div>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
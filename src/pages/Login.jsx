import LoginForm from "../components/LoginForm";
import logo from "../assets/logo.png";
import ChatBot from "react-chatbotify";
import roundedbot from "../assets/rounded-bot.png";
import bgImg from "../assets/bg.jpg";
import colLogo from "../assets/colLogo.png";
import { http } from "../http";
import { useTranslation } from "react-i18next";
import { useState } from "react";
const Login = () => {
  const { t } = useTranslation();
  const [choices, setChoices] = useState([]);
  const [userText, setUserText] = useState("");
  const options = {
    audio: false,
    footer: false,
    emoji: false,
    fileAttachment: false,
    notification: {
      disabled: true,
    },
    theme: {
      primaryColor: "#024A52",
      secondaryColor: "#024A52",
      fontFamily: "Cairo, sans-serif",
    },
    chatButton: {
      icon: roundedbot,
    },
    header: {
      title: (
        <>
          <h1 className="text-lg font-semibold ">JVFA</h1>
        </>
      ),
      avatar: roundedbot,
    },
    tooltip: {
      text: t("needHelp"),
    },
  };
  async function fetchData(prompt) {
    try {
      const res = await http.post("/api/general_query", { prompt });
      const data = res.data;
      return data.data.result;
    } catch (error) {
      return "Oh no I don't know what to say!";
    }
  }

  const flow = {
    start: {
      message: t("chatbot.subtitle"),
      path: "loop",
    },
    loop: {
      message: async (params) => {
        setUserText(params.userInput);
        const result = await fetchData(params.userInput);
        return result;
      },
      path: "loop",
    },
  };
  console.log(userText);
  return (
    <div
      className={` min-h-screen relative `}
      style={{ backgroundImage: `url(${bgImg})`, backgroundSize: "cover" }}
    >
      <img src={colLogo} alt="col logo" className="p-4" />
      <div className="w-[80%] pt-24 md:w-[70%] lg:w-[50%] mx-auto lg:mr-auto lg:mx-0 flex flex-col items-center justify-center gap-7 ">
        <img className="max-w-60" src={logo} alt="JVFA" />
        <LoginForm />
        <ChatBot options={options} flow={flow} />
      </div>
    </div>
  );
};

export default Login;
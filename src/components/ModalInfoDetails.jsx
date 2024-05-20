import { useTranslation } from "react-i18next";
import { Modal, Button, Divider } from "rsuite";
// Hi I’m JANA, your virtual financial assistant.
// Here are some things I can help you with.

const ModalInfoDetails = ({ open, handleClose }) => {
  const { t, i18n } = useTranslation();
  const data = [
    {
      q: "Finding Answers to Banking-Related Questions",
      a: "How can I register in JANA rewards program?",
    },
    {
      q: "Checking Balance Information",
      a: "What is my current account balance?",
    },
    {
      q: "Viewing Dashboard Summary Statistics",
      a: "How much did I spend with my account?",
    },
    {
      q: "Booking an Appointment",
      a: "I want to book an appointment.",
    },
    {
      q: "Viewing Recent Transactions",
      a: "Can you provide details of my recent transactions?",
    },
    {
      q: "Contact Customer Service Agent",
      a: "I want to contact customer service agent.",
    },
  ];
  return (
    <Modal open={open} onClose={handleClose} dir={i18n.dir()}>
      <Modal.Body className="text-center text-xl flex justify-around">
        <div className="text-[#649da3]">
          <p>Hi I’m JANA, your virtual financial assistant.</p>
          <p>Here are some things I can help you with.</p>
        </div>
      </Modal.Body>

      <Modal.Body>
        {data.map((item, index) => (
          <div key={index} className="flex flex-col mb-4">
            <p className="m-0 font-bold mb-2 text-[#649da3]">{item.q}</p>
            <p className="m-0 text-[#485677]">{item.a}</p>
            <Divider style={{ height: "3px" }} />
          </div>
        ))}
      </Modal.Body>

      <Modal.Footer className="flex items-center justify-center gap-4">
        <Button
          onClick={handleClose}
          className="hover:bg-[#32686e] hover:text-white"
          style={{ backgroundColor: "#024A52", color: "#fff" }}
        >
          {t("modal.ok")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalInfoDetails;
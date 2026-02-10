import { useParams } from "react-router-dom";

const pageContent: Record<string, { title: string; text: string }> = {
  card: { title: "We Accept Card", text: "Hello! Card payments are supported." },
  bank: { title: "We Accept Bank Transfer", text: "Hello! Bank transfer payments are supported." },
  cash: { title: "We Accept Cash", text: "Hello! Cash payments are supported." },
};

const PaymentInfoPage = () => {
  const { type = "card" } = useParams();
  const content = pageContent[type] ?? { title: "Payment", text: "Hello!" };

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
      <p className="text-muted-foreground">{content.text}</p>
    </main>
  );
};

export default PaymentInfoPage;

export const scrollToId = (id: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

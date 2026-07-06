export const toDateTimeLocalValue = (value?: string | null): string => {
  if (!value) return "";

  // Backend trả UTC (có Z)
  if (value.endsWith("Z")) {
    const date = new Date(value);

    const vnDate = new Date(
      date.toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
    );

    const year = vnDate.getFullYear();
    const month = String(vnDate.getMonth() + 1).padStart(2, "0");
    const day = String(vnDate.getDate()).padStart(2, "0");
    const hour = String(vnDate.getHours()).padStart(2, "0");
    const minute = String(vnDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  // Backend trả local time
  return value.substring(0, 16);
};

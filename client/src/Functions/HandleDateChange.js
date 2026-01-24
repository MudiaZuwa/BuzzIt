const getDayWithSuffix = (day) => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

const handleDateChange = (selectedDate) => {
  if (selectedDate) {
    const date = new Date(selectedDate);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    const dayWithSuffix = getDayWithSuffix(day);

    const formattedDate = `${dayWithSuffix} ${month} ${year}`;

    return formattedDate;
  }
};

export default handleDateChange;

const MONTHS = [
  "01 Jan",
  "02 Feb",
  "03 Mar",
  "04 Apr",
  "05 May",
  "06 Jun",
  "07 Jul",
  "08 Aug",
  "09 Sep",
  "10 Oct",
  "11 Nov",
  "12 Dec",
];

interface DateInputProps {
  onInputChange: (e: any) => void;
}

const DateInput: React.FC<DateInputProps> = ({ onInputChange }) => {
  return (
    <>
      <select name="month" onChange={onInputChange}>
        {MONTHS.map((month, index) => {
          return (
            <option
              selected={index === new Date().getMonth()}
              key={month}
              value={index}
            >
              {month}
            </option>
          );
        })}
      </select>
      <select name="day" onChange={onInputChange}>
        {new Array(31).fill(0).map((el, index) => {
          return (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          );
        })}
      </select>
      <select name="year" onChange={onInputChange}>
        {new Array(10).fill(0).map((el, index) => {
          const year = new Date().getFullYear() + index;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
      <input
        onChange={onInputChange}
        name="time"
        type="time"
        defaultValue={"08:00"}
      ></input>
    </>
  );
};
export default DateInput;

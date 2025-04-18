import'./Calendar.css';

interface CalendarHeaderProps {
  currentDate: Date;
  onChangeMonth: (delta: number) => void;
}

function CalendarHeader({ currentDate, onChangeMonth }: CalendarHeaderProps) {
  return (
    <div className="calendar-header">
      <button 
        className="nav-button"
        onClick={() => onChangeMonth(-1)}>
        Previous Month
      </button>

      <h2 className="month-title">
        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h2>

      <button 
        className="nav-button"
        onClick={() => onChangeMonth(1)}>
        Next Month
      </button>
    </div>
  );
}

export default CalendarHeader;
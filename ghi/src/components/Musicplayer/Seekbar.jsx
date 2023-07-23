import React from "react";

const Seekbar = ({ value, onInput, setSeekTime, maxDuration }) => {
  const getTime = (time) =>
    `${Math.floor(time / 60)}:${`0${Math.floor(time % 60)}`.slice(-2)}`;

  const handleChange = (event) => {
    onInput(parseFloat(event.target.value));
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setSeekTime(value - 5)}
        className="hidden lg:mr-4 lg:block text-white"
      >
        -
      </button>
      <p className="text-white">{value === 0 ? "0:00" : getTime(value)}</p>
      <input
        type="range"
        step="any"
        value={value}
        min={0}
        max={maxDuration}
        onInput={handleChange}
        className="md:block w-24 md:w-56 2xl:w-96 h-1 mx-4 2xl:mx-6 rounded-lg"
      />
      <p className="text-white">
        {maxDuration === 0 ? "0:00" : getTime(maxDuration)}
      </p>
      <button
        type="button"
        onClick={() => setSeekTime(value + 5)}
        className="hidden lg:ml-4 lg:block text-white"
      >
        +
      </button>
    </div>
  );
};

export default Seekbar;

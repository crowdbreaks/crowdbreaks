import React from 'react'

export const TimeOptions = (props) => {
  const defaultClass = 'btn stream-graph-time-option-btn'
  let buttonOptions = {
    1: {
      alt: 'year',
      className: defaultClass,
      text: '1y'
    },
    2: {
      alt: 'month',
      className: defaultClass,
      text: '3m'
    },
    3: {
      alt: 'day',
      className: defaultClass,
      text: '1d'
    },
  };

  // active state
  buttonOptions[props.timeOption]['className'] += ' stream-graph-time-option-btn-active';

  // generate buttons
  let buttons = Object.keys(buttonOptions).map((k, idx) => {
    return <button className={buttonOptions[k].className}
      onClick={() => props.onChangeOption(k)}
      alt={buttonOptions[k].alt}
      key={k}>
        {buttonOptions[k].text}
    </button>
  })

  return (
    <div className="btn-group stream-graph-time-options-container">
      {buttons}
    </div>
  );
};

const randomInt = () => {
  return Math.floor(Math.random() * 255);
};

export const RADOM_COLORS = [
  '#44617b',
  '#f8c972',
  '#8e9975',
  '#f98087',
  '#a9e3ff',
  '#a97baa',
  '#83a7ab',
  '#b3ada0',
  '#2792c3',
  '#8f2e14',
  '#634950',
].concat(Array.from({ length: 100 }, () => {
  return `rgb(${randomInt()}, ${randomInt()}, ${randomInt()})`;
}));


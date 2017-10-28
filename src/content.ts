import { onMessage$, onConnect$, onDisconnect } from "./utils/chrome";
import { iterate, empty } from "most";

const getLike = () =>
  document.querySelector('button[aria-label="Like"]') as HTMLElement;

const getFrequeny = (max: number) => (min: number) => (ratio: number) =>
  Math.floor(min * (1 - ratio) + max * ratio);

const defaultFreq = getFrequeny(100)(2000);

const frequency$ = onMessage$.map(x => defaultFreq(x.payload.value));
const onDisconnect$ = onDisconnect(onConnect$);
const playing$ = onMessage$
  .map(x => x.payload.play)
  .merge(onDisconnect$.constant(false));

const delay = (y: number) => new Promise(resolve => setTimeout(resolve, y));

const click$ = frequency$
  .combine(
    (freq, playing) =>
      playing ? iterate(() => delay(freq), freq).skip(1) : empty(),
    playing$
  )
  .switch()
  .merge(playing$.skipRepeats().filter(x => x));

const clickIO$ = click$.constant(() => getLike().click());

clickIO$.observe(x => x());

/*** EXIT LOGIC ***/
//onConnect$.observe(() => console.log("connected"))
//onDisconnect(onConnect$).observe(() => console.log("disconnect"))

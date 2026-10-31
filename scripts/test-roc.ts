import { calculateRocWeights } from '../src/lib/roc';

const criteria = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
const res = calculateRocWeights(criteria);
console.log('ROC Results:', res);

const expected = [0.4083, 0.2417, 0.1583, 0.1028, 0.0611, 0.0278];
criteria.forEach((c, i) => {
  console.log(`${c}: actual = ${res[c].bobot}, expected = ${expected[i]}, diff = ${Math.abs(res[c].bobot - expected[i])}`);
});
process.exit(0);

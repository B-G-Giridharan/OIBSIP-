const crypto = require("crypto");

async function generatePnr(existsFn) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const numeric = crypto.randomInt(10_000_000, 100_000_000);
    const pnr = `RR${numeric}`;
    if (!(await existsFn(pnr))) {
      return pnr;
    }
  }
  throw new Error("Unable to generate a unique PNR. Please try again.");
}

module.exports = { generatePnr };

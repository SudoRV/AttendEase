import AsyncStorage from "@react-native-async-storage/async-storage";

let isScopeUpdated = false;
let loadPromise = null;

const scope = {
  "notification_type": {
    "class_cancelled": 0,
    "class_substitution": 1,
    "announcement": 2
  },
  "scope": { "students": 0, "teachers": 1 },
  "branch": {
    "all": 0, "CSE": 1, "AI": 2, "RA": 3, "ME": 4, "CE": 5, "BCA": 6,
  },
  "year": {
    "all": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
  },
  "section": {
    "all": 0, "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8, "I": 9, "J": 10, "K": 11, "L": 12, "M": 13, "N": 14,
  },
  "day": {
    "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6
  }
};

async function isLoadingMetadata() {
  if(isScopeUpdated) return Promise.resolve(true);
  
  if(!loadPromise) {
    loadPromise = loadMetadata()
    .then(() => {
      isScopeUpdated = true;
    })
    .catch((err) => {
      loadPromise = null;
      throw err;
    })
  }

  return loadPromise;
}

// download college metadata
async function loadMetadata() {
  // load saved metadata
  const savedMetadata = await AsyncStorage.getItem("college_metadata");
  let metadata = JSON.parse(savedMetadata || "{}");

  if (metadata?.branch) scope.branch = {
    "all": 0,
    ...Object.fromEntries(metadata.branch.split(",").map((b, index) => [b.trim(), index + 1]))
  };
  if (metadata?.year) scope.year = {
    "all": 0,
    ...Object.fromEntries(metadata.year.split(",").map((y, index) => [y.trim(), Number(y)]))
  };
  if (metadata?.section) scope.section = {
    "all": 0,
    ...Object.fromEntries(metadata.section.split(",").map((s, index) => [s.trim(), index + 1]))
  };
  if (metadata?.day) scope.day = {
    ...Object.fromEntries(metadata.day.split(",").map((d, index) => [d.trim(), index]))
  };

  console.log(scope)
  return true;
}

export async function scopeAll(key) {
  await isLoadingMetadata();
  return scope[key];
}

export async function scopes(attr, val) {
  await isLoadingMetadata();
  return scope[attr]?.[val];
}

export async function reverseScopes(attr, val) {
  await isLoadingMetadata();
  if (!scope[attr]) return undefined;
  return Object.keys(scope[attr]).find(key => scope[attr][key] === val);
}

export function decToHex(decimal) {
  // 1. Convert number to hex string base 16
  return decimal.toString(16);
}

export function hexToDec(hex) {
  return parseInt(hex, 16);
}
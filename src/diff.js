function isObject(o) {
  return o instanceof Object && o.constructor.name == "Object";
}

const NO_DIFF = "&nodiff;";

function _diff(scope, original, changed) {
  //
  scope.i++;

  if (!isObject(original) || !isObject(changed)) {
    return changed;
  }

  const diff = {};

  for (const key in changed) {
    //
    if (!original.hasOwnProperty(key)) {
      diff[key] = changed[key];
      continue;
    }

    if (original[key] === changed[key]) {
      continue;
    }

    if (isObject(original[key]) && isObject(changed[key])) {
      const c = _diff(scope, original[key], changed[key]);

      if (c !== NO_DIFF) {
        diff[key] = c;
      }

      continue;
    }

    if (Array.isArray(original[key]) && Array.isArray(changed[key])) {
      if (JSON.stringify(original[key]) === JSON.stringify(changed[key])) {
        continue;
      }
    }

    diff[key] = changed[key];
  }

  for (const key in original) {
    if (!changed.hasOwnProperty(key)) {
      if (key.substr(0, 2) === "--") {
        continue;
      }

      if (!diff.hasOwnProperty("__rm")) {
        diff["__rm"] = [];
      }

      diff["__rm"].push(key);

      continue;
    }
  }

  for (const k in diff) {
    return diff;
  }

  return NO_DIFF;
}

export default function diff(a, b) {
  //
  const scope = { i: 0 };

  const diff = _diff(
    scope,
    JSON.parse(JSON.stringify(a)),
    JSON.parse(JSON.stringify(b))
  );

  if (diff === NO_DIFF) {
    return {};
  }

  return diff;
}

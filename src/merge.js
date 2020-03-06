function isObject(o) {
  return o instanceof Object && o.constructor.name == "Object";
}

function emptyObject(o) {
  for (let i in o) {
    return false;
  }
  return true;
}

function deepMerge(data, payload, scope) {
  //
  const scope_path = scope.path ? scope.path + "." : "";

  if (!isObject(data) || !isObject(payload)) {
    return false;
  }

  if (payload.hasOwnProperty("__rm")) {
    const rm = payload["__rm"];

    for (var i in rm) {
      const key = rm[i];

      if (data.hasOwnProperty(key)) {
        scope.data[key] = data[key];

        scope.env.deleted_keys.push(scope_path + key);

        delete data[key];
      }
    }

    delete payload["__rm"];
  }

  // -------------------------------------------------------------------------

  const remove = [];

  for (const key in payload) {
    //
    const row = payload[key];
    
    let _new = false;

    if (!data.hasOwnProperty(key)) {
      remove.push(key);

      scope.env.created_keys.push(scope_path + key);

      data[key] = row;

      continue;
    }

    // -----------------------------------------------------------------------

    if (isObject(row)) {
      if (row.hasOwnProperty("<:new:>")) {
        _new = true;
        delete row["<:new:>"];

        if (row.hasOwnProperty("__rm")) {
          delete row["__rm"];
        }
      }

      if (!_new && isObject(data[key])) {
        scope.data[key] = {};

        deepMerge(data[key], row, {
          env: scope.env,
          path: scope_path + key,
          data: scope.data[key]
        });

        continue;
      }
    }

    // -----------------------------------------------------------------------

    if (data[key] === row) {
      continue;
    }

    scope.data[key] = data[key];

    if (_new) {
      scope.data[key]["<:new:>"] = true;
    }

    scope.env.changed_keys.push(scope_path + key);

    data[key] = row;
  }

  if (remove.length) {
    scope.data["__rm"] = remove;
  }

  return true;
}

export default function merge(data, payload) {
  //
  const timestamp = new Date().getTime();

  // Cópia de Payload
  payload = JSON.parse(JSON.stringify(payload));

  const env = {
    created_keys: [],
    changed_keys: [],
    deleted_keys: []
  };

  if (emptyObject(payload)) {
    return env;
  }

  const scope = {
    env,
    path: "",
    data: {}
  };

  deepMerge(data, payload, scope);

  const response = {
    rollback: scope.data,
    timestamp
  };

  let changes;

  if (env.created_keys.length) {
    changes = true;
    response["created_keys"] = env.created_keys;
  }

  if (env.changed_keys.length) {
    changes = true;
    response["changed_keys"] = env.changed_keys;
  }

  if (env.deleted_keys.length) {
    changes = true;
    response["deleted_keys"] = env.deleted_keys;
  }

  if (!changes) {
    response["unchanged"] = true;
  }

  return response;
}

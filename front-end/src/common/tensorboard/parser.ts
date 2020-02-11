const GRAPH_REPEATED_FIELDS: { [attrPath: string]: boolean } = {
  'library.function': true,
  'library.function.node_def': true,
  'library.function.signature.input_arg': true,
  'library.function.signature.output_arg': true,
  'library.versions': true,
  'node': true,
  'node.input': true,
  'node.attr': true,
  'node.attr.value.list.type': true,
  'node.attr.value.shape.dim': true,
  'node.attr.value.tensor.string_val': true,
  'node.attr.value.tensor.tensor_shape.dim': true,
  'node.attr.value.list.shape': true,
  'node.attr.value.list.shape.dim': true,
  'node.attr.value.list.s': true
};

export function fetchPbTxt(filepath: string): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>(function (resolve, reject) {
    const request = new XMLHttpRequest();
    request.open('GET', filepath);
    request.responseType = 'arraybuffer';

    request.onerror = () => reject(request.status);
    request.onload = () => resolve(request.response);

    request.send(null);
  });
}

function parseValue(value: string): string | number | boolean {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  let firstChar = value[0];
  if (firstChar === '"') {
    return value.substring(1, value.length - 1);
  }
  let num = parseFloat(value);
  return isNaN(num) ? value : num;
}

export function streamParse(
  arrayBuffer: ArrayBuffer, callback: (string: string) => void,
  chunkSize: number = 1000000, delim: string = '\n'): Promise<boolean> {
  return new Promise<boolean>(function (resolve, reject) {
    let offset = 0;
    let bufferSize = arrayBuffer.byteLength - 1;
    let data = '';

    function readChunk(offset: number, size: number) {
      const arrayBufferChunk = arrayBuffer.slice(offset, offset + size);

      const blob = new Blob([arrayBufferChunk]);
      const file = new FileReader();
      file.onload = (e: any) => readHandler(e.target.result);
      file.readAsText(blob);
    }

    function readHandler(str: any) {
      offset += chunkSize;
      let parts = str.split(delim);
      let first = data + parts[0];
      if (parts.length === 1) {
        data = first;
        readChunk(offset, chunkSize);
        return;
      }
      data = parts[parts.length - 1];
      callback(first);
      for (let i = 1; i < parts.length - 1; i++) {
        callback(parts[i]);
      }
      if (offset >= bufferSize) {
        if (data) {
          callback(data);
        }
        resolve(true);
        return;
      }
      readChunk(offset, chunkSize);
    }

    

    readChunk(offset, chunkSize);
  });
}

function parsePbtxtFile(
  input: ArrayBuffer,
  repeatedFields: { [attrPath: string]: boolean }): Promise<Record<string, any>> {
  let output: any = {};
  let stack: any[] = [];
  let path: string[] = [];
  let current: any = output;

  function splitNameAndValueInAttribute(line: string) {
    let colonIndex = line.indexOf(':');
    let name = line.substring(0, colonIndex).trim();
    let value = parseValue(line.substring(colonIndex + 2).trim());
    return {
      name: name,
      value: value
    };
  }

  /**
   * Adds a value, given the attribute name and the host object. If the
   * attribute already exists, but is not an array, it will convert it to an
   * array of values.
   *
   * @param obj The host object that holds the attribute.
   * @param name The attribute name (key).
   * @param value The attribute value.
   * @param path A path that identifies the attribute. Used to check if
   *     an attribute is an array or not.
   */
  function addAttribute(obj: { [key: string]: any }, name: string,
    value: Record<string, any> | string | number | boolean, path: string[]): void {
    // We treat 'node' specially since it is done so often.
    let existingValue = obj[name];
    if (existingValue == null) {
      obj[name] = path.join('.') in repeatedFields ? [value] : value;
    } else if (Array.isArray(existingValue)) {
      existingValue.push(value);
    } else {
      obj[name] = [existingValue, value];
    }
  }

  return streamParse(input, function (line: string) {
    if (!line) {
      return;
    }
    line = line.trim();

    switch (line[line.length - 1]) {
      case '{':  // create new object
        let name = line.substring(0, line.length - 2).trim();
        let newValue: any = {};
        stack.push(current);
        path.push(name);
        addAttribute(current, name, newValue, path);
        current = newValue;
        break;
      case '}':
        current = stack.pop();
        path.pop();
        break;
      default:
        let x = splitNameAndValueInAttribute(line);
        addAttribute(current, x.name, x.value, path.concat(x.name));
        break;
    }
  }).then(function () {
    return output;
  });
}
export function parseGraphPbTxt(input: ArrayBuffer):
  Promise<any> {
  return parsePbtxtFile(input, GRAPH_REPEATED_FIELDS);
}





export function fetchAndParseGraphData(path: string, pbTxtFile: Blob | null) {
  let result
  if (pbTxtFile) {
    result = new Promise<any>(function (resolve, reject) {
      let fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsArrayBuffer(pbTxtFile);
    });
  } else {
    result = fetchPbTxt(path);
  }
  return result.then((arrayBuffer: any) => {
    return parseGraphPbTxt(arrayBuffer);
  })
}


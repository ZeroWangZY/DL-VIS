const GRAPH_REPEATED_FIELDS = {
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

function parseValue(value) {
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

function fetchPbTxt(filepath){
    return new Promise(function (resolve, reject) {
      const request = new XMLHttpRequest();
      request.open('GET', filepath);
      request.responseType = 'arraybuffer';
  
      request.onerror = () => reject(request.status);
      request.onload = () => resolve(request.response);
  
      request.send(null);
    });
}

function parsePbtxtFile(
    input,
    repeatedFields){
    let output = {};
    let stack = [];
    let path = [];
    let current = output;
  
    function splitNameAndValueInAttribute(line) {
      let colonIndex = line.indexOf(':');
      let name = line.substring(0, colonIndex).trim();
      let value = parseValue(line.substring(colonIndex + 2).trim());
      return {
        name: name,
        value: value
      };
    }
    function addAttribute(obj, name,
      value, path){
      let existingValue = obj[name];
      if (existingValue == null) {
        obj[name] = path.join('.') in repeatedFields ? [value] : value;
      } else if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else {
        obj[name] = [existingValue, value];
      }
    }
  
    return streamParse(input, function (line) {
      if (!line) {
        return;
      }
      line = line.trim();
  
      switch (line[line.length - 1]) {
        case '{': 
          let name = line.substring(0, line.length - 2).trim();
          let newValue = {};
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

function streamParse(
    arrayBuffer, callback,
    chunkSize = 1000000, delim = '\n') {
    return new Promise(function (resolve, reject) {
      let offset = 0;
      let bufferSize = arrayBuffer.byteLength - 1;
      let data = '';
  
      function readChunk(offset, size) {
        const arrayBufferChunk = arrayBuffer.slice(offset, offset + size);
  
        const blob = new Blob([arrayBufferChunk]);
        const file = new FileReader();
        file.onload = (e) => readHandler(e.target.result);
        file.readAsText(blob);
      }
  
      function readHandler(str) {
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

function parseGraphPbTxt(input){
  return parsePbtxtFile(input, GRAPH_REPEATED_FIELDS);
}

function buildGraph(input){
  let nodes = []
  let links = []
  let graph = {
    nodes: [],
    links: []
  }
  for(let node of input.node){
    nodes.push({
      "id": node.name,
      "group": node.op
    })
    if(node.hasOwnProperty('input')){
      for(let source of node.input){
        let isControlDependency = source[0] === '^';
        if (isControlDependency) {
          source = source.substring(1);
        }
        links.push({
          source: source, 
          target: node.name,
          isControlDependency
      //   "value": 10
        })
      }
    }
  }
  graph.links = links
  graph.nodes = nodes
  return graph
}

function fetchAndParseGraphData(path, pbTxtFile) {
    let result
    if (pbTxtFile) {
      result = new Promise(function (resolve, reject) {
        let fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = () => reject(fileReader.error);
        fileReader.readAsArrayBuffer(pbTxtFile);
      });
    } else {
      result = fetchPbTxt(path);
    }
    return result.then((arrayBuffer) => {
      return parseGraphPbTxt(arrayBuffer);
    })
}


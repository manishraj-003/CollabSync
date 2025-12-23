module.exports = function applyOperation(text, op) {
  switch (op.type) {
    case "insert": {
      return (
        text.slice(0, op.index) +
        op.text +
        text.slice(op.index)
      );
    }

    case "delete": {
      return (
        text.slice(0, op.index) +
        text.slice(op.index + op.length)
      );
    }

    case "replace": {
      return (
        text.slice(0, op.index) +
        op.text +
        text.slice(op.index + op.length)
      );
    }

    default:
      return text;
  }
};
